const express = require('express');
const router = express.Router();
const { getAllSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllSkills);
router.post('/', protect, authorize('ADMIN'), createSkill);
router.put('/:id', protect, authorize('ADMIN'), updateSkill);
router.delete('/:id', protect, authorize('ADMIN'), deleteSkill);

module.exports = router;
