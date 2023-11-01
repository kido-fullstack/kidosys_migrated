const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  number: {
    type: Number
  },
  mobile: {
    type: Number
  },
  action: {
    type: String
  },
  success: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    expires: '15s',
    default: Date.now
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: '3m'
  }
});

otpSchema.index({
  expireAt: 1
});

module.exports = mongoose.model('Otp', otpSchema);