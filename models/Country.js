const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  country_name: {
    type: String
  },
  country_id:{
    type:Number,
    default:0
  },
  country_code:{
    type:String,
    default:""
  },
  country_phonecode:{
    type:Number,
    default:0
  },
  status: {
    type: String,
    default: 'Active'
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

module.exports = mongoose.model('Country', countrySchema);