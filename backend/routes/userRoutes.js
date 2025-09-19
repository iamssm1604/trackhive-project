const express = require('express');
const router = express.Router();

// Import both controller functions
const { registerUser, loginUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser); // <-- ADD THIS LINE

module.exports = router;