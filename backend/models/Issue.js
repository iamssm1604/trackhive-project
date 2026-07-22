const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. Define Comment Schema
const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text cannot be empty.'],
  },
}, { timestamps: true });

// 2. Define Issue Schema
const IssueSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
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
  raisedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [CommentSchema], // <-- Ensure this line is present
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);