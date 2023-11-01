const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  user_unique_id: {
    type: String,
    required: true
  },
  emp_unique_id: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true
  },
  password: {
    type: String
  },
  mobile: {
    type: Number,
  },
  country_id: [{
    type: Schema.Types.ObjectId,
    ref: "Country"
  }],
  success: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'active'
  },
  type: {
    type: String,
    default: 'admin'
  },
  controlled_by: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  added_by: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  view_option: {
    type: mongoose.Types.ObjectId,
    ref: 'ViewOption'
  },
  school_id: [{
    type: mongoose.Types.ObjectId,
    ref: 'Center'
  }],
  zone_id: [{
    type: mongoose.Types.ObjectId,
    ref: 'Zone'
  }],
  center_id: [{
    type: mongoose.Types.ObjectId,
    ref: 'Center'
  }],
  role_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Role'
  },
  admin_approval: {
    type: Number,
    default: 0
  },
  main: {
    type: String
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

employeeSchema.statics.getCountriesAccordingToViewOption = function (user_id) {
  return this.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(user_id)
      },
    },
    {
      $lookup: {
        from: "viewoptions",
        localField: "view_option",
        foreignField: "_id",
        as: "viewoption",
      },
    },
    {
      $unwind: "$viewoption",
    },
    {
      $lookup: {
        from: "countries",
        localField: "viewoption.countries",
        foreignField: "_id",
        as: "countries",
      },
    },
    {
      $unwind: "$countries",
    },
    {
      $project: {
        _id: "$countries._id",
        country_name: "$countries.country_name",
        country_id: "$countries.country_id",
      },
    },
  ])
}

module.exports = mongoose.model('Employee', employeeSchema);