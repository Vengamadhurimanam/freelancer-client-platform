const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    verificationLevel: {
      type: String,
      enum: ['Expert', 'Advanced', 'Intermediate', 'None'],
      required: true,
    },
    answers: [
      {
        questionId: String,
        selectedOption: Number,
        isCorrect: Boolean,
      },
    ],
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

assessmentAttemptSchema.index({ freelancer: 1, skill: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
