const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  // The organization this issue belongs to, for high-level filtering.
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  // The specific team this issue belongs to.
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team', // We will create the Team model later.
    required: true,
  },
  // A user-friendly ID like "INNOVATE-101". We'll add logic for this later.
  issueId: {
    type: String,
    // required: true,
    // unique: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the issue.'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description.'],
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Closed'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  category: {
    type: String,
    enum: ['Bug', 'Task', 'Feature'],
    default: 'Task',
  },
  // The user who created the issue.
  raisedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // An array of users assigned to the issue. Can be empty initially.
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);