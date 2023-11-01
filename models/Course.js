const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  course_name: {
    type: String
  },
  category_id: {
    type: Schema.Types.ObjectID,
    ref: 'Category'
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

module.exports = mongoose.model('Course', courseSchema);