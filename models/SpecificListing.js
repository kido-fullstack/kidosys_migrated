const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const specificListingSchema = new Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  role_assign_id: {
    type: mongoose.Types.ObjectId,
    ref: 'RoleAssign'
  },
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
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  updatedAt:{
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  }
});

module.exports = mongoose.model('SpecificListing', specificListingSchema);