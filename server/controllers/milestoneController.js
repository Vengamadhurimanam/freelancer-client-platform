const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Notification = require('../models/Notification');

// @desc    Create a new milestone for project
// @route   POST /api/milestones
// @access  Private/Client
const createMilestone = async (req, res, next) => {
  try {
    const { projectId, title, description, dueDate, amount, order } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const count = await Milestone.countDocuments({ project: projectId });

    const milestone = await Milestone.create({
      project: projectId,
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      amount: Number(amount),
      order: order || count + 1,
      status: 'Not Started',
    });

    // Notify freelancer if assigned
    if (project.assignedFreelancer) {
      await Notification.create({
        recipient: project.assignedFreelancer,
        sender: req.user.id,
        type: 'milestone_created',
        title: 'New Milestone Created',
        message: `A new milestone "${title}" ($${amount}) has been created for "${project.title}"`,
        link: `/project/${project._id}`,
        referenceId: milestone._id,
        referenceModel: 'Milestone',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestones for project
// @route   GET /api/milestones/project/:projectId
// @access  Private
const getProjectMilestones = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access check: Client or Assigned Freelancer or Admin
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.assignedFreelancer && project.assignedFreelancer.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view project milestones' });
    }

    const milestones = await Milestone.find({ project: req.params.projectId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: milestones.length,
      milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone status (Submit deliverable, Approve, Request Revision)
// @route   PATCH /api/milestones/:id/status
// @access  Private
const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status, deliverable, feedbackNotes } = req.body;
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    const project = await Project.findById(milestone.project);
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.assignedFreelancer && project.assignedFreelancer.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    // Freelancer actions: Start work, Submit deliverable
    if (status === 'In Progress' && (isFreelancer || isClient || isAdmin)) {
      milestone.status = 'In Progress';
      if (project.status === 'Assigned') {
        project.status = 'In Progress';
        await project.save();
      }
    } else if (status === 'Submitted' && (isFreelancer || isAdmin)) {
      milestone.status = 'Submitted';
      milestone.deliverable = {
        submittedAt: new Date(),
        files: deliverable?.files || [],
        githubUrl: deliverable?.githubUrl || '',
        demoUrl: deliverable?.demoUrl || '',
        notes: deliverable?.notes || '',
      };

      // Notify client
      await Notification.create({
        recipient: project.client,
        sender: req.user.id,
        type: 'milestone_submitted',
        title: 'Milestone Deliverable Submitted',
        message: `${req.user.name} submitted work for milestone: "${milestone.title}"`,
        link: `/project/${project._id}`,
        referenceId: milestone._id,
        referenceModel: 'Milestone',
      });
    }
    // Client actions: Approve, Request Revision
    else if (status === 'Approved' && (isClient || isAdmin)) {
      milestone.status = 'Approved';
      milestone.clientFeedback = {
        reviewedAt: new Date(),
        notes: feedbackNotes || 'Approved. Great work!',
        status: 'Approved',
      };

      // Check if all milestones for project are approved
      const allMilestones = await Milestone.find({ project: project._id });
      const areAllApproved = allMilestones.every(
        (m) => m._id.toString() === milestone._id.toString() || m.status === 'Approved' || m.status === 'Completed'
      );

      if (areAllApproved) {
        project.status = 'Completed';
        project.completedAt = new Date();
        await project.save();

        // Update freelancer profile stats
        await FreelancerProfile.findOneAndUpdate(
          { user: project.assignedFreelancer },
          {
            $inc: { completedProjects: 1, activeProjects: -1 },
          }
        );

        // Update client profile stats
        await ClientProfile.findOneAndUpdate(
          { user: project.client },
          {
            $inc: { completedProjects: 1, activeProjects: -1, totalSpent: project.budget.amount },
          }
        );

        // Notify freelancer
        await Notification.create({
          recipient: project.assignedFreelancer,
          sender: req.user.id,
          type: 'project_completed',
          title: 'Project Completed! 🏆',
          message: `All milestones for "${project.title}" are approved and project is completed! Leave a review for the client.`,
          link: `/project/${project._id}`,
          referenceId: project._id,
          referenceModel: 'Project',
        });
      } else {
        await Notification.create({
          recipient: project.assignedFreelancer,
          sender: req.user.id,
          type: 'milestone_approved',
          title: 'Milestone Approved',
          message: `Milestone "${milestone.title}" has been approved by the client!`,
          link: `/project/${project._id}`,
          referenceId: milestone._id,
          referenceModel: 'Milestone',
        });
      }
    } else if (status === 'Revision Required' && (isClient || isAdmin)) {
      milestone.status = 'Revision Required';
      milestone.clientFeedback = {
        reviewedAt: new Date(),
        notes: feedbackNotes || 'Revision required. Please review details.',
        status: 'Revision Required',
      };

      await Notification.create({
        recipient: project.assignedFreelancer,
        sender: req.user.id,
        type: 'revision_requested',
        title: 'Milestone Revision Requested',
        message: `Client requested revisions for milestone: "${milestone.title}"`,
        link: `/project/${project._id}`,
        referenceId: milestone._id,
        referenceModel: 'Milestone',
      });
    } else {
      milestone.status = status;
    }

    await milestone.save();

    return res.status(200).json({
      success: true,
      message: `Milestone status updated to ${milestone.status}`,
      milestone,
      projectStatus: project.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private/Client
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    const project = await Project.findById(milestone.project);
    if (project.client.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Milestone.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getProjectMilestones,
  updateMilestoneStatus,
  deleteMilestone,
};
