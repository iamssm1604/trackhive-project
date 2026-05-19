const express = require('express');
const router = express.Router();
const { createTeam, addTeamMember } = require('../controllers/teamController');
const { protect, manager, teamLeader } = require('../middleware/authMiddleware');

// Route for creating a new team (Accessible by Managers & SuperManagers via fixed authMiddleware)
router.post('/', protect, manager, createTeam);

// Route for adding a member to a team (Protected by Team Leader role check)
router.put('/:id/members', protect, teamLeader, addTeamMember); // <-- FIXED: Inserted teamLeader guard

module.exports = router;