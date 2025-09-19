const Issue = require('../models/Issue');
const User = require('../models/User');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  // The frontend will send the title, description, priority, etc.
  const { title, description, priority, category } = req.body;

  try {
    // We get the user's info from the 'protect' middleware
    const user = await User.findById(req.user.id);

    // Validation: A user must be in a team to create an issue.
    // We will add the logic to create teams later. For now, we'll assume a user has a teamId.
    if (!user.teamId) {
      return res.status(400).json({ msg: 'User is not part of a team and cannot create issues.' });
    }

    // Create the new issue document
    const issue = new Issue({
      title,
      description,
      priority,
      category,
      raisedBy: req.user.id, // The logged-in user who is creating the issue
      organizationId: user.organizationId,
      teamId: user.teamId, // The team of the user creating the issue
    });

    // Save the issue to the database
    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createIssue,
};