const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      default: 'Individual Client',
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Technology & Software',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10',
    },
    description: {
      type: String,
      default: 'Looking for verified technical talent to collaborate on high-impact projects.',
    },
    location: {
      type: String,
      default: 'Remote',
    },
    totalProjectsPosted: {
      type: Number,
      default: 0,
    },
    activeProjects: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClientProfile', clientProfileSchema);
