const mongoose = require('mongoose');

const trialTaskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Trial task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Trial task description is required'],
    },
    deadline: {
      type: Date,
      required: true,
    },
    requirements: [
      {
        type: String,
      },
    ],
    evaluationCriteria: [
      {
        type: String,
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['Assigned', 'Accepted', 'Submitted', 'Approved', 'Rejected'],
      default: 'Assigned',
    },
    submission: {
      submittedAt: Date,
      githubUrl: String,
      demoUrl: String,
      explanation: String,
      attachments: [
        {
          name: String,
          url: String,
        },
      ],
    },
    reviewFeedback: {
      reviewedAt: Date,
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      comment: String,
      decision: {
        type: String,
        enum: ['Approved', 'Rejected', 'Pending'],
        default: 'Pending',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrialTask', trialTaskSchema);
