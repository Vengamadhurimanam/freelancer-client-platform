const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Skill = require('../models/Skill');
const Notification = require('../models/Notification');
const { calculateSkillMatch } = require('../services/matchingService');

// @desc    Get current freelancer profile
// @route   GET /api/freelancers/me
// @access  Private/Freelancer
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar isEmailVerified createdAt')
      .populate('skills.skill');

    if (!profile) {
      profile = await FreelancerProfile.create({ user: req.user.id });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/freelancers/me
// @access  Private/Freelancer
const updateProfile = async (req, res, next) => {
  try {
    const {
      title,
      bio,
      hourlyRate,
      experienceLevel,
      yearsOfExperience,
      education,
      certifications,
      portfolio,
      github,
      linkedin,
      website,
      avatar,
      name,
    } = req.body;

    if (name || avatar) {
      await User.findByIdAndUpdate(req.user.id, {
        ...(name && { name }),
        ...(avatar && { avatar }),
      });
    }

    // Calculate profile completion score
    let completion = 40;
    if (title) completion += 10;
    if (bio && bio.length > 50) completion += 15;
    if (hourlyRate) completion += 5;
    if (github || linkedin || website) completion += 10;
    if (portfolio && portfolio.length > 0) completion += 10;
    if (education && education.length > 0) completion += 5;
    if (certifications && certifications.length > 0) completion += 5;

    const profile = await FreelancerProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        title,
        bio,
        hourlyRate,
        experienceLevel,
        yearsOfExperience,
        education,
        certifications,
        portfolio,
        github,
        linkedin,
        website,
        profileCompletion: Math.min(100, completion),
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar isEmailVerified');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add unverified skill to freelancer profile
// @route   POST /api/freelancers/me/skills
// @access  Private/Freelancer
const addSkill = async (req, res, next) => {
  try {
    const { skillName, category } = req.body;

    if (!skillName) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    let profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await FreelancerProfile.create({ user: req.user.id });
    }

    // Check if skill already exists in profile
    const exists = profile.skills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'This skill is already on your profile',
      });
    }

    // Check if skill exists in Skill master catalog
    let skillDoc = await Skill.findOne({ name: new RegExp(`^${skillName}$`, 'i') });

    profile.skills.push({
      skill: skillDoc ? skillDoc._id : null,
      name: skillName,
      category: category || (skillDoc ? skillDoc.category : 'Development'),
      isVerified: false,
      score: 0,
      verificationLevel: 'None',
    });

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Skill added to profile. Take the assessment to earn your Verified Badge!',
      skills: profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove skill from freelancer profile
// @route   DELETE /api/freelancers/me/skills/:skillName
// @access  Private/Freelancer
const removeSkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.skills = profile.skills.filter(
      (s) => s.name.toLowerCase() !== decodeURIComponent(skillName).toLowerCase()
    );

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Skill removed from profile',
      skills: profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single freelancer profile by user ID or profile ID
// @route   GET /api/freelancers/:id
// @access  Public
const getFreelancerById = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({
      $or: [{ user: req.params.id }, { _id: req.params.id }],
    })
      .populate('user', 'name email avatar createdAt')
      .populate('skills.skill');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found',
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

// @desc    Get all freelancers (search, filter, sort, pagination)
// @route   GET /api/freelancers
// @access  Public
const getAllFreelancers = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      experienceLevel,
      minRating,
      verifiedOnly,
      sort = 'rating',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    if (verifiedOnly === 'true') {
      query['skills.isVerified'] = true;
    }

    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    // Sort configuration
    let sortQuery = { averageRating: -1, completedProjects: -1 };
    if (sort === 'newest') sortQuery = { createdAt: -1 };
    if (sort === 'rate-low') sortQuery = { hourlyRate: 1 };
    if (sort === 'rate-high') sortQuery = { hourlyRate: -1 };
    if (sort === 'projects') sortQuery = { completedProjects: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    let profiles = await FreelancerProfile.find(query)
      .populate('user', 'name email avatar createdAt isActive')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    // Filter out deactivated users
    profiles = profiles.filter((p) => p.user && p.user.isActive);

    // If search term provided, filter by name or title or bio
    if (search) {
      const s = search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          (p.user && p.user.name.toLowerCase().includes(s)) ||
          p.title.toLowerCase().includes(s) ||
          p.bio.toLowerCase().includes(s) ||
          p.skills.some((sk) => sk.name.toLowerCase().includes(s))
      );
    }

    const total = await FreelancerProfile.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      freelancers: profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get freelancer dashboard stats & recommendations
// @route   GET /api/freelancers/dashboard
// @access  Private/Freelancer
const getDashboard = async (req, res, next) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const totalApplications = await Proposal.countDocuments({ freelancer: req.user.id });
    const activeProjectsCount = await Project.countDocuments({
      assignedFreelancer: req.user.id,
      status: { $in: ['Assigned', 'In Progress', 'Submitted'] },
    });
    const completedProjectsCount = await Project.countDocuments({
      assignedFreelancer: req.user.id,
      status: 'Completed',
    });

    const verifiedSkillsCount = profile.skills.filter((s) => s.isVerified).length;
    const totalSkillsCount = profile.skills.length;

    // Recent applications
    const recentApplications = await Proposal.find({ freelancer: req.user.id })
      .populate('project', 'title budget deadline status client')
      .populate({
        path: 'project',
        populate: { path: 'client', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Active projects
    const activeProjects = await Project.find({
      assignedFreelancer: req.user.id,
      status: { $in: ['Assigned', 'In Progress', 'Submitted'] },
    })
      .populate('client', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Calculate smart recommended projects based on verified & listed skills
    const openProjects = await Project.find({ status: 'Open' })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const recommendedProjects = openProjects
      .map((proj) => {
        const match = calculateSkillMatch(proj, profile);
        return {
          ...proj.toObject(),
          matchScore: match.matchPercentage,
          matchedSkills: match.matchedSkills,
        };
      })
      .filter((p) => p.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Recent notifications
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        activeProjects: activeProjectsCount,
        completedProjects: completedProjectsCount,
        verifiedSkillsCount,
        totalSkillsCount,
        averageRating: profile.averageRating,
        profileCompletion: profile.profileCompletion,
        totalReviews: profile.totalReviews,
      },
      recommendedProjects,
      recentApplications,
      activeProjects,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  addSkill,
  removeSkill,
  getFreelancerById,
  getAllFreelancers,
  getDashboard,
};
