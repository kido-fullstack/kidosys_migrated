const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const qrcodeSchema = new Schema({
  view_options: {
    type: String
  },
  qrcode_img: {
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

module.exports = mongoose.model('Qrcode', qrcodeSchema);