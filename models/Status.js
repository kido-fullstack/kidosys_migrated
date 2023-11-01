const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  name: {
    type: String
  },
  stage: {
    type: String
  },
  type: {
    type: String
  },
  status: {
    type: String,
    default: 'active'
  },
  success: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: false,
  strictPopulate: false
});

module.exports = mongoose.model('Statuses', statusSchema);