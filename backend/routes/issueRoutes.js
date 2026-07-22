const express = require('express');
const router = express.Router();
const { 
  createIssue, 
  getIssues, 
  getIssueById, 
  updateIssueStatus,
  addCommentToIssue // <-- Must be imported here
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createIssue);
router.get('/', protect, getIssues);
router.get('/:id', protect, getIssueById);
router.put('/:id/status', protect, updateIssueStatus);

// <-- Make sure this route exists
router.post('/:id/comments', protect, addCommentToIssue);

module.exports = router;