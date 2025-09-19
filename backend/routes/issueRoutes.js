const express = require('express');
const router = express.Router();
const { createIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

// This route says:
// When a POST request comes to the root URL ('/'),
// first, run the 'protect' middleware to check if the user is logged in.
// If they are, then proceed to the 'createIssue' controller function.
router.post('/', protect, createIssue);

module.exports = router;