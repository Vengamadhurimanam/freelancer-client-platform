const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile, getDashboard } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('CLIENT'), getDashboard);
router.get('/me', protect, authorize('CLIENT'), getMyProfile);
router.put('/me', protect, authorize('CLIENT'), updateProfile);

module.exports = router;
