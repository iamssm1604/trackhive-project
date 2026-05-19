const Organization = require('../models/Organization');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller function for regular user registration (Manager, TL, Dev)
const registerUser = async (req, res) => {
  const { name, email, password, role, organizationCode, managerId, teamLeaderId } = req.body;

  try {
    // 1. Verify organization exists via code
    const organization = await Organization.findOne({ organizationCode });
    if (!organization) {
      return res.status(404).json({ msg: 'Invalid Organization Code. Organization not found.' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }

    // 3. Cross-Tenant Security Validations
    if (role === 'TeamLeader' && managerId) {
      const assignedManager = await User.findById(managerId);
      if (!assignedManager || assignedManager.organizationId.toString() !== organization._id.toString()) {
        return res.status(400).json({ msg: 'Selected Manager does not belong to your organization.' });
      }
    }

    if (role === 'Developer' && teamLeaderId) {
      const assignedTL = await User.findById(teamLeaderId);
      if (!assignedTL || assignedTL.organizationId.toString() !== organization._id.toString()) {
        return res.status(400).json({ msg: 'Selected Team Leader does not belong to your organization.' });
      }
    }

    // 4. Create and Hash User
    const newUser = new User({
      name,
      email,
      password,
      role,
      organizationId: organization._id,
      managerId: role === 'TeamLeader' ? managerId : null,
      teamLeaderId: role === 'Developer' ? teamLeaderId : null,
      isApproved: false // Stays false until verified via OTP
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    res.status(201).json({
      msg: 'Registration successful. Your account is pending approval.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Authenticate user & get token
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Security Check: Block login if account has not passed the approval/OTP loop
      if (!user.isApproved) {
        return res.status(403).json({ msg: 'Account pending activation. Please verify your identity first.' });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ msg: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerUser,
  loginUser, 
};