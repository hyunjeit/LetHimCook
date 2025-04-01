const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  date: { 
    type: Date, 
    default: Date.now,
    set: (val) => new Date(val).toISOString()
  },
  content: {type: String, required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
  edited: {type: Boolean, required: true},

  likedBy: { type: [String], default: [] },  // Stores user IDs who liked
  dislikedBy: { type: [String], default: [] } // Stores user IDs who disliked
});

module.exports = mongoose.model('Comment', CommentSchema);