const express = require('express');
const router = express.Router();
const {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
  getProposalById,
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('FREELANCER'), submitProposal);
router.get('/my-proposals', protect, authorize('FREELANCER'), getMyProposals);
router.get('/project/:projectId', protect, authorize('CLIENT', 'ADMIN'), getProjectProposals);
router.patch('/:id/status', protect, authorize('CLIENT', 'ADMIN'), updateProposalStatus);
router.get('/:id', protect, getProposalById);

module.exports = router;
