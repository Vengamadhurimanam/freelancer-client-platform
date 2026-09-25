const ClientProfile = require('../models/ClientProfile');
const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const FreelancerProfile = require('../models/FreelancerProfile');
const Notification = require('../models/Notification');
const { calculateSkillMatch } = require('../services/matchingService');

// @desc    Get current client profile
// @route   GET /api/clients/me
// @access  Private/Client
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await ClientProfile.findOne({ user: req.user.id }).populate(
      'user',
      'name email avatar isEmailVerified createdAt'
    );

    if (!profile) {
      profile = await ClientProfile.create({
        user: req.user.id,
        companyName: `${req.user.name}'s Company`,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client profile
// @route   PUT /api/clients/me
// @access  Private/Client
const updateProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      companyWebsite,
      industry,
      companySize,
      description,
      location,
      name,
      avatar,
    } = req.body;

    if (name || avatar) {
      await User.findByIdAndUpdate(req.user.id, {
        ...(name && { name }),
        ...(avatar && { avatar }),
      });
    }

    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        companyName,
        companyWebsite,
        industry,
        companySize,
        description,
        location,
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar isEmailVerified');

    return res.status(200).json({
      success: true,
      message: 'Client profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client dashboard statistics & recent activity
// @route   GET /api/clients/dashboard
// @access  Private/Client
const getDashboard = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments({ client: req.user.id });
    const activeProjects = await Project.countDocuments({
      client: req.user.id,
      status: { $in: ['Assigned', 'In Progress', 'Submitted', 'Proposal Review', 'Trial Task'] },
    });
    const completedProjects = await Project.countDocuments({
      client: req.user.id,
      status: 'Completed',
    });

    // Client's projects
    const myProjects = await Project.find({ client: req.user.id })
      .populate('assignedFreelancer', 'name avatar')
      .sort({ createdAt: -1 });

    const projectIds = myProjects.map((p) => p._id);

    const receivedProposalsCount = await Proposal.countDocuments({
      project: { $in: projectIds },
    });

    const pendingSelectionCount = await Proposal.countDocuments({
      project: { $in: projectIds },
      status: { $in: ['Pending', 'Shortlisted', 'Trial Task'] },
    });

    // Recent proposals
    const recentProposals = await Proposal.find({
      project: { $in: projectIds },
    })
      .populate('freelancer', 'name email avatar')
      .populate('project', 'title budget')
      .sort({ createdAt: -1 })
      .limit(6);

    // Active project list
    const activeProjectsList = myProjects.filter((p) =>
      ['Assigned', 'In Progress', 'Submitted', 'Trial Task'].includes(p.status)
    );

    // Recommended freelancers for the latest open project
    const latestOpenProject = myProjects.find((p) => p.status === 'Open' || p.status === 'Proposal Review');
    let recommendedFreelancers = [];

    if (latestOpenProject) {
      const candidates = await FreelancerProfile.find()
        .populate('user', 'name avatar email isActive')
        .limit(20);

      recommendedFreelancers = candidates
        .filter((c) => c.user && c.user.isActive)
        .map((freelancer) => {
          const match = calculateSkillMatch(latestOpenProject, freelancer);
          return {
            freelancer,
            matchPercentage: match.matchPercentage,
            matchedSkills: match.matchedSkills,
            missingSkills: match.missingSkills,
          };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5);
    }

    // Recent notifications
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        receivedProposals: receivedProposalsCount,
        pendingSelection: pendingSelectionCount,
      },
      activeProjects: activeProjectsList,
      recentProposals,
      recommendedFreelancers,
      latestProject: latestOpenProject || null,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  getDashboard,
};
