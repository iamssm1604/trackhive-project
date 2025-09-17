const express = require('express');
const router = express.Router();
const { registerOrganization } = require('../controllers/organizationController');

// When a POST request comes to '/register', execute the registerOrganization function.
router.post('/register', registerOrganization);

module.exports = router;