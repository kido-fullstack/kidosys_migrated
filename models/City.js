const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const citySchema = new Schema({
  id: {
    type: String
  },
  city_slug: {
    type: String
  },
  city_name: {
    type: String
  },
  country_id: {
    type: String
  },
  city_status: {
    type: String
  },
  state_id: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('City', citySchema);