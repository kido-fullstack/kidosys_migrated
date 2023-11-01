const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const academicYearSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  current_year: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive'],
  },
  success: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model('Academicyear', academicYearSchema);
