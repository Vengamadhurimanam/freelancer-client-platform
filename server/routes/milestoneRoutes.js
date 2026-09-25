const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getProjectMilestones,
  updateMilestoneStatus,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('CLIENT', 'ADMIN'), createMilestone);
router.get('/project/:projectId', protect, getProjectMilestones);
router.patch('/:id/status', protect, updateMilestoneStatus);
router.delete('/:id', protect, authorize('CLIENT', 'ADMIN'), deleteMilestone);

module.exports = router;
