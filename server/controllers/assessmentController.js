const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const FreelancerProfile = require('../models/FreelancerProfile');
const Skill = require('../models/Skill');
const Notification = require('../models/Notification');

// @desc    Get assessment questions for taking the test
// @route   GET /api/assessments/skill/:skillIdOrName
// @access  Private/Freelancer
const getAssessmentBySkill = async (req, res, next) => {
  try {
    const { skillIdOrName } = req.params;

    let skill = await Skill.findOne({
      $or: [{ _id: skillIdOrName.match(/^[0-9a-fA-F]{24}$/) ? skillIdOrName : null }, { name: new RegExp(`^${skillIdOrName}$`, 'i') }],
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found in catalog',
      });
    }

    const assessment = await Assessment.findOne({ skill: skill._id, isActive: true }).populate('skill');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `Assessment for ${skill.name} is currently being prepared. Check back soon!`,
      });
    }

    // Sanitize questions: strip correctOptionIndex and explanation so client cannot cheat
    const sanitizedQuestions = assessment.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options,
      difficulty: q.difficulty,
      points: q.points,
    }));

    return res.status(200).json({
      success: true,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        durationMinutes: assessment.durationMinutes,
        passingScore: assessment.passingScore,
        skill: assessment.skill,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment answers & auto-grade
// @route   POST /api/assessments/:id/submit
// @access  Private/Freelancer
const submitAssessment = async (req, res, next) => {
  try {
    const { answers, timeSpentSeconds } = req.body;
    const assessment = await Assessment.findById(req.params.id).populate('skill');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    let earnedPoints = 0;
    let totalPossiblePoints = 0;
    const gradedAnswers = [];

    assessment.questions.forEach((question) => {
      const qPoints = question.points || 10;
      totalPossiblePoints += qPoints;

      const userAnswer = answers && answers.find((a) => a.questionId.toString() === question._id.toString());
      const selectedIndex = userAnswer ? userAnswer.selectedOption : -1;
      const isCorrect = selectedIndex === question.correctOptionIndex;

      if (isCorrect) {
        earnedPoints += qPoints;
      }

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        selectedOption: selectedIndex,
        isCorrect,
        explanation: question.explanation,
      });
    });

    const calculatedScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
    const passed = calculatedScore >= assessment.passingScore;

    // Determine verification level
    let verificationLevel = 'None';
    if (calculatedScore >= 90) {
      verificationLevel = 'Expert';
    } else if (calculatedScore >= 80) {
      verificationLevel = 'Advanced';
    } else if (calculatedScore >= 70) {
      verificationLevel = 'Intermediate';
    }

    // Save assessment attempt log
    const attempt = await AssessmentAttempt.create({
      freelancer: req.user.id,
      skill: assessment.skill._id,
      assessment: assessment._id,
      score: calculatedScore,
      passed,
      verificationLevel,
      answers: gradedAnswers.map((g) => ({
        questionId: g.questionId,
        selectedOption: g.selectedOption,
        isCorrect: g.isCorrect,
      })),
      timeSpentSeconds: timeSpentSeconds || 0,
    });

    // Update Freelancer Profile Skill
    let profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await FreelancerProfile.create({ user: req.user.id });
    }

    const skillIndex = profile.skills.findIndex(
      (s) => s.name.toLowerCase() === assessment.skill.name.toLowerCase()
    );

    if (skillIndex > -1) {
      // If new score is higher or previously unverified, update it
      const currentScore = profile.skills[skillIndex].score || 0;
      if (calculatedScore >= currentScore || !profile.skills[skillIndex].isVerified) {
        profile.skills[skillIndex].isVerified = passed;
        profile.skills[skillIndex].score = Math.max(currentScore, calculatedScore);
        profile.skills[skillIndex].verificationLevel = verificationLevel;
        profile.skills[skillIndex].verifiedAt = passed ? new Date() : profile.skills[skillIndex].verifiedAt;
      }
      profile.skills[skillIndex].attemptsCount = (profile.skills[skillIndex].attemptsCount || 0) + 1;
    } else {
      profile.skills.push({
        skill: assessment.skill._id,
        name: assessment.skill.name,
        category: assessment.skill.category,
        isVerified: passed,
        score: calculatedScore,
        verificationLevel,
        verifiedAt: passed ? new Date() : null,
        attemptsCount: 1,
      });
    }

    await profile.save();

    // Increment stats in Assessment and Skill
    assessment.totalAttempts = (assessment.totalAttempts || 0) + 1;
    await assessment.save();

    if (passed) {
      await Skill.findByIdAndUpdate(assessment.skill._id, {
        $inc: { verifiedFreelancersCount: 1 },
      });

      // Send congratulations notification
      await Notification.create({
        recipient: req.user.id,
        type: 'system_alert',
        title: 'Skill Verified! 🎉',
        message: `Congratulations! You scored ${calculatedScore}% in ${assessment.skill.name} and earned the "${verificationLevel} Verified" Badge!`,
        link: '/freelancer/profile',
      });
    }

    return res.status(200).json({
      success: true,
      result: {
        score: calculatedScore,
        passed,
        verificationLevel,
        earnedPoints,
        totalPossiblePoints,
        skillName: assessment.skill.name,
        attemptId: attempt._id,
        gradedQuestions: gradedAnswers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available assessments list with user completion status
// @route   GET /api/assessments
// @access  Public
const getAllAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ isActive: true })
      .populate('skill')
      .select('-questions.correctOptionIndex -questions.explanation');

    let userAttempts = [];
    if (req.user && req.user.role === 'FREELANCER') {
      userAttempts = await AssessmentAttempt.find({ freelancer: req.user.id }).sort({ completedAt: -1 });
    }

    const enhanced = assessments.map((ass) => {
      const bestAttempt = userAttempts.find(
        (att) => att.skill.toString() === (ass.skill ? ass.skill._id.toString() : '')
      );
      return {
        ...ass.toObject(),
        userAttempt: bestAttempt || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: enhanced.length,
      assessments: enhanced,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private/Admin
const createAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private/Admin
const updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private/Admin
const deleteAssessment = async (req, res, next) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's assessment attempts
// @route   GET /api/assessments/my-attempts
// @access  Private/Freelancer
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ freelancer: req.user.id })
      .populate('skill')
      .populate('assessment', 'title')
      .sort({ completedAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessmentBySkill,
  submitAssessment,
  getAllAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getMyAttempts,
};
