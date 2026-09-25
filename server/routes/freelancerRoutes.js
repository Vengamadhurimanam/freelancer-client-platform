const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  addSkill,
  removeSkill,
  getFreelancerById,
  getAllFreelancers,
  getDashboard,
} = require('../controllers/freelancerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('FREELANCER'), getDashboard);
router.get('/me', protect, authorize('FREELANCER'), getMyProfile);
router.put('/me', protect, authorize('FREELANCER'), updateProfile);
router.post('/me/skills', protect, authorize('FREELANCER'), addSkill);
router.delete('/me/skills/:skillName', protect, authorize('FREELANCER'), removeSkill);

// Public routes
router.get('/', getAllFreelancers);
router.get('/:id', getFreelancerById);

module.exports = router;
