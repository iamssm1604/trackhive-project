const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  // The user who is the leader of this team.
  teamLeaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The manager who oversees this team's leader.
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // An array of developers who are members of this team.
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Ensure that a team name is unique within a single organization
TeamSchema.index({ name: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model('Team', TeamSchema);