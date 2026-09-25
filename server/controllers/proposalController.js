const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const FreelancerProfile = require('../models/FreelancerProfile');
const Notification = require('../models/Notification');
const { calculateSkillMatch } = require('../services/matchingService');

// @desc    Submit proposal for a project
// @route   POST /api/proposals
// @access  Private/Freelancer
const submitProposal = async (req, res, next) => {
  try {
    const {
      projectId,
      coverLetter,
      proposedBudget,
      estimatedDays,
      relevantExperience,
      portfolioLinks,
      attachments,
    } = req.body;

    if (!projectId || !coverLetter || !proposedBudget || !estimatedDays) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, cover letter, proposed budget, and estimated days',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.status !== 'Open' && project.status !== 'Proposal Review') {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting proposals',
      });
    }

    // Check if already submitted
    const existing = await Proposal.findOne({
      project: projectId,
      freelancer: req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this project',
      });
    }

    // Calculate smart match percentage
    const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id });
    const matchResult = freelancerProfile
      ? calculateSkillMatch(project, freelancerProfile)
      : { matchPercentage: 50 };

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user.id,
      coverLetter,
      proposedBudget: Number(proposedBudget),
      estimatedDays: Number(estimatedDays),
      relevantExperience: relevantExperience || '',
      portfolioLinks: portfolioLinks || [],
      attachments: attachments || [],
      skillMatchPercentage: matchResult.matchPercentage,
      status: 'Pending',
    });

    // Update project proposal count & status
    project.proposalCount = (project.proposalCount || 0) + 1;
    if (project.status === 'Open') {
      project.status = 'Proposal Review';
    }
    await project.save();

    // Create notification for client
    await Notification.create({
      recipient: project.client,
      sender: req.user.id,
      type: 'proposal_submitted',
      title: 'New Proposal Received',
      message: `${req.user.name} submitted a proposal (${matchResult.matchPercentage}% skill match) for "${project.title}"`,
      link: `/client/projects/${project._id}`,
      referenceId: proposal._id,
      referenceModel: 'Proposal',
    });

    return res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      proposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all proposals for a specific project
// @route   GET /api/proposals/project/:projectId
// @access  Private/Client/Admin
const getProjectProposals = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these proposals' });
    }

    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate('freelancer', 'name email avatar')
      .sort({ skillMatchPercentage: -1, createdAt: -1 });

    // Attach freelancer profile data
    const enhancedProposals = await Promise.all(
      proposals.map(async (prop) => {
        const profile = await FreelancerProfile.findOne({ user: prop.freelancer._id });
        return {
          ...prop.toObject(),
          freelancerProfile: profile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enhancedProposals.length,
      proposals: enhancedProposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current freelancer's submitted proposals
// @route   GET /api/proposals/my-proposals
// @access  Private/Freelancer
const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate('project', 'title budget deadline status client category')
      .populate({
        path: 'project',
        populate: { path: 'client', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update proposal status (Shortlist, Reject, etc.)
// @route   PATCH /api/proposals/:id/status
// @access  Private/Client
const updateProposalStatus = async (req, res, next) => {
  try {
    const { status, clientNotes } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('project');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (
      proposal.project.client.toString() !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    proposal.status = status;
    if (clientNotes) proposal.clientNotes = clientNotes;
    await proposal.save();

    // Send notification to freelancer
    let notifType = 'proposal_shortlisted';
    let notifTitle = 'Proposal Update';
    let notifMessage = `Your proposal for "${proposal.project.title}" has been updated to: ${status}`;

    if (status === 'Shortlisted') {
      notifType = 'proposal_shortlisted';
      notifTitle = 'Proposal Shortlisted!';
      notifMessage = `Great news! You have been shortlisted for "${proposal.project.title}".`;
    } else if (status === 'Rejected') {
      notifType = 'proposal_rejected';
      notifTitle = 'Proposal Update';
      notifMessage = `Your proposal for "${proposal.project.title}" was not selected at this time.`;
    }

    await Notification.create({
      recipient: proposal.freelancer,
      sender: req.user.id,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      link: `/freelancer/proposals`,
      referenceId: proposal._id,
      referenceModel: 'Proposal',
    });

    return res.status(200).json({
      success: true,
      message: `Proposal status updated to ${status}`,
      proposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single proposal
// @route   GET /api/proposals/:id
// @access  Private
const getProposalById = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('project')
      .populate('freelancer', 'name email avatar');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    return res.status(200).json({
      success: true,
      proposal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
  getProposalById,
};
