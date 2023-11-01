const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: {
    type: String
  },
  company_name: {
    type: String
  },
  spoc: {
    type: String
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: Number
  },
  landline_1: {
    type: String
  },
  landline_2: {
    type: String
  },
  landline_3: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  address: {
    type: String
  },
  gst: {
    type: String
  },
  transport: {
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
});

module.exports = mongoose.model('Client', clientSchema);