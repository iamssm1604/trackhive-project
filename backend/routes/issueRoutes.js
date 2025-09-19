const express = require('express');
const router = express.Router();
// Make sure all three functions are imported here
const { createIssue, getIssues, getIssueById } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

// Route for creating a new issue
router.post('/', protect, createIssue);

// Route for getting all relevant issues for the logged-in user
router.get('/', protect, getIssues);

// Route for getting a single issue by its ID
router.get('/:id', protect, getIssueById);

module.exports = router;