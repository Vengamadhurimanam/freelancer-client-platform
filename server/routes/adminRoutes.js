const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  toggleUserActive,
  deleteUser,
  getAllProjects,
} = require('../controllers/adminController');
const { getAllReviews } = require('../controllers/reviewController');
const { getAllReports, updateReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.get('/projects', getAllProjects);
router.get('/reviews', getAllReviews);
router.get('/reports', getAllReports);
router.patch('/reports/:id', updateReport);

module.exports = router;
