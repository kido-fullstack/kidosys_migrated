const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const zoneSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  country_id:{
    type: Schema.Types.ObjectID,
    ref: 'Country'
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Zone', zoneSchema);