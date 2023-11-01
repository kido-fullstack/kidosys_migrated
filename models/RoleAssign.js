const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const roleAssignSchema = new Schema({
  role_id: {
    type: String
  },
  user_id: {
    type: String
  },
  status: {
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

module.exports = mongoose.model('RoleAssign', roleAssignSchema);