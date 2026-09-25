const express = require('express');
const router = express.Router();
const { submitReport, getAllReports, updateReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, submitReport);
router.get('/', protect, authorize('ADMIN'), getAllReports);
router.patch('/:id', protect, authorize('ADMIN'), updateReport);

module.exports = router;
