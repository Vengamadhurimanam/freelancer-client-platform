const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      default: 'Web Development',
    },
    requiredSkills: [
      {
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          default: 'Development',
        },
        importance: {
          type: String,
          enum: ['Required', 'Preferred', 'Bonus'],
          default: 'Required',
        },
      },
    ],
    budget: {
      amount: {
        type: Number,
        required: true,
        min: 50,
      },
      type: {
        type: String,
        enum: ['Fixed', 'Hourly'],
        default: 'Fixed',
      },
    },
    deadline: {
      type: Date,
      required: true,
    },
    experienceRequired: {
      type: String,
      enum: ['Entry', 'Intermediate', 'Expert'],
      default: 'Intermediate',
    },
    projectType: {
      type: String,
      enum: ['One-Time Project', 'Ongoing Work', 'Complex System'],
      default: 'One-Time Project',
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: [
        'Open',
        'Proposal Review',
        'Trial Task',
        'Assigned',
        'In Progress',
        'Submitted',
        'Completed',
        'Cancelled',
      ],
      default: 'Open',
    },
    proposalCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ 'requiredSkills.name': 1 });
projectSchema.index({ 'budget.amount': 1 });

module.exports = mongoose.model('Project', projectSchema);
