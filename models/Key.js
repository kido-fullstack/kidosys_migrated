const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const momentZone = require('moment-timezone');

const timeZone = momentZone.tz.guess();
const currentDateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

const keySchema = new Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  enc_key: {
    type: String
  },
  createdAt: {
    type: Date,
    default: currentDateByTimeZone
  },
  success: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Key', keySchema);