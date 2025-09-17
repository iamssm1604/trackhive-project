// We need to import the models we created to interact with the database
const Organization = require('../models/Organization');
const User = require('../models/User');
// We need bcrypt to hash the password
const bcrypt = require('bcryptjs');

// This is the main function for registering an organization
const registerOrganization = async (req, res) => {
  // Get the data from the incoming request body
  const { orgName, orgEmail, orgContactPerson, superManagerName, superManagerEmail, superManagerPassword } = req.body;

  try {
    // --- Validation Step ---
    let org = await Organization.findOne({ name: orgName });
    if (org) {
      return res.status(400).json({ msg: 'An organization with this name already exists.' });
    }
    let user = await User.findOne({ email: superManagerEmail });
    if (user) {
      return res.status(400).json({ msg: 'A user with this email already exists.' });
    }

    // --- Creation Step ---
    const organizationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrg = new Organization({
      name: orgName,
      email: orgEmail,
      contactPerson: orgContactPerson,
      organizationCode,
    });

    const newUser = new User({
      name: superManagerName,
      email: superManagerEmail,
      password: superManagerPassword,
      role: 'SuperManager',
      organizationId: newOrg._id,
      isApproved: true
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(superManagerPassword, salt);
    newOrg.superManager = newUser._id;

    await newUser.save();
    await newOrg.save();

    // --- Response Step ---
    res.status(201).json({
      msg: 'Organization and Super Manager registered successfully!',
      organizationName: newOrg.name,
      organizationCode: newOrg.organizationCode,
      superManager: {
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerOrganization,
};