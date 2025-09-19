const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// This function just checks if the user is logged in
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// This new function checks if the logged-in user is a Manager
const manager = (req, res, next) => {
  if (req.user && req.user.role === 'Manager') {
    next(); // If they are a manager, proceed
  } else {
    res.status(403).json({ msg: 'Not authorized as a Manager' });
  }
};

// ... (at the bottom of the file)
const teamLeader = (req, res, next) => {
  if (req.user && req.user.role === 'TeamLeader') {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized as a Team Leader' });
  }
};

module.exports = { protect, manager, teamLeader }; // <-- Update this line

