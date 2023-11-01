const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const msgSchema = new Schema({
  title: {
    type: String
  },
  msg: {
    type: String
  },
  center_id: [{
    type: Schema.Types.ObjectID,
    ref: 'Center'
  }],
  attachment: [{
    type: String
  }],
  viewoption:{
    type: Schema.Types.ObjectID,
    ref: 'ViewOption'
  },
  added_by: {
    type: Number, // 1 == admin / 2 == non admin
    default: 0
  },
  success: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'active'
  },
  createdBy: {
    type: Schema.Types.ObjectID,
    ref: "Employee"
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

msgSchema.statics.getMessageDetail = function (msg_id) {
  return this.aggregate([
    {
      '$match':{
        _id : mongoose.Types.ObjectId(msg_id)
      }
    },{
      '$lookup': {
        from: "responses",
        localField: "_id",
        foreignField: "msg_id",
        as: "result",
      },
    },
    {
      '$project':{
        "_id":1,
        "title":1,
        "msg":1,
        "attachment":1,
        "sent":{
          $sum:"$result.sent_count"
        }
      }
    },
  ])
};

msgSchema.statics.getAllMessagesAdmin = function (sorting_field, skip, limit) {
  return this.aggregate([
    {
      '$match': {
        status: "active",
      },
    },
    {
      '$lookup': {
        from: "responses",
        localField: "_id",
        foreignField: "msg_id",
        as: "result",
      },
    },
    {
      '$sort': sorting_field
    },
    {
      $project:{
        "_id":1,
        "title":1,
        "msg":1,
        "attachment":1,
        "sent":{
          $sum:"$result.sent_count"
        }
      }
    },
    {
      '$skip': skip
    },
    {
      '$limit': limit
    }
  ])
};

msgSchema.statics.getAllMsgsNonAdmin = function (objectIds, sorting_field, skip, limit) {
  return this.aggregate([
    {
      '$match': {
        status: "active",
        $or:[
          { center_id: {
            $in: objectIds
          }},
          { added_by: 1 }
        ]
      }
    },
    {
      '$lookup': {
        from: "responses",
        let: { id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$msg_id', '$$id'] },
                  { $eq: ['$center_id', objectIds] }
                ]
              }
            }
          }
        ],
        as: "total",
      }
    },
    {
      '$unwind': {
        path: "$total",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      '$sort': sorting_field
    },
    {
      '$project': {
        'title':1,
        "msg":1,
        "attachment":1,
        "sent":"$total.sent_count"
      }
    },{
      '$skip': skip
    }, {
      '$limit': limit
    }
  ])
}

module.exports = mongoose.model('Message', msgSchema);