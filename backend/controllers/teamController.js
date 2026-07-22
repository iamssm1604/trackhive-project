const Team = require('../models/Team');
const User = require('../models/User');

// Helper function to automatically sync missing teamId references for users
const syncUserTeamIds = async (organizationId) => {
  try {
    const teams = await Team.find({ organizationId });
    for (const team of teams) {
      for (const memberId of team.members) {
        await User.updateOne(
          { _id: memberId, $or: [{ teamId: { $exists: false } }, { teamId: null }] },
          { $set: { teamId: team._id, teamLeaderId: team.teamLeaderId } }
        );
      }
    }
  } catch (err) {
    console.error('Error auto-syncing team IDs:', err.message);
  }
};

// Create a new team (SuperManager / Manager only)
const createTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'SuperManager' && user.role !== 'Manager') {
      return res.status(403).json({ msg: 'Access denied. Only SuperManager or Manager can create teams.' });
    }

    const { name, teamLeaderId } = req.body;

    const teamLeader = await User.findById(teamLeaderId);
    if (!teamLeader || teamLeader.role !== 'TeamLeader' || teamLeader.organizationId.toString() !== user.organizationId.toString()) {
      return res.status(400).json({ msg: 'Invalid team leader selected.' });
    }

    const team = new Team({
      name,
      organizationId: user.organizationId,
      teamLeaderId
    });

    await team.save();
    res.status(201).json({ msg: 'Team created successfully', team });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add a developer to a team (Manager or the Team's Leader)
const addMemberToTeam = async (req, res) => {
  try {
    const { teamId, developerId } = req.body;
    const user = await User.findById(req.user.id);

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found.' });
    }

    const isManager = user.role === 'SuperManager' || user.role === 'Manager';
    const isTeamLeaderOfThisTeam = user.role === 'TeamLeader' && team.teamLeaderId.toString() === user._id.toString();

    if (!isManager && !isTeamLeaderOfThisTeam) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const developer = await User.findById(developerId);
    if (!developer || developer.organizationId.toString() !== team.organizationId.toString()) {
      return res.status(400).json({ msg: 'Invalid developer.' });
    }

    // Safeguard: Check if developer is already assigned to another team
    if (developer.teamId && developer.teamId.toString() !== team._id.toString()) {
      return res.status(400).json({ msg: `${developer.name} is already assigned to another team.` });
    }

    if (!team.members.includes(developerId)) {
      team.members.push(developerId);
      await team.save();
    }

    developer.teamId = team._id;
    developer.teamLeaderId = team.teamLeaderId;
    await developer.save();

    res.json({ msg: `${developer.name} added to team successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all teams for the organization (with auto-sync)
const getTeams = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Automatically patch any missing teamIds in the background before fetching
    await syncUserTeamIds(user.organizationId);

    const teams = await Team.find({ organizationId: user.organizationId })
      .populate('teamLeaderId', 'name email')
      .populate('members', 'name email role');
      
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get available developers in the organization who can be added to teams
// Get available developers in the organization who are not assigned to any team
const getAvailableDevelopers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // 1. Find all teams in the organization to collect assigned member IDs
    const teams = await Team.find({ organizationId: user.organizationId });
    const assignedMemberIds = teams.reduce((acc, team) => {
      return acc.concat(team.members.map(id => id.toString()));
    }, []);

    // 2. Find approved developers in the same organization who are NOT in assignedMemberIds and have no teamId
    const developers = await User.find({
      organizationId: user.organizationId,
      role: 'Developer',
      isApproved: true,
      _id: { $nin: assignedMemberIds },
      $or: [{ teamId: { $exists: false } }, { teamId: null }]
    }).select('name email _id');

    res.json(developers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { 
  createTeam, 
  addMemberToTeam, 
  getTeams, 
  getAvailableDevelopers 
};