const Issue = require('../models/Issue');
const User = require('../models/User');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  const { title, description, priority, category } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.teamId) {
      return res.status(400).json({ msg: 'User is not part of a team and cannot create issues.' });
    }
    const issue = new Issue({
      title,
      description,
      priority,
      category,
      raisedBy: req.user.id,
      organizationId: user.organizationId,
      teamId: user.teamId,
    });
    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get issues relevant to the logged-in user
// @route   GET /api/issues
// @access  Private
const getIssues = async (req, res) => {
  try {
    let issues;
    const userRole = req.user.role;
    if (userRole === 'Developer' || userRole === 'TeamLeader') {
      issues = await Issue.find({ teamId: req.user.teamId });
    } else if (userRole === 'Manager' || userRole === 'SuperManager') {
      issues = await Issue.find({ organizationId: req.user.organizationId });
    }
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single issue by ID
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
};