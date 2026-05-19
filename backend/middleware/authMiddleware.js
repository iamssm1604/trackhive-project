const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Protect middleware to verify JWT and attach user to request object
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      return next(); // Explicit return to stop execution after passing to next middleware
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// Guard allowing access to Managers AND SuperManagers
const manager = (req, res, next) => {
  if (req.user && (req.user.role === 'Manager' || req.user.role === 'SuperManager')) {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized: Requires Manager or Super Manager privileges.' });
  }
};

// Guard allowing access to Team Leaders
const teamLeader = (req, res, next) => {
  if (req.user && req.user.role === 'TeamLeader') {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized: Requires Team Leader privileges.' });
  }
};

module.exports = { protect, manager, teamLeader };