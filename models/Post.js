const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  date: { 
    type: Date, 
    default: Date.now,
    set: (val) => new Date(val).toISOString()
  },
  header: {type: String, required: true},
  content: {type: String, required: true},
  img: {type: String, required: false},
  edited: {type: Boolean, required: true},

  //EDITS
  likedBy: { type: [String], default: [] },  // Stores user IDs who liked
  dislikedBy: { type: [String], default: [] } // Stores user IDs who disliked
});

module.exports = mongoose.model('Post', PostSchema);