const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      minlength: 30,
    },
    proposedBudget: {
      type: Number,
      required: [true, 'Proposed budget is required'],
      min: 10,
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated completion days is required'],
      min: 1,
    },
    relevantExperience: {
      type: String,
      default: '',
    },
    portfolioLinks: [
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
    skillMatchPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Trial Task', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    clientNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
