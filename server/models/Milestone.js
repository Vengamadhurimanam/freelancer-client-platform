const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: [
        'Not Started',
        'In Progress',
        'Submitted',
        'Approved',
        'Revision Required',
        'Completed',
      ],
      default: 'Not Started',
    },
    deliverable: {
      submittedAt: Date,
      files: [
        {
          name: String,
          url: String,
          fileType: String,
          size: Number,
        },
      ],
      githubUrl: String,
      demoUrl: String,
      notes: String,
    },
    clientFeedback: {
      reviewedAt: Date,
      notes: String,
      status: {
        type: String,
        enum: ['Approved', 'Revision Required', 'None'],
        default: 'None',
      },
    },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({ project: 1, order: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
