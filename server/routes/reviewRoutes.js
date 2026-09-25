const express = require('express');
const router = express.Router();
const { submitReview, getUserReviews, getAllReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, submitReview);
router.get('/user/:userId', getUserReviews);
router.get('/', protect, authorize('ADMIN'), getAllReviews);

module.exports = router;
