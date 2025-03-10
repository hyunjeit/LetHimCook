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
  img: {type: String, required: false}
});

module.exports = mongoose.model('Post', PostSchema);