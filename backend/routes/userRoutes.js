const express = require('express');
const router = express.Router();

// Import all controller functions
const { 
  registerUser, 
  loginUser, 
  getPendingUsers, 
  approveUser ,
  getTeamLeadersByOrg,
  getApprovedTeamLeaders
} = require('../controllers/userController');

// Destructure protect and manager middleware functions correctly
const { protect, manager } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/team-leaders', getTeamLeadersByOrg);

// Protected routes (Only logged in Managers / SuperManagers can access)
router.get('/pending', protect, manager, getPendingUsers);
router.put('/approve/:id', protect, manager, approveUser);
router.get('/approved-team-leaders', protect, getApprovedTeamLeaders);

module.exports = router;