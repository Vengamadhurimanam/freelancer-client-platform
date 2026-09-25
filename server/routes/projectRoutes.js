const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  getRecommendedFreelancers,
  assignFreelancer,
} = require('../controllers/projectController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public listing and single view (with optional auth for match calculation)
router.get('/', optionalAuth, getAllProjects);
router.get('/my-projects', protect, authorize('CLIENT'), getMyProjects);
router.get('/:id', optionalAuth, getProjectById);

// Protected client actions
router.post('/', protect, authorize('CLIENT', 'ADMIN'), createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.get('/:id/recommended-freelancers', protect, authorize('CLIENT', 'ADMIN'), getRecommendedFreelancers);
router.post('/:id/assign', protect, authorize('CLIENT', 'ADMIN'), assignFreelancer);

module.exports = router;
