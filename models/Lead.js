const momentZone = require('moment-timezone');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const timeZone = momentZone.tz.guess();
const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

const leadSchema = new Schema({
  substatus_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Substatus'
  },
  child_first_name:{
    type:String
  },
  lead_date: {
    type: Date
  },
  lead_no: {
    type: String
  },
  child_dob:{
    type:Date
  },
  child_last_name:{
    type:String
  },
  child_gender:{
    type:String
  },
  child_pre_school:{
    type:String
  },
  programcategory_id:{
    type: Schema.Types.ObjectID,
    ref: 'Programcategory'
  },
  program_id:{
    type: Schema.Types.ObjectID,
    ref: 'Program'
  },
  primary_parent:{
    type:String
  },
  parent_name:{
    type:String
  },
  parent_first_contact:{
    type:String
  },
  parent_second_contact:{
    type:String
  },
  parent_second_whatsapp:{
    type:Number
  },
  parent_first_whatsapp:{
    type:Number
  },
  parent_whatsapp:{
    type:String
  },
  parent_email:{
    type:String
  },
  parent_education:{
    type:String
  },
  parent_profession:{
    type:String
  },
  parent_reference:{
    type:String
  },
  secondary_parent_name:{
    type:String
  },
  secondary_parent_type:{
    type:String
  },
  secondary_first_contact:{
    type:String
  },
  secondary_Second_contact:{
    type:String
  },
  secondary_second_whatsapp:{
    type:Number
  },
  secondary_first_whatsapp:{
    type:Number
  },
  secondary_whatsapp:{
    type:String
  },
  secondary_email:{
    type:String
  },
  secondary_education:{
    type:String
  },
  secondary_profession:{
    type:String
  },
  parent_country:{
    type: Schema.Types.ObjectID,
    ref: 'Country'
  },
  parent_state:{
    type: Schema.Types.ObjectID,
    ref: 'State'
  },
  viewoption:{
    type: Schema.Types.ObjectID,
    ref: 'ViewOption'
  },
  parent_pincode:{
    type:String
  },
  parent_area:{
    type:String
  },
  parent_city:{
    type: Schema.Types.ObjectID,
    ref: 'City'
  },
  parent_address:{
    type:String
  },
  parent_street:{
    type:String
  },
  parent_house:{
    type:String
  },
  parent_landmark:{
    type:String
  },
  source_category:{
    type:String
  },
  parent_know_aboutus:[{
    type:String
  }],
  status_id:{
    type: Schema.Types.ObjectID,
    ref: 'Statuses'
  },
  substatus_id:{
    type: Schema.Types.ObjectID,
    ref: 'Substatus'
  },
  school_id:{
    type: Schema.Types.ObjectID,
    ref: 'Center'
  },
  zone_id: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  country_id: {
    type: Schema.Types.ObjectID,
    ref: 'Country'
  },
  remark:{
    type:String
  },
  action_taken:[{
    type:String
  }],
  stage:{
    type:String
  },
  type:{
    type:String
  },
  enrolled: {
    type: Number,
    default: 0
  },
  do_followup: {
    type: Number,
    default: 1
  },
  someday_follow: {
    type: Number,
    default: 1
  },
  initial_status: {
    type: Schema.Types.ObjectID,
    ref: 'Statuses'
  },
  initial_sub_status: {
    type: Schema.Types.ObjectID,
    ref: 'Substatus'
  },
  initial_action:[{
    type:String
  }],
  initial_notes: {
    type: String
  },
  initial_updated_date: {
    type: Date,
    default: Date.now
  },
  initial_stage: {
    type: String
  },
  follow_due_date:{
    type: Date
  },
  follow_due_time:{
    type: String
  },
  is_external:{
    type: Number,
    default: 0
  },
  external_source:{
    type: String
  },
  sibling: {
    type: Number,
    default: 0
  },
  is_related: {
    type: Schema.Types.ObjectID,
    ref: 'Lead',
    default: null
  },
  is_dup: {
    type: Number,
    default: 0
  },
  dup_no: {
    type: Number
  },
  comm_mode_latest: {
    type: String
  },
  cor_parent: {
    type: String
  },
  company_name_parent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  updatedBy_name: {
    type: String
  },
  createdBy_name: {
    type: String
  },
  createdAt: {
    type: Date,
    default: dateByTimeZone
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

leadSchema.index({
  lead_no: "text",
  child_last_name: "text",
  child_first_name: "text",
  parent_first_contact: "text",
  parent_email: "text",
  parent_name: "text"
});

leadSchema.statics.leadData = function (isAdmin, start, end, userId, skip, limit, objectIdArray, sorting_feild) {
  let matchObj = {}
  if (isAdmin) {
    matchObj = {
      $match:{
        type:"lead",
        lead_date:{
          '$gte': start,
          '$lte': end
        }
      }
    };
  } else {
    matchObj = {
      $match:{
        school_id: {$in: objectIdArray},
        type:"lead",
        lead_date:{
          '$gte': start,
          '$lte': end
        }
      }
    };
  };
  let aggregateQue = [
    {
      $lookup:{
        from: "centers",
        let: {center_id: '$school_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$center_id']
              }
            }
          },{
            '$project':{
              '_id':1,
              'school_name':1,
              'school_display_name':1
            }
          }
        ],
        as: "school_id"
      }
    },{
      $unwind:{
        path: '$school_id'
      }
    },{
      $lookup:{
        from: "statuses",
        let:{status: '$status_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$status']
              }
            }
          },{
            '$project':{
              '_id':1,
              'name':1
            }
          }
        ],
        as: "status_id"
      }
    },{
      $unwind:{
        path: '$status_id'
      }
    },{
      $lookup:{
        from: "substatuses",
        let:{substatus: '$substatus_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$substatus']
              }
            }
          },{
            '$project':{
              '_id':1,
              'name':1
            }
          }
        ],
        as: "substatus_id"
      }
    },{
      $unwind:{
        path: '$substatus_id'
      }
    },{
      $lookup:{
        from: "bookmarks",
        let :{lead_id: '$_id'},
        pipeline:[
          {
            $match:{
              $expr:{
                $and:[
                  {$eq:['$type', "lead"]},
                  {$in: ['$$lead_id', '$leads_data']},
                  {$eq: ['$user_id', userId]},
                  // {$in: ['$leads_data', '$$lead_id']}
                ]
              }
            }
          }
        ],
        as: 'result'
      }
    },{
      $project:{
        "_id":1,
        "lead_no":1,
        "stage":1,
        "parent_name":1,
        "child_first_name":1,
        "child_last_name":1,
        "child_gender":1,
        "child_dob":1,
        "updatedAt":1,
        "follow_due_date":1,
        "follow_due_time":1,
        "is_bookmark":{"$size":"$result"},
        "school_id":1,
        "status_id":1,
        'substatus_id':1,
        "lead_date":1
      }
    },{
      '$skip': skip
    },{
      '$limit': limit
    },{
      '$sort':sorting_feild
    }
  ];
  aggregateQue.unshift(matchObj);
  console.log(aggregateQue);
  return this.aggregate(aggregateQue);
};

leadSchema.statics.leadCount = function (isAdmin, start, end, objectIdArray) {
  let matchObj = {};
  if (isAdmin) {
    matchObj = {
      type: "lead",
      lead_date: {
        '$gte': start,
        '$lte': end
      }
    }
  } else {
    matchObj = {
      school_id: {$in: objectIdArray},
      type: "lead",
      lead_date: {
        '$gte': start,
        '$lte': end
      }
    }
  }
  return this.countDocuments(matchObj);
};
leadSchema.statics.enquiryData = function (isAdmin, start, end, userId, skip, limit, objectIdArray) {
  let matchObj = {}
  if (isAdmin) {
    matchObj = {
      $match:{
        type:"enquiry",
        lead_date:{
          '$gte': start,
          '$lte': end
        }
      }
    };
  } else {
    matchObj = {
      $match:{
        school_id: {$in: objectIdArray},
        type:"enquiry",
        lead_date:{
          '$gte': start,
          '$lte': end
        }
      }
    };
  };
  let aggregateQue = [
    {
      $lookup:{
        from: "centers",
        let: {center_id: '$school_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$center_id']
              }
            }
          },{
            '$project':{
              '_id':1,
              'school_name':1,
              'school_display_name':1
            }
          }
        ],
        as: "school_id"
      }
    },{
      $unwind:{
        path: '$school_id'
      }
    },{
      $lookup:{
        from: "statuses",
        let:{status: '$status_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$status']
              }
            }
          },{
            '$project':{
              '_id':1,
              'name':1
            }
          }
        ],
        as: "status_id"
      }
    },{
      $unwind:{
        path: '$status_id'
      }
    },{
      $lookup:{
        from: "substatuses",
        let:{substatus: '$substatus_id'},
        pipeline: [
          {
            '$match':{
              '$expr':{
                '$eq':['$_id','$$substatus']
              }
            }
          },{
            '$project':{
              '_id':1,
              'name':1
            }
          }
        ],
        as: "substatus_id"
      }
    },{
      $unwind:{
        path: '$substatus_id'
      }
    },{
      $lookup:{
        from: "bookmarks",
        let :{lead_id: '$_id'},
        pipeline:[
          {
            $match:{
              $expr:{
                $and:[
                  {$eq:['$type', "enq"]},
                  {$in: ['$$lead_id', '$enqs_data']},
                  {$eq: ['$user_id', userId]},
                  // {$in: ['$leads_data', '$$lead_id']}
                ]
              }
            }
          }
        ],
        as: 'result'
      }
    },{
      $project:{
        "_id":1,
        "lead_no":1,
        "stage":1,
        "parent_name":1,
        "child_first_name":1,
        "child_last_name":1,
        "child_gender":1,
        "child_dob":1,
        "updatedAt":1,
        "follow_due_date":1,
        "follow_due_time":1,
        "is_bookmark":{"$size":"$result"},
        "school_id":1,
        "status_id":1,
        'substatus_id':1,
        "lead_date":1
      }
    },{
      '$skip': skip
    },{
      '$limit': limit
    },{
      '$sort':{
        lead_date:-1
      }
    }
  ];
  aggregateQue.unshift(matchObj);
  console.log(aggregateQue);
  return this.aggregate(aggregateQue);
};

leadSchema.statics.enquiryCount = function (isAdmin, start, end, objectIdArray) {
  let matchObj = {};
  if (isAdmin) {
    matchObj = {
      type: "enquiry",
      lead_date: {
        '$gte': start,
        '$lte': end
      }
    }
  } else {
    matchObj = {
      school_id: {$in: objectIdArray},
      type: "enquiry",
      lead_date: {
        '$gte': start,
        '$lte': end
      }
    }
  }
  return this.countDocuments(matchObj);
};

leadSchema.statics.reportCountDefault = function (date, timeZone, center_id) {
  return this.countDocuments({
    lead_date: {
      $gte: momentZone.tz(date, "Asia/Kolkata").startOf('day').toDate(),
      $lte: momentZone.tz(date, "Asia/Kolkata").endOf('day').toDate()
    },
    school_id: center_id
  });
}

module.exports = mongoose.model('Lead', leadSchema);