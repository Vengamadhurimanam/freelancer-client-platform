const express = require('express');
const router = express.Router();
const {
  createTrialTask,
  getTrialTaskById,
  acceptTrialTask,
  submitTrialTask,
  reviewTrialTask,
  getMyTrialTasks,
  getClientTrialTasks,
} = require('../controllers/trialTaskController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('CLIENT', 'ADMIN'), createTrialTask);
router.get('/freelancer/my-tasks', protect, authorize('FREELANCER'), getMyTrialTasks);
router.get('/client/my-tasks', protect, authorize('CLIENT'), getClientTrialTasks);
router.get('/:id', protect, getTrialTaskById);
router.patch('/:id/accept', protect, authorize('FREELANCER'), acceptTrialTask);
router.post('/:id/submit', protect, authorize('FREELANCER'), submitTrialTask);
router.post('/:id/review', protect, authorize('CLIENT', 'ADMIN'), reviewTrialTask);

module.exports = router;
