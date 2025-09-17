const express = require('express');
const router = express.Router();

// Import the new user registration controller function
const { registerUser } = require('../controllers/userController');

// This route says: "When a POST request comes to '/register',
// execute the registerUser function."
router.post('/register', registerUser);


// Export the router
module.exports = router;