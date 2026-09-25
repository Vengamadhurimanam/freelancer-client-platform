const express = require('express');
const router = express.Router();
const {
  getAssessmentBySkill,
  submitAssessment,
  getAllAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getMyAttempts,
} = require('../controllers/assessmentController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAllAssessments);
router.get('/skill/:skillIdOrName', protect, authorize('FREELANCER', 'ADMIN'), getAssessmentBySkill);
router.post('/:id/submit', protect, authorize('FREELANCER'), submitAssessment);
router.get('/my-attempts', protect, authorize('FREELANCER'), getMyAttempts);

// Admin assessment management
router.post('/', protect, authorize('ADMIN'), createAssessment);
router.put('/:id', protect, authorize('ADMIN'), updateAssessment);
router.delete('/:id', protect, authorize('ADMIN'), deleteAssessment);

module.exports = router;
