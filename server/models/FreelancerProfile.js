const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'Full Stack Developer',
      trim: true,
    },
    bio: {
      type: String,
      default: 'Passionate developer dedicated to delivering high-quality, verified software solutions.',
      maxlength: 2000,
    },
    hourlyRate: {
      type: Number,
      default: 45,
      min: 5,
      max: 500,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Intermediate', 'Expert'],
      default: 'Intermediate',
    },
    yearsOfExperience: {
      type: Number,
      default: 3,
    },
    skills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
        },
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          default: 'Development',
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
        verificationLevel: {
          type: String,
          enum: ['Expert', 'Advanced', 'Intermediate', 'None'],
          default: 'None',
        },
        verifiedAt: {
          type: Date,
        },
        attemptsCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        year: Number,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        url: String,
      },
    ],
    portfolio: [
      {
        title: String,
        description: String,
        projectUrl: String,
        githubUrl: String,
        imageUrl: String,
        technologies: [String],
      },
    ],
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    activeProjects: {
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
    ratingBreakdown: {
      communication: { type: Number, default: 5.0 },
      quality: { type: Number, default: 5.0 },
      timeliness: { type: Number, default: 5.0 },
      professionalism: { type: Number, default: 5.0 },
    },
    profileCompletion: {
      type: Number,
      default: 75,
    },
  },
  {
    timestamps: true,
  }
);

freelancerProfileSchema.index({ 'skills.name': 1 });
freelancerProfileSchema.index({ averageRating: -1 });
freelancerProfileSchema.index({ completedProjects: -1 });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
