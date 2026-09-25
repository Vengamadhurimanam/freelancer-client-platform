const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Milestone = require('../models/Milestone');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Notification = require('../models/Notification');
const { calculateSkillMatch } = require('../services/matchingService');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Client
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      budget,
      deadline,
      experienceRequired,
      projectType,
      attachments,
    } = req.body;

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, budget, and deadline',
      });
    }

    const project = await Project.create({
      client: req.user.id,
      title,
      description,
      category: category || 'Web Development',
      requiredSkills: requiredSkills || [],
      budget: {
        amount: typeof budget === 'object' ? budget.amount : Number(budget),
        type: typeof budget === 'object' ? budget.type || 'Fixed' : 'Fixed',
      },
      deadline: new Date(deadline),
      experienceRequired: experienceRequired || 'Intermediate',
      projectType: projectType || 'One-Time Project',
      attachments: attachments || [],
      status: 'Open',
    });

    // Update client profile metrics
    await ClientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { totalProjectsPosted: 1, activeProjects: 1 } }
    );

    return res.status(201).json({
      success: true,
      message: 'Project posted successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (public discovery with search, filters, sorting, pagination)
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      category,
      minBudget,
      maxBudget,
      experience,
      projectType,
      status = 'Open',
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (experience) {
      query.experienceRequired = experience;
    }

    if (projectType) {
      query.projectType = projectType;
    }

    if (minBudget || maxBudget) {
      query['budget.amount'] = {};
      if (minBudget) query['budget.amount'].$gte = Number(minBudget);
      if (maxBudget) query['budget.amount'].$lte = Number(maxBudget);
    }

    if (skill) {
      query['requiredSkills.name'] = { $regex: skill, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'requiredSkills.name': { $regex: search, $options: 'i' } },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'budget-high') sortQuery = { 'budget.amount': -1 };
    if (sort === 'budget-low') sortQuery = { 'budget.amount': 1 };
    if (sort === 'deadline') sortQuery = { deadline: 1 };
    if (sort === 'proposals') sortQuery = { proposalCount: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(query)
      .populate('client', 'name avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    // If user is a logged-in freelancer, compute skill match for each project
    let processedProjects = projects.map((p) => p.toObject());
    if (req.user && req.user.role === 'FREELANCER') {
      const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id });
      if (freelancerProfile) {
        processedProjects = processedProjects.map((p) => {
          const match = calculateSkillMatch(p, freelancerProfile);
          return {
            ...p,
            matchPercentage: match.matchPercentage,
            matchedSkills: match.matchedSkills,
          };
        });

        if (sort === 'match') {
          processedProjects.sort((a, b) => b.matchPercentage - a.matchPercentage);
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: processedProjects.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      projects: processedProjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with match score for current user
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email avatar createdAt')
      .populate('assignedFreelancer', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Increment view count
    project.viewsCount = (project.viewsCount || 0) + 1;
    await project.save({ timestamps: false });

    let clientProfile = await ClientProfile.findOne({ user: project.client._id });

    let projectObj = project.toObject();
    projectObj.clientProfile = clientProfile;

    // Check if freelancer has already applied or match percentage
    if (req.user && req.user.role === 'FREELANCER') {
      const existingProposal = await Proposal.findOne({
        project: project._id,
        freelancer: req.user.id,
      });

      const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id });
      const match = freelancerProfile ? calculateSkillMatch(project, freelancerProfile) : null;

      projectObj.userProposal = existingProposal;
      projectObj.skillMatch = match;
    }

    return res.status(200).json({
      success: true,
      project: projectObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Client/Admin
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (
      project.client.toString() !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('client', 'name avatar');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Client/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (
      project.client.toString() !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Proposal.deleteMany({ project: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client's owned projects
// @route   GET /api/projects/my-projects
// @access  Private/Client
const getMyProjects = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { client: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('assignedFreelancer', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended freelancers for a specific project
// @route   GET /api/projects/:id/recommended-freelancers
// @access  Private/Client
const getRecommendedFreelancers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const freelancers = await FreelancerProfile.find()
      .populate('user', 'name email avatar isActive')
      .populate('skills.skill');

    const ranked = freelancers
      .filter((f) => f.user && f.user.isActive)
      .map((freelancer) => {
        const match = calculateSkillMatch(project, freelancer);
        return {
          freelancer,
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.status(200).json({
      success: true,
      count: ranked.length,
      recommendations: ranked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign freelancer to project and create initial workspace milestones
// @route   POST /api/projects/:id/assign
// @access  Private/Client
const assignFreelancer = async (req, res, next) => {
  try {
    const { freelancerId, proposalId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    project.assignedFreelancer = freelancerId;
    project.status = 'Assigned';
    await project.save();

    // Accept proposal if proposalId provided
    if (proposalId) {
      await Proposal.findByIdAndUpdate(proposalId, { status: 'Accepted' });
      // Mark others as rejected or keep shortlisted
      await Proposal.updateMany(
        { project: project._id, _id: { $ne: proposalId } },
        { status: 'Rejected' }
      );
    }

    // Update freelancer stats
    await FreelancerProfile.findOneAndUpdate(
      { user: freelancerId },
      { $inc: { activeProjects: 1 } }
    );

    // Create default milestone if none exist
    const existingMilestones = await Milestone.find({ project: project._id });
    if (existingMilestones.length === 0) {
      await Milestone.create({
        project: project._id,
        title: 'Initial Deliverable & Architecture Setup',
        description: 'Complete setup, architecture blueprint, and primary feature delivery.',
        dueDate: project.deadline,
        amount: project.budget.amount,
        status: 'In Progress',
        order: 1,
      });
    }

    // Send notification
    await Notification.create({
      recipient: freelancerId,
      sender: req.user.id,
      type: 'freelancer_selected',
      title: 'Hired for Project!',
      message: `Congratulations! You have been selected for project: "${project.title}". Workspace is now active.`,
      link: `/project/${project._id}`,
      referenceId: project._id,
      referenceModel: 'Project',
    });

    return res.status(200).json({
      success: true,
      message: 'Freelancer assigned successfully. Workspace initialized.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  getRecommendedFreelancers,
  assignFreelancer,
};
