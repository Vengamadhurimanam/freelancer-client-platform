const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  codeSnippet: {
    type: String,
    default: '',
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Entry', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  points: {
    type: Number,
    default: 10,
  },
});

const assessmentSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: 'Comprehensive skill assessment test covering core principles, architecture, and practical coding scenarios.',
    },
    durationMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 60,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    questions: [questionSchema],
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
