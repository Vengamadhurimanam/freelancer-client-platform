const Review = require('../models/Review');
const Project = require('../models/Project');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Notification = require('../models/Notification');

// @desc    Submit review for a completed project
// @route   POST /api/reviews
// @access  Private
const submitReview = async (req, res, next) => {
  try {
    const { projectId, categories, comment } = req.body;

    if (!projectId || !categories || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, rating categories, and review comment',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed projects',
      });
    }

    // Check if user is participant
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.assignedFreelancer && project.assignedFreelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: 'Only the client and assigned freelancer can review this project',
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user.id,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this project',
      });
    }

    const revieweeId = isClient ? project.assignedFreelancer : project.client;
    const reviewerRole = isClient ? 'CLIENT' : 'FREELANCER';

    // Calculate overall rating from categories
    const { communication, quality, timeliness, professionalism } = categories;
    const overallRating = Number(
      ((Number(communication) + Number(quality) + Number(timeliness) + Number(professionalism)) / 4).toFixed(1)
    );

    const review = await Review.create({
      project: projectId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      reviewerRole,
      rating: overallRating,
      categories: {
        communication: Number(communication),
        quality: Number(quality),
        timeliness: Number(timeliness),
        professionalism: Number(professionalism),
      },
      comment,
    });

    // Update target profile average rating and review counts
    if (reviewerRole === 'CLIENT') {
      // Reviewing Freelancer
      const allFreelancerReviews = await Review.find({ reviewee: revieweeId });
      const avg =
        allFreelancerReviews.reduce((sum, r) => sum + r.rating, 0) / allFreelancerReviews.length;

      const avgComm =
        allFreelancerReviews.reduce((sum, r) => sum + r.categories.communication, 0) /
        allFreelancerReviews.length;
      const avgQual =
        allFreelancerReviews.reduce((sum, r) => sum + r.categories.quality, 0) /
        allFreelancerReviews.length;
      const avgTime =
        allFreelancerReviews.reduce((sum, r) => sum + r.categories.timeliness, 0) /
        allFreelancerReviews.length;
      const avgProf =
        allFreelancerReviews.reduce((sum, r) => sum + r.categories.professionalism, 0) /
        allFreelancerReviews.length;

      await FreelancerProfile.findOneAndUpdate(
        { user: revieweeId },
        {
          averageRating: Number(avg.toFixed(1)),
          totalReviews: allFreelancerReviews.length,
          ratingBreakdown: {
            communication: Number(avgComm.toFixed(1)),
            quality: Number(avgQual.toFixed(1)),
            timeliness: Number(avgTime.toFixed(1)),
            professionalism: Number(avgProf.toFixed(1)),
          },
        }
      );
    } else {
      // Reviewing Client
      const allClientReviews = await Review.find({ reviewee: revieweeId });
      const avg =
        allClientReviews.reduce((sum, r) => sum + r.rating, 0) / allClientReviews.length;

      await ClientProfile.findOneAndUpdate(
        { user: revieweeId },
        {
          averageRating: Number(avg.toFixed(1)),
          totalReviews: allClientReviews.length,
        }
      );
    }

    // Notify reviewee
    await Notification.create({
      recipient: revieweeId,
      sender: req.user.id,
      type: 'new_review',
      title: 'New Review Received ⭐',
      message: `${req.user.name} left you a ${overallRating}-star review for "${project.title}"!`,
      link: isClient ? `/freelancer/profile` : `/client/profile`,
      referenceId: review._id,
      referenceModel: 'Review',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar role')
      .populate('project', 'title');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar role')
      .populate('project', 'title category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('reviewer', 'name email avatar')
      .populate('reviewee', 'name email avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getUserReviews,
  getAllReviews,
};
