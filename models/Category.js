const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  category_name: {
    type: String
  },
  category_img: {
    type: String
  },
  category_desc: {
    type: String
  },
  status: {
    type: String,
    default: 'active'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Category', categorySchema);