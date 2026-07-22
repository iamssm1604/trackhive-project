const Organization = require('../models/Organization');

// @desc    Register a new organization
// @route   POST /api/organizations/register
// @access  Public
const registerOrganization = async (req, res) => {
  try {
    // 1. FIXED: Capture organizationCode from the Postman request body
    const { name, domain, organizationCode } = req.body;

    // 2. FIXED: Added organizationCode to validation rules
    if (!name || !domain || !organizationCode) {
      return res.status(400).json({ message: 'Please add all fields, including organization code' });
    }

    // 3. Check if organization already exists
    const organizationExists = await Organization.findOne({ domain });
    if (organizationExists) {
      return res.status(400).json({ message: 'Organization with this domain already exists' });
    }

    // 4. FIXED: Explicitly pass organizationCode to Mongoose
    const organization = await Organization.create({
      name,
      domain,
      organizationCode
    });

    if (organization) {
      res.status(201).json({
        _id: organization._id,
        name: organization.name,
        domain: organization.domain,
        organizationCode: organization.organizationCode
      });
    } else {
      res.status(400).json({ message: 'Invalid organization data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerOrganization
};