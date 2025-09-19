const express = require('express');
const router = express.Router();
const { createTeam, addTeamMember } = require('../controllers/teamController'); // <-- Import new function
const { protect, manager, teamLeader } = require('../middleware/authMiddleware'); // <-- Import new middleware

router.post('/', protect, manager, createTeam);
router.put('/:id/members', protect, addTeamMember); // <-- ADD THIS ROUTE

module.exports = router;