const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const acknowledgmentchema = new Schema({
  title: {
    type: String
  },
  msg: {
    type: String
  },
  msg_id: {
    type: Schema.Types.ObjectID,
    ref:'Message'
  },
  lead_id:{
    type: Schema.Types.ObjectID,
    ref: 'Lead'
  },
  viewoption:{
    type: Schema.Types.ObjectID,
    ref: 'ViewOption'
  },
  updatedBy_name: {
    type: String
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  last_sent: {
    type: Date
  },
  last_sent_moment: {
    last_date: {
      type: String
    },
    last_time: {
      type: String
    },
    last_date_time: {
      type: String
    }
  },
  center_id: [{
    type: Schema.Types.ObjectID,
    ref: 'Center'
  }],
  lead_no: {
    type: String
  },
  lead_date: {
    type: Date
  },
  child_first_name:{
    type:String
  },
  child_last_name:{
    type:String
  },
  parent_name:{
    type:String
  },
  parent_email:{
    type:String
  },
  parent_whatsapp:{
    type:String
  },
  parent_first_contact: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'active'
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

module.exports = mongoose.model('Acknowledgment', acknowledgmentchema);