const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  file_name: {
    type: String
  },
  file_type: {
    type: String
  },
  file_size: {
    type: Number
  },
  file_extension: {
    type: String
  },
  og_file_name: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Media', mediaSchema);