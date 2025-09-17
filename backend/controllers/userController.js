const Organization = require('../models/Organization');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Controller function for regular user registration (Manager, TL, Dev)
const registerUser = async (req, res) => {
  // Get the data from the request body
  const { name, email, password, role, organizationCode, managerId, teamLeaderId } = req.body;

  try {
    // --- Validation Step ---

    // 1. Check if an organization with the given code exists.
    const organization = await Organization.findOne({ organizationCode });
    if (!organization) {
      return res.status(404).json({ msg: 'Invalid Organization Code. Organization not found.' });
    }

    // 2. Check if a user with the provided email already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }

    // Note: More advanced validation would check if the managerId/teamLeaderId are valid users
    // within the same organization. We will add this later to keep this step clear.

    // --- Creation Step ---

    // 1. Create the new user object
    const newUser = new User({
      name,
      email,
      password, // This will be hashed next
      role,
      organizationId: organization._id, // Link to the found organization
      managerId: role === 'TeamLeader' ? managerId : null,
      teamLeaderId: role === 'Developer' ? teamLeaderId : null,
      isApproved: false // User is not approved until OTP verification
    });

    // 2. Securely hash the password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // 3. Save the new user to the database
    await newUser.save();

    // --- Response Step ---
    // For now, we send a success message. Later, this is where we will trigger the OTP.
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

module.exports = {
  registerUser,
};