const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const programSchema = new Schema({
  lead_id: {
    type: Schema.Types.ObjectID,
    ref: 'Lead'
  },
  msg_id: {
    type: Schema.Types.ObjectID,
    ref:'Message'
  },
  file_id: {
    type: String
  },
  center_id: [{
    type: mongoose.Types.ObjectId,
    ref: 'Center'
  }],
  updatedBy_name: {
    type: String
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  type: {
    type: String
  },
  sent_count: {
    type: Number
  },
  last_sent: {
    type: Date
  },
  last_sent_moment: {
    last_date: {
      type: String
    },
    last_time: {
      type: String
    },
    last_date_time: {
      type: String
    }
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
  },
});

module.exports = mongoose.model('Response', programSchema);