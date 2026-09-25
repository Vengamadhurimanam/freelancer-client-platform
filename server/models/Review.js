const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['CLIENT', 'FREELANCER'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    categories: {
      communication: { type: Number, required: true, min: 1, max: 5 },
      quality: { type: Number, required: true, min: 1, max: 5 },
      timeliness: { type: Number, required: true, min: 1, max: 5 },
      professionalism: { type: Number, required: true, min: 1, max: 5 },
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: 10,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

module.exports = mongoose.model('Review', reviewSchema);
