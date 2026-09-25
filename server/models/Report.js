const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['User', 'Project', 'Proposal', 'Message'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Spam or Scam',
        'Inappropriate Content',
        'Harassment or Abuse',
        'Skill Misrepresentation',
        'Non-Payment / Breach of Agreement',
        'Plagiarism',
        'Other',
      ],
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    evidence: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Investigating', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
