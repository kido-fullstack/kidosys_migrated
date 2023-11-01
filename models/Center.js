const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const centerSchema = new Schema({
  school_name:{
    type:String
  },
  school_display_name:{
    type:String
  },
  country_id:{
    type: Schema.Types.ObjectID,
    ref: 'Country'
  },
  zone_id:{
    type: Schema.Types.ObjectID,
    ref: 'Zone'
  },
  programcategory_id:[{
    type: Schema.Types.ObjectID,
    ref: 'Programcategory'
  }],
  program_id:[{
    type: Schema.Types.ObjectID,
    ref: 'Program'
  }],
  action_taken:[{
    type:String
  }],
  setup_type:{
    type:String
  },
  agreement_term_start:{
    type:Date
  },
  agreement_term_end:{
    type:Date
  },
  no_of_room:{
    type:String
  },
  designation: {
    type: String
  },
  activities_portal:{
    type:String
  },
  center_video_url:{
    type:String
  },
  website_url:{
    type:String
  },
  mon_to_fri_start_time:{
    type:String
  },
  mon_to_fri_end_time:{
    type:String
  },
  saturday_start_time:{
    type:String
  },
  saturday_end_time:{
    type:String
  },
  sunday_start_time:{
    type:String
  },
  sunday_end_time: {
    type:String
  },
  school_code:{
    type:String
  },
  size_of_school:{
    type:String
  },
  school_description:{
    type:String
  },
  house_no:{
    type:String
  },
  landmark:{
    type:String
  },
  city:{
    type:String
  },
  country:{
    type:String
  },
  street:{
    type:String
  },
  area:{
    type:String
  },
  state:{
    type:String
  },
  pincode:{
    type:String
  },
  contact_number:{
    type:String
  },
  email_id:{
    type:String
  },
  whatsapp_number:{
    type:String
  },
  cor_entity_name:{
    type:String
  },
  cor_email_id:{
    type:String
  },
  cor_cor_number:{
    type:String
  },
  cor_gst_number:{
    type:String
  },
  cor_gst_address:{
    type:String
  },
  cor_company_pan:{
    type:String
  },
  cor_company_cin:{
    type:String
  },
  cor_receipt:{
    type:String
  },
  cor_sal: {
    type: String
  },
  cor_spoc:{
    type:String
  },
  cor_add: {
    type: String
  },
  cor_state: {
    type: String
  },
  cor_city: {
    type: String
  },
  cor_pincode: {
    type: String
  },
  cor_video_url_first: {
    type: String
  },
  cor_video_url_second: {
    type: String
  },
  cor_customer_email:{
    type:String
  },
  sch_bank_name:{
    type:String
  },
  sch_account_number:{
    type:String
  },
  sch_branch_name:{
    type:String
  },
  sch_branch_address:{
    type:String
  },
  sch_ifsc:{
    type:String
  },
  sch_timetable_before:{
    type:Number
  },
  sch_document_before:{
    type:Number
  },
  sch_timetable_after:{
    type:Number
  },
  sch_document_after:{
    type:Number
  },
  status: {
    type: String,
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectID,
    ref: 'Employee'
  },
  success: {
    type: Boolean,
    default: true
  }
});

centerSchema.index({ school_display_name: "text" });

centerSchema.statics.getZonesWithCentersGrouped = function (countries, zones, centers) {
  let aggregateQue = [
    {
      '$match': {
        'school_name': {
          '$ne': "HEAD OFFICE CENTER"
        }
      }
    },
    {
      '$lookup': {
        'from': 'zones',
        'localField': 'zone_id',
        'foreignField': '_id',
        'as': 'zone'
      }
    }, {
      '$unwind': {
        'path': '$zone'
      }
    }, {
      '$group': {
        '_id': '$zone_id',
        'zone_id': {
          '$first': '$zone._id'
        },
        'zone_name': {
          '$first': '$zone.name'
        },
        'schools': {
          '$push': {
            'school_id': '$_id',
            'school_name': '$school_name',
            'school_display_name': '$school_display_name',
            'zone_id': '$zone_id'
          }
        }
      }
    }, {
      '$sort': {
        'schools.school_display_name': 1
      }
    }
  ];

  if (countries && countries.length) {
    aggregateQue.unshift({
      '$match': {
        'country_id': { $in: countries }
      }
    });
  }

  if (zones && zones.length) {
    aggregateQue.unshift({
      '$match': {
        'zone_id': { $in: zones }
      }
    });
  }

  if (centers && centers.length) {
    aggregateQue.unshift({
      '$match': {
        '_id': { $in: centers }
      }
    });
  }

  return this.aggregate(aggregateQue);
}

centerSchema.statics.getZonesWithCentersGroupedAjax = function (countries, zones, centers) {
  let aggregateQue = [
    {
      '$match': {
        'school_name': {
          '$ne': "HEAD OFFICE CENTER"
        }
      }
    },
    {
      '$lookup': {
        'from': 'zones',
        'localField': 'zone_id',
        'foreignField': '_id',
        'as': 'zone'
      }
    }, {
      '$unwind': {
        'path': '$zone'
      }
    }, {
      '$group': {
        '_id': '$zone_id',
        'zone_id': {
          '$first': '$zone._id'
        },
        'zone_name': {
          '$first': '$zone.name'
        },
        'schools': {
          '$push': {
            'school_id': '$_id',
            'school_name': '$school_name',
            'school_display_name': '$school_display_name',
            'zone_id': '$zone_id'
          }
        }
      }
    }, {
      '$sort': {
        'schools.school_display_name': 1
      }
    }
  ];

  if (countries && countries.length) {
    aggregateQue.unshift({
      '$match': {
        'country_id': { $in: countries }
      }
    });
  }

  if (zones && zones.length) {
    aggregateQue.unshift({
      '$match': {
        'zone_id': { $in: zones }
      }
    });
  }

  if (centers && centers.length) {
    aggregateQue.unshift({
      '$match': {
        '_id': { $in: centers }
      }
    });
  }
  return this.aggregate(aggregateQue);
}

centerSchema.statics.getZonesWithCentersGroupedAjaxNonAdmin = function (countries, zones, centers) {
  let aggregateQue = [
    {
      '$match': {
        '_id': { $in: centers }
      }
    },
    {
      '$lookup': {
        'from': 'zones',
        'localField': 'zone_id',
        'foreignField': '_id',
        'as': 'zone'
      }
    }, {
      '$unwind': {
        'path': '$zone'
      }
    }, {
      '$group': {
        '_id': '$zone_id',
        'zone_id': {
          '$first': '$zone._id'
        },
        'zone_name': {
          '$first': '$zone.name'
        },
        'schools': {
          '$push': {
            'school_id': '$_id',
            'school_name': '$school_name',
            'school_display_name': '$school_display_name',
            'zone_id': '$zone_id'
          }
        }
      }
    }, {
      '$sort': {
        'schools.school_display_name': 1
      }
    }
  ];

  if (countries && countries.length) {
    aggregateQue.unshift({
      '$match': {
        'country_id': { $in: countries }
      }
    });
  }

  if (zones && zones.length) {
    aggregateQue.unshift({
      '$match': {
        'zone_id': { $in: zones }
      }
    });
  }

  if (centers && centers.length) {
    aggregateQue.unshift({
      '$match': {
        '_id': { $in: centers }
      }
    });
  }
  return this.aggregate(aggregateQue);
}

centerSchema.statics.getZonesWithCentersGroupedNonAdmin = function (centers, countries, zones) {
  let aggregateQue = [
    {
      '$match': {
        '_id': { $in: centers }
      }
    },
    {
      '$lookup': {
        'from': 'zones',
        'localField': 'zone_id',
        'foreignField': '_id',
        'as': 'zone'
      }
    }, {
      '$unwind': {
        'path': '$zone'
      }
    }, {
      '$group': {
        '_id': '$zone_id',
        'zone_id': {
          '$first': '$zone._id'
        },
        'zone_name': {
          '$first': '$zone.name'
        },
        'schools': {
          '$push': {
            'school_id': '$_id',
            'school_name': '$school_name',
            'school_display_name': '$school_display_name',
            'zone_id': '$zone_id'
          }
        }
      }
    }, {
      '$sort': {
        'schools.school_display_name': 1
      }
    }
  ];

  if (countries && countries.length) {
    aggregateQue.unshift({
      '$match': {
        'country_id': { $in: countries }
      }
    });
  }

  if (zones && zones.length) {
    aggregateQue.unshift({
      '$match': {
        'zone_id': { $in: zones }
      }
    });
  }

  if (centers && centers.length) {
    aggregateQue.unshift({
      '$match': {
        '_id': { $in: centers }
      }
    });
  }
  return this.aggregate(aggregateQue);
}

module.exports = mongoose.model('Center', centerSchema);