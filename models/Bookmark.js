const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['lead', 'enq', 'followups'],
  },
  leads_data:[{
    type: Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  enqs_data:[{
    type: Schema.Types.ObjectId,
    ref: 'Lead'
  }],
  followups_data:[{
    type: Schema.Types.ObjectId,
    ref: 'Followup'
  }],
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

module.exports = mongoose.model('Bookmark', bookmarkSchema);