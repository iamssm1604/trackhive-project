const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Managers only)
const createTeam = async (req, res) => {
  const { name, teamLeaderId } = req.body;

  try {
    const managerId = req.user.id; // The logged-in user is the manager
    const organizationId = req.user.organizationId;

    // Validation
    const teamLeader = await User.findById(teamLeaderId);
    if (!teamLeader || teamLeader.role !== 'TeamLeader' || teamLeader.organizationId.toString() !== organizationId.toString()) {
      return res.status(400).json({ msg: 'Invalid Team Leader selected.' });
    }

    // Create and save the new team
    const team = new Team({
      name,
      teamLeaderId,
      managerId,
      organizationId,
    });
    const createdTeam = await team.save();

    // Important: Update the Team Leader's user document with their new teamId
    teamLeader.teamId = createdTeam._id;
    await teamLeader.save();

    res.status(201).json(createdTeam);

  } catch (err) {
    // Handle potential duplicate team name error
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'A team with this name already exists in your organization.' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a member to a team
// @route   PUT /api/teams/:id/members
// @access  Private (Team Leaders only)
const addTeamMember = async (req, res) => {
  const { userId } = req.body; // The ID of the developer to add
  const teamId = req.params.id; // The ID of the team from the URL
  const requestingUserId = req.user.id; // The logged-in user (the TL)

  try {
    const team = await Team.findById(teamId);
    const userToAdd = await User.findById(userId);

    // Validations
    if (!team) return res.status(404).json({ msg: 'Team not found' });
    if (!userToAdd) return res.status(404).json({ msg: 'User not found' });
    if (team.teamLeaderId.toString() !== requestingUserId) {
      return res.status(403).json({ msg: 'Not authorized: Only the Team Leader can add members.' });
    }

    // Add user to team and update user's teamId
    team.members.addToSet(userId); // addToSet prevents duplicates
    userToAdd.teamId = teamId;

    await team.save();
    await userToAdd.save();

    res.json(team);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createTeam,
  addTeamMember, // <-- Add this
};