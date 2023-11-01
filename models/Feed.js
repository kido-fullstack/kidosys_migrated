const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const feedSchema = new Schema({
  parent_name: {
    type: String
  },
  msg: {
    type: String
  },
  msg_id: {
    type: Schema.Types.ObjectID,
    ref:'Message'
  },
  center_id: [{
    type: Schema.Types.ObjectID,
    ref: 'Center'
  }],
  user_type: {
    type: String,
    default: "nonadmin"
  },
  last_sent: {
    last_date: {
      type: String
    },
    last_time: {
      type: String
    }
  },
  medium: {
    type: String,
    default: "Whatsapp"
  },
  count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy_name: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Feed', feedSchema);