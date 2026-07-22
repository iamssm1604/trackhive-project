const Issue = require('../models/Issue');
const User = require('../models/User');
const Team = require('../models/Team');

const ensureUserTeam = async (user) => {
  if (!user.teamId) {
    let team = await Team.findOne({ 
      $or: [{ members: user._id }, { teamLeaderId: user._id }] 
    });
    
    if (team) {
      user.teamId = team._id;
      user.teamLeaderId = team.teamLeaderId;
      await user.save();
    }
  }
  return user;
};

const createIssue = async (req, res) => {
  const { title, description, priority, category } = req.body;
  try {
    let user = await User.findById(req.user.id);
    user = await ensureUserTeam(user);
    
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
      comments: []
    });
    
    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getIssues = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    user = await ensureUserTeam(user);

    let issues;
    const userRole = user.role;
    
    if (userRole === 'Developer' || userRole === 'TeamLeader') {
      if (!user.teamId) {
        return res.status(400).json({ msg: 'User is not assigned to a team.' });
      }
      issues = await Issue.find({ teamId: user.teamId })
        .populate('raisedBy', 'name email role')
        .populate('comments.user', 'name email role');
    } else if (userRole === 'Manager' || userRole === 'SuperManager') {
      issues = await Issue.find({ organizationId: user.organizationId })
        .populate('raisedBy', 'name email role')
        .populate('comments.user', 'name email role');
    }
    
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('raisedBy', 'name email role')
      .populate('comments.user', 'name email role');
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateIssueStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }

    const validStatuses = ['Open', 'InProgress', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    issue.status = status;
    await issue.save();
    
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const addCommentToIssue = async (req, res) => {
  const { text } = req.body;
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ msg: 'Issue not found' });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    if (!issue.comments) {
      issue.comments = [];
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    issue.comments.push(newComment);
    await issue.save();

    const updatedIssue = await Issue.findById(req.params.id)
      .populate('raisedBy', 'name email role')
      .populate('comments.user', 'name email role');

    res.json(updatedIssue.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  addCommentToIssue
};