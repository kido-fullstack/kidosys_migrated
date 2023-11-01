const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const subStatusSchema = new Schema({
    name: {
      type: String
    },
    status_id:{
      type: Schema.Types.ObjectID,
      ref: 'Statuses'
    },
    stage: {
      type: String
    },
    status: {
      type: String,
      default: 'active'
    },
    success: {
      type: Boolean,
      default: true
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

module.exports = mongoose.model('Substatus', subStatusSchema);