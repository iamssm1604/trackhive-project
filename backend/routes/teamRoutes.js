const express = require('express');
const router = express.Router();
const { 
  createTeam, 
  addMemberToTeam, 
  getTeams, 
  getAvailableDevelopers 
} = require('../controllers/teamController');

const { protect, manager } = require('../middleware/authMiddleware');

router.get('/', protect, getTeams);
router.get('/available-developers', protect, getAvailableDevelopers);

// Allowed for SuperManager and Manager
router.post('/create', protect, manager, createTeam);

// Allowed for Managers and Team Leaders
router.put('/add-member', protect, addMemberToTeam);

module.exports = router;