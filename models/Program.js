const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const programSchema = new Schema({
  program_name: {
    type: String
  },
  programcategory_id: {
    type: Schema.Types.ObjectID,
    ref: 'Programcategory'
  },
  status: {
    type: String,
    default: 'active'
  },
  min_age: {
    type: String,
  },
  max_age: {
    type: String,
  },
  program_desc: {
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

programSchema.index({ program_name: "text" });

module.exports = mongoose.model('Program', programSchema);