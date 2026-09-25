const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps & Cloud', 'Mobile', 'Full Stack', 'AI/ML', 'Design & UI/UX'],
      default: 'Frontend',
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Code',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedFreelancersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
