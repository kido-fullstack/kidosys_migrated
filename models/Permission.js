const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  name: {
    type: String
  },
  category: {
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

module.exports = mongoose.model('Permission', permissionSchema);