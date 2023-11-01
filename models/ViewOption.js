const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const viewOptionSchema = new Schema({
  countries: [{
    type: mongoose.Types.ObjectId,
    ref: 'Country'
  }],
  zones: [{
    type: mongoose.Types.ObjectId,
    ref: 'Zone'
  }],
  centers: [{
    type: mongoose.Types.ObjectId,
    ref: 'Center'
  }],
  role_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Role'
  },
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  role_assign_id: {
    type: mongoose.Types.ObjectId,
    ref: 'RoleAssign'
  },
  success: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ViewOption', viewOptionSchema);