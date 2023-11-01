const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const followUpSchema = new Schema({
  status_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Statuses'
  },
  substatus_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Substatus'
  },
  follow_status: {
    type:String
  },
  follow_sub_status: {
    type:String
  },
  action_taken:[{
    type:String
  }],
  enq_stage: {
    type: String
  },
  type: {
    type: String
  },
  notes: {
    type: String
  },
  follow_up_date: {
    type: Date
  },
  follow_up_time: {
    type: String
  },
  tour_date: {
    type: Date
  },
  tour_time: {
    type: String
  },
  date_sort: {
    type: Date
  },
  someday: {
    type: Number,
    default: 0
  },
  no_followup: {
    type: Number,
    default: 0
  },
  country_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Country'
  },
  zone_id: {
    type: Schema.Types.ObjectId,
    ref: 'Zone'
  },
  center_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Center'
  },
  source_category: {
    type: String
  },
  lead_no : {
    type: String
  },
  lead_name: {
    type: String
  },
  child_name: {
    type: String
  },
  program_id:{
    type: Schema.Types.ObjectID,
    ref: 'Program'
  },
  parent_know_aboutus:[{
    type:String
  }],
  remark: {
    type: String
  },
  updatedBy_name: {
    type: String
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
  lead_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Lead'
  },
  is_whatsapp: {
    type: Number,
    default: 0
  },
  is_email: {
    type: Number,
    default: 0
  },
  not_to_show: {
    type: Number,
    default: 0
  },
  comm_mode: {
    type: String
  },
  order: {
    type: Number
  },
  success: {
    type: Boolean,
    default: true
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

followUpSchema.statics.followUpData = function (isAdmin, userId, type ,folow_id ,lead_id ) {
  // console.log(isAdmin, userId, type ,folow_id ,lead_id )

  if(isAdmin){
    if(type == "lead"){
      let aggregateQue = [
        {
          '$match':{
            _id:folow_id
          }
        },
        {
          '$lookup':{
            from: "centers",
            let: {center_id: '$center_id'},
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
            as: "center_id"
          }
        },
        {
          $unwind: '$center_id'
        },
        {
          $lookup:{
            from: "leads",
            let: {lead_id: '$lead_id'},
            pipeline: [
              {
                '$match':{
                  '$expr':{
                    '$eq':['$_id','$$lead_id']
                  }
                }
              },{
                '$project':{
                  'child_gender': 1, 'child_dob': 1, 'primary_parent': 1, 'parent_name': 1
                }
              }
            ],
            as: "lead_id"
          }
        },{
          '$unwind':'$lead_id'
        },
        {
          '$lookup':{
            from: "bookmarks",
            let :{leads_id: lead_id},
            pipeline:[
              {
                $match:{
                  $expr:{
                    $and:[
                      {$eq:['$type', "lead"]},
                      {$in: ['$$leads_id', '$leads_data']},
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
            "lead_no":1,
            "lead_name":1,
            "child_name":1,
            "enq_stage":1,
            "updatedAt":1,
            "type":1, "follow_status":1,
            "follow_sub_status":1,
            'follow_up_date': 1,
            "is_whatsapp":1,
            "is_email":1,
            "is_bookmark":{"$size":"$result"},
            "center_id":1,
            "lead_id":1
          }
      }]

      return this.aggregate(aggregateQue);
    }else{
      let aggregateQue = [
        {
          '$match':{
            _id:folow_id
          }
        },
        {
          '$lookup':{
            from: "centers",
            let: {center_id: '$center_id'},
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
            as: "center_id"
          }
        },
        {
          $unwind: '$center_id'
        },
        {
          $lookup:{
            from: "leads",
            let: {lead_id: '$lead_id'},
            pipeline: [
              {
                '$match':{
                  '$expr':{
                    '$eq':['$_id','$$lead_id']
                  }
                }
              },{
                '$project':{
                  'child_gender': 1, 'child_dob': 1, 'primary_parent': 1, 'parent_name': 1
                }
              }
            ],
            as: "lead_id"
          }
        },{
          '$unwind':'$lead_id'
        },
        {
          '$lookup':{
            from: "bookmarks",
            let :{leads_id: lead_id},
            pipeline:[
              {
                $match:{
                  $expr:{
                    $and:[
                      {$eq:['$type', "enq"]},
                      {$in: ['$$leads_id', '$enqs_data']},
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
            "lead_no":1,
            "lead_name":1,
            "child_name":1,
            "enq_stage":1,
            "updatedAt":1,
            "type":1, "follow_status":1,
            "follow_sub_status":1,
            'follow_up_date': 1,
            "is_whatsapp":1,
            "is_email":1,
            "is_bookmark":{"$size":"$result"},
            "center_id":1,
            "lead_id":1
          }
      }]

      return this.aggregate(aggregateQue);
    }
  }else{
    if(type == "lead"){
      let aggregateQue = [
        {
          '$match':{
            _id:folow_id
          }
        },
        {
          '$lookup':{
            from: "centers",
            let: {center_id: '$center_id'},
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
            as: "center_id"
          }
        },
        {
          $unwind: '$center_id'
        },
        {
          $lookup:{
            from: "leads",
            let: {lead_id: '$lead_id'},
            pipeline: [
              {
                '$match':{
                  '$expr':{
                    '$eq':['$_id','$$lead_id']
                  }
                }
              },{
                '$project':{
                  'child_gender': 1, 'child_dob': 1, 'primary_parent': 1, 'parent_name': 1
                }
              }
            ],
            as: "lead_id"
          }
        },{
          '$unwind':'$lead_id'
        },
        {
          '$lookup':{
            from: "bookmarks",
            let :{leads_id: lead_id},
            pipeline:[
              {
                $match:{
                  $expr:{
                    $and:[
                      {$eq:['$type', "lead"]},
                      {$in: ['$$leads_id', '$leads_data']},
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
            "lead_no":1,
            "lead_name":1,
            "child_name":1,
            "enq_stage":1,
            "updatedAt":1,
            "type":1, "follow_status":1,
            "follow_sub_status":1,
            'follow_up_date': 1,
            "is_whatsapp":1,
            "is_email":1,
            "is_bookmark":{"$size":"$result"},
            "center_id":1,
            "lead_id":1
          }
      }]

      return this.aggregate(aggregateQue);
    }else{
      let aggregateQue = [
        {
          '$match':{
            _id:folow_id
          }
        },
        {
          '$lookup':{
            from: "centers",
            let: {center_id: '$center_id'},
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
            as: "center_id"
          }
        },
        {
          $unwind: '$center_id'
        },
        {
          $lookup:{
            from: "leads",
            let: {lead_id: '$lead_id'},
            pipeline: [
              {
                '$match':{
                  '$expr':{
                    '$eq':['$_id','$$lead_id']
                  }
                }
              },{
                '$project':{
                  'child_gender': 1, 'child_dob': 1, 'primary_parent': 1, 'parent_name': 1
                }
              }
            ],
            as: "lead_id"
          }
        },{
          '$unwind':'$lead_id'
        },
        {
          '$lookup':{
            from: "bookmarks",
            let :{leads_id: lead_id},
            pipeline:[
              {
                $match:{
                  $expr:{
                    $and:[
                      {$eq:['$type', "enq"]},
                      {$in: ['$$leads_id', '$enqs_data']},
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
            "lead_no":1,
            "lead_name":1,
            "child_name":1,
            "enq_stage":1,
            "updatedAt":1,
            "type":1, "follow_status":1,
            "follow_sub_status":1,
            'follow_up_date': 1,
            "is_whatsapp":1,
            "is_email":1,
            "is_bookmark":{"$size":"$result"},
            "center_id":1,
            "lead_id":1
          }
      }]

      return this.aggregate(aggregateQue);
    }
  }
}

module.exports = mongoose.model('Followup', followUpSchema);