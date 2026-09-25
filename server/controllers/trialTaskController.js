const TrialTask = require('../models/TrialTask');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');

// @desc    Create and assign a trial task to a freelancer
// @route   POST /api/trial-tasks
// @access  Private/Client
const createTrialTask = async (req, res, next) => {
  try {
    const {
      projectId,
      proposalId,
      freelancerId,
      title,
      description,
      deadline,
      requirements,
      evaluationCriteria,
      attachments,
    } = req.body;

    if (!projectId || !proposalId || !freelancerId || !title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields for trial task',
      });
    }

    const project = await Project.findById(projectId);
    if (!project || project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this project' });
    }

    const trialTask = await TrialTask.create({
      project: projectId,
      proposal: proposalId,
      client: req.user.id,
      freelancer: freelancerId,
      title,
      description,
      deadline: new Date(deadline),
      requirements: requirements || [],
      evaluationCriteria: evaluationCriteria || [],
      attachments: attachments || [],
      status: 'Assigned',
    });

    // Update proposal and project status
    await Proposal.findByIdAndUpdate(proposalId, { status: 'Trial Task' });
    if (project.status === 'Open' || project.status === 'Proposal Review') {
      project.status = 'Trial Task';
      await project.save();
    }

    // Send notification to freelancer
    await Notification.create({
      recipient: freelancerId,
      sender: req.user.id,
      type: 'trial_task_assigned',
      title: 'Trial Task Assigned',
      message: `You have been assigned a trial task for "${project.title}": "${title}"`,
      link: `/freelancer/trial-tasks`,
      referenceId: trialTask._id,
      referenceModel: 'TrialTask',
    });

    return res.status(201).json({
      success: true,
      message: 'Trial task assigned to freelancer successfully',
      trialTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trial task by ID
// @route   GET /api/trial-tasks/:id
// @access  Private
const getTrialTaskById = async (req, res, next) => {
  try {
    const trialTask = await TrialTask.findById(req.params.id)
      .populate('project', 'title budget deadline category')
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar');

    if (!trialTask) {
      return res.status(404).json({ success: false, message: 'Trial task not found' });
    }

    // Authorization check
    const isAuthorized =
      trialTask.client._id.toString() === req.user.id ||
      trialTask.freelancer._id.toString() === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this trial task' });
    }

    return res.status(200).json({
      success: true,
      trialTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Freelancer accepts trial task
// @route   PATCH /api/trial-tasks/:id/accept
// @access  Private/Freelancer
const acceptTrialTask = async (req, res, next) => {
  try {
    const trialTask = await TrialTask.findById(req.params.id).populate('project');

    if (!trialTask) {
      return res.status(404).json({ success: false, message: 'Trial task not found' });
    }

    if (trialTask.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trialTask.status = 'Accepted';
    await trialTask.save();

    return res.status(200).json({
      success: true,
      message: 'Trial task accepted',
      trialTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Freelancer submits trial task work
// @route   POST /api/trial-tasks/:id/submit
// @access  Private/Freelancer
const submitTrialTask = async (req, res, next) => {
  try {
    const { githubUrl, demoUrl, explanation, attachments } = req.body;
    const trialTask = await TrialTask.findById(req.params.id).populate('project');

    if (!trialTask) {
      return res.status(404).json({ success: false, message: 'Trial task not found' });
    }

    if (trialTask.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trialTask.submission = {
      submittedAt: new Date(),
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      explanation: explanation || '',
      attachments: attachments || [],
    };
    trialTask.status = 'Submitted';
    await trialTask.save();

    // Notify client
    await Notification.create({
      recipient: trialTask.client,
      sender: req.user.id,
      type: 'trial_task_submitted',
      title: 'Trial Task Submitted',
      message: `${req.user.name} submitted their trial task for "${trialTask.project.title}"`,
      link: `/client/projects/${trialTask.project._id}`,
      referenceId: trialTask._id,
      referenceModel: 'TrialTask',
    });

    return res.status(200).json({
      success: true,
      message: 'Trial task submitted successfully! The client will review your work.',
      trialTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Client reviews trial task (Approve/Reject with feedback)
// @route   POST /api/trial-tasks/:id/review
// @access  Private/Client
const reviewTrialTask = async (req, res, next) => {
  try {
    const { decision, score, comment } = req.body; // decision: 'Approved' | 'Rejected'
    const trialTask = await TrialTask.findById(req.params.id).populate('project');

    if (!trialTask) {
      return res.status(404).json({ success: false, message: 'Trial task not found' });
    }

    if (trialTask.client.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trialTask.reviewFeedback = {
      reviewedAt: new Date(),
      score: Number(score) || 85,
      comment: comment || '',
      decision: decision || 'Approved',
    };
    trialTask.status = decision === 'Approved' ? 'Approved' : 'Rejected';
    await trialTask.save();

    // Update proposal
    if (decision === 'Approved') {
      await Proposal.findByIdAndUpdate(trialTask.proposal, { status: 'Shortlisted' });
    } else {
      await Proposal.findByIdAndUpdate(trialTask.proposal, { status: 'Rejected' });
    }

    // Notify freelancer
    await Notification.create({
      recipient: trialTask.freelancer,
      sender: req.user.id,
      type: decision === 'Approved' ? 'trial_task_approved' : 'trial_task_rejected',
      title: `Trial Task ${decision}`,
      message: `Your trial task for "${trialTask.project.title}" was ${decision.toLowerCase()} with a score of ${score || 85}/100!`,
      link: `/freelancer/trial-tasks`,
      referenceId: trialTask._id,
      referenceModel: 'TrialTask',
    });

    return res.status(200).json({
      success: true,
      message: `Trial task evaluation submitted (${decision})`,
      trialTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trial tasks for freelancer
// @route   GET /api/trial-tasks/freelancer/my-tasks
// @access  Private/Freelancer
const getMyTrialTasks = async (req, res, next) => {
  try {
    const tasks = await TrialTask.find({ freelancer: req.user.id })
      .populate('project', 'title budget deadline')
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trial tasks for client
// @route   GET /api/trial-tasks/client/my-tasks
// @access  Private/Client
const getClientTrialTasks = async (req, res, next) => {
  try {
    const tasks = await TrialTask.find({ client: req.user.id })
      .populate('project', 'title budget deadline')
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrialTask,
  getTrialTaskById,
  acceptTrialTask,
  submitTrialTask,
  reviewTrialTask,
  getMyTrialTasks,
  getClientTrialTasks,
};
