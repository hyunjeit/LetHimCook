const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  date: { 
    type: Date, 
    default: Date.now,
    set: (val) => new Date(val).toISOString()
  },
  content: {type: String, required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

module.exports = mongoose.model('Comment', CommentSchema);