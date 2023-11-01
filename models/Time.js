const momentZone = require('moment-timezone');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const timeZone = momentZone.tz.guess();
const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

const timeSchema = new Schema({
  name: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: dateByTimeZone
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Time', timeSchema);