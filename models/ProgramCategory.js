const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const programCategorySchema = new Schema({
  title: {
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

programCategorySchema.index({ title: "text" });

module.exports = mongoose.model('Programcategory', programCategorySchema);