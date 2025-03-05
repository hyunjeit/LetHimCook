const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authorImg: {type: String},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User
  date: {type: String},
  header: {type: String},
  content: {type: String},
});

module.exports = mongoose.model('Post', PostSchema);