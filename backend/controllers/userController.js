const Organization = require('../models/Organization');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Controller function for handling both Organization Creation and Joining
const registerUser = async (req, res) => {
  const { name, email, password, role, organizationName, organizationCode, domain, isCreatingOrg, managerId, teamLeaderId } = req.body;

  try {
    let organization;

    if (isCreatingOrg) {
      // 1. SCENARIO A: Creating a brand new Organization
      const existingOrg = await Organization.findOne({ name: organizationName });
      if (existingOrg) {
        return res.status(400).json({ msg: 'An organization with this name already exists.' });
      }

      // Generate a unique 6-character organization code
      const generatedCode = crypto.randomBytes(3).toString('hex').toUpperCase();

      organization = new Organization({
        name: organizationName,
        organizationCode: generatedCode,
        domain: domain || `${organizationName.toLowerCase().replace(/\s+/g, '')}.com`
      });
      await organization.save();

    } else {
      // 2. SCENARIO B: Joining an existing Organization via code or name
      organization = await Organization.findOne({ 
        $or: [{ organizationCode }, { name: organizationName }] 
      });

      if (!organization) {
        return res.status(404).json({ msg: 'Organization not found. Please check the organization code.' });
      }
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }

    // 4. Cross-Tenant Security Validations
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

    // 5. Create and Hash User
    const finalRole = isCreatingOrg ? 'SuperManager' : role;
    const isApprovedStatus = isCreatingOrg ? true : false;

    const newUser = new User({
      name,
      email,
      password,
      role: finalRole,
      organizationId: organization._id,
      managerId: role === 'TeamLeader' ? managerId : null,
      teamLeaderId: role === 'Developer' ? teamLeaderId : null,
      isApproved: isApprovedStatus 
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    res.status(201).json({
      msg: isCreatingOrg 
        ? `Organization created successfully! Your Org Code is ${organization.organizationCode}. You can now log in.` 
        : 'Registration successful. Your account is pending approval.',
      organizationCode: organization.organizationCode,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error("Registration error:", err.message);
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
      // Security Check: Block login if account has not passed approval loop
      if (!user.isApproved) {
        return res.status(403).json({ msg: 'Account pending activation. Please wait for your SuperManager to approve you.' });
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
    console.error("Login error:", err.message);
    res.status(500).send('Server Error');
  }
};

// Get all pending users for SuperManager
const getPendingUsers = async (req, res) => {
  try {
    const superManager = await User.findById(req.user.id);
    if (!superManager || (superManager.role !== 'SuperManager' && superManager.role !== 'Manager')) {
      return res.status(403).json({ msg: 'Access denied. Authorized managers only.' });
    }

    const pendingUsers = await User.find({ 
      organizationId: superManager.organizationId, 
      isApproved: false 
    }).select('-password');

    res.json(pendingUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Approve a user
const approveUser = async (req, res) => {
  try {
    const superManager = await User.findById(req.user.id);
    if (!superManager || (superManager.role !== 'SuperManager' && superManager.role !== 'Manager')) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const userToApprove = await User.findById(req.params.id);
    if (!userToApprove) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    if (userToApprove.organizationId.toString() !== superManager.organizationId.toString()) {
      return res.status(400).json({ msg: 'User does not belong to your organization.' });
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    res.json({ msg: `${userToApprove.name} has been approved successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all approved Team Leaders for an organization (used in registration dropdown)
const getTeamLeadersByOrg = async (req, res) => {
  try {
    const { orgCode, orgName } = req.query;
    
    const organization = await Organization.findOne({ 
      $or: [{ organizationCode: orgCode }, { name: orgName }] 
    });

    if (!organization) {
      return res.status(404).json({ msg: 'Organization not found.' });
    }

    const teamLeaders = await User.find({
      organizationId: organization._id,
      role: 'TeamLeader',
      isApproved: true
    }).select('name _id email');

    res.json(teamLeaders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all approved team leaders for the organization
const getApprovedTeamLeaders = async (req, res) => {
  try {
    const manager = await User.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ msg: 'Manager not found.' });
    }

    const teamLeaders = await User.find({
      organizationId: manager.organizationId,
      role: 'TeamLeader',
      isApproved: true
    }).select('name email _id');

    res.json(teamLeaders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getPendingUsers,
  approveUser,
  getTeamLeadersByOrg,
  getApprovedTeamLeaders
};