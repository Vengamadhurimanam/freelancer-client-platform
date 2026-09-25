const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const TrialTask = require('../models/TrialTask');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Review = require('../models/Review');
const Report = require('../models/Report');

// @desc    Get comprehensive Admin dashboard metrics & chart time-series data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFreelancers = await User.countDocuments({ role: 'FREELANCER' });
    const totalClients = await User.countDocuments({ role: 'CLIENT' });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $in: ['Open', 'Proposal Review', 'Trial Task', 'Assigned', 'In Progress', 'Submitted'] },
    });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const totalProposals = await Proposal.countDocuments();
    const totalTrialTasks = await TrialTask.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalReports = await Report.countDocuments({ status: 'Pending' });

    // Count verified skills across freelancers
    const freelancerProfiles = await FreelancerProfile.find();
    let totalVerifiedSkills = 0;
    const skillCountMap = {};
    const verificationLevelCounts = { Expert: 0, Advanced: 0, Intermediate: 0, None: 0 };

    freelancerProfiles.forEach((fp) => {
      fp.skills.forEach((s) => {
        if (s.isVerified) {
          totalVerifiedSkills += 1;
          const level = s.verificationLevel || 'Intermediate';
          verificationLevelCounts[level] = (verificationLevelCounts[level] || 0) + 1;
        }
        skillCountMap[s.name] = (skillCountMap[s.name] || 0) + 1;
      });
    });

    // Skill popularity chart data
    const skillPopularity = Object.entries(skillCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Verification breakdown chart data
    const verificationStats = [
      { name: 'Expert (90-100%)', count: verificationLevelCounts.Expert, color: '#10b981' },
      { name: 'Advanced (80-89%)', count: verificationLevelCounts.Advanced, color: '#3b82f6' },
      { name: 'Intermediate (70-79%)', count: verificationLevelCounts.Intermediate, color: '#f59e0b' },
    ];

    // User growth & activity mockup for chart
    const userGrowthData = [
      { month: 'May', Freelancers: 18, Clients: 6, Projects: 12 },
      { month: 'Jun', Freelancers: 28, Clients: 11, Projects: 19 },
      { month: 'Jul', Freelancers: 42, Clients: 17, Projects: 28 },
      { month: 'Aug', Freelancers: 65, Clients: 26, Projects: 45 },
      { month: 'Sep', Freelancers: Math.max(totalFreelancers, 85), Clients: Math.max(totalClients, 34), Projects: Math.max(totalProjects, 58) },
    ];

    // Project status breakdown
    const projectsByStatus = [
      { status: 'Open', count: await Project.countDocuments({ status: 'Open' }) },
      { status: 'In Progress', count: await Project.countDocuments({ status: 'In Progress' }) },
      { status: 'Trial Task', count: await Project.countDocuments({ status: 'Trial Task' }) },
      { status: 'Completed', count: completedProjects },
    ];

    // Recent activity feeds
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentProjects = await Project.find().populate('client', 'name').sort({ createdAt: -1 }).limit(5);
    const recentReports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFreelancers,
        totalClients,
        totalProjects,
        activeProjects,
        completedProjects,
        totalProposals,
        totalTrialTasks,
        totalVerifiedSkills,
        totalSkills,
        pendingReports: totalReports,
      },
      charts: {
        userGrowthData,
        skillPopularity,
        verificationStats,
        projectsByStatus,
      },
      recent: {
        users: recentUsers,
        projects: recentProjects,
        reports: recentReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role filter, status filter, pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactive status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    await FreelancerProfile.findOneAndDelete({ user: req.params.id });
    await ClientProfile.findOneAndDelete({ user: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform projects for admin
// @route   GET /api/admin/projects
// @access  Private/Admin
const getAllProjects = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const projects = await Project.find(query)
      .populate('client', 'name email avatar')
      .populate('assignedFreelancer', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      projects,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  toggleUserActive,
  deleteUser,
  getAllProjects,
};
