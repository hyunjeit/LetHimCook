const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  date: {type: String, default: Date.now},
  content: {type: String, required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

module.exports = mongoose.model('Comment', CommentSchema);