const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  id: {
    type: String
  },
  country_id: {
    type: String
  },
  state_name: {
    type: String
  },
  tin_no: {
    type: String
  },
  state_code: {
    type: String
  },
  status: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('State', stateSchema);