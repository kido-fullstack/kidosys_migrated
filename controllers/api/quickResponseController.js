const mongoose = require('mongoose');
const Message = mongoose.model("Message");
const Acknowledgment = mongoose.model("Acknowledgment");
const Lead = mongoose.model("Lead");
const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuid = require('uuid');
const Media = mongoose.model('Media');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const multer = require('multer');
const formidable = require('formidable');

// Adding to support get all lead list quick response API.
const Center = mongoose.model("Center");
const Feed = mongoose.model("Feed");

exports.test= async (req,res,next) => {
    console.log("testing")
}

exports.getAllQuickResponse = async (req,res,next) => {
  try {
    let messages;
    let totalCountDoc;
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;

    let sorting_field = { "createdAt": -1 };
    if (req.query) {
      if (req.query.message_title) {
        if (req.query.message_title == "asc") {
          sorting_field = { "title": 1 }
        } else {
          sorting_field = { "title": -1 }
        }
      } else if (req.query.data) {
        if (req.query.data == "asc") {
          sorting_field = { "createdAt": 1 }
        } else {
          sorting_field = { "createdAt": -1 }
        }
      }
    }
    if (req.user && req.user.main == req.config.admin.main) {
      messages = await Message.getAllMessagesAdmin(sorting_field, skip, limit);
      totalCountDoc = await Message.countDocuments();
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      messages = await Message.getAllMsgsNonAdmin(objectIdArray, sorting_field, skip, limit)
      totalCountDoc = await Message.countDocuments({$or:[{center_id: {$in: objectIdArray}},{added_by:1}]});
    }
    if (!messages.length) {
      return res.status(400).json(response.responseError("Quick Response not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    return res.status(200).json(response.responseSuccess("All Quick Response", {total_records :totalCountDoc, messages}, 200));
  } catch (err) {
  helper.errorDetailsForControllers(err, "allQuickresponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
  next(err);
  return;
  }
}

exports.searchQuickResponse = async (req,res,next) => {
  try{
    let messages
    let totalCountDoc
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {
      if (req.body && req.body.search) {
        let aggregateQue = [
          {
            '$match': {
              status: "active",
            },
          },
          {
            '$match': {
              '$or': [
                {
                  title: {
                    $regex: req.body.search,
                    $options: 'i'
                  }
                },
                {
                  msg: {
                    $regex: req.body.search,
                    $options: 'i'
                  }
                }
              ]
            }
          },
          {

            '$sort': { createdAt: -1 }

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
            '$project': {
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
            '$sort': {
              "result": -1,
            },
          },
          {
            '$skip': skip
          }, {
            '$limit': limit
          }
        ]
        messages = await Message.aggregate(aggregateQue)
        aggregateQue.splice(aggregateQue.length - 2, 2)
        totalCountDoc = await Message.aggregate(aggregateQue)
      } else {
        return res.status(400).json(response.responseError("Invalid search provided.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      if (req.body && req.body.search) {
        aggregateQue = [{
          $match: {
            status: "active",
            $or:[
              { center_id: {
                $in: objectIdArray
              }},
              {added_by:1}
            ]
          }
        },
        {
          '$match': {
            $or: [
              {
                title: {
                  $regex: req.body.search,
                  $options: 'i'
                }
              },
              {
                msg: {
                  $regex: req.body.search,
                  $options: 'i'
                }
              }
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
                      { $eq: ['$center_id', objectIdArray] }
                    ]
                  }
                }
              }
            ],
            as: "total",
          },
        },
        {
          $unwind: {
            path: "$total",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort:{createdAt:-1}
        },{
            $project:{
              "_id":1,
              "title":1,
              "msg":1,
              "attachment":1,
              "sent":{
                $sum:"$total.sent_count"
              }
            }
        },
        {
          '$skip': skip
        }, {
          '$limit': limit
        }
       ]
       messages = await Message.aggregate(aggregateQue)
       aggregateQue.splice(aggregateQue.length - 2, 2)
      // console.log(aggregateQue,"aggregateQue")
       totalCountDoc = await Message.aggregate(aggregateQue)
      } else {
        return res.status(400).json(response.responseError("Invalid search provided.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    }
    if (!messages.length) {
      return res.status(400).json(response.responseError("Quick Responses not found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    return res.status(200).json(response.responseSuccess("All Quick Responses", {total_records :totalCountDoc.length, messages}, 200));
  }catch (err) {
  helper.errorDetailsForControllers(err, "allQuickresponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
  next(err);
  return;
  }
}

const multerOptions = {
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
      // console.log(file,"difll")
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: function (req, file, next) {
    const whitelist = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    const fileType = file.mimetype
    const fileSize = parseInt(req.headers['content-length']);
    console.log(fileType,"isphot")
    console.log(fileSize,"fileSize")
    if (whitelist.includes(fileType)) {
      if (fileSize < 1048576) {
        next(null, true);
      } else {
        next({
          message: 'File size should be less than 1 mb'
        }, false);
      }
    } else {
      console.log("file not allowed!")
      next({
        message: 'That filetype is not allowed!'
      }, false);
    }
  }
};

exports.uploadFileIntoMedia = async (req, res, next) => {
  try {
    let title;
    let msg;
    let fileThere;
    let att;
    let mediaForm = new IncomingForm({
      // maxFileSize: 1048576,
      multiples: false
    });
    // mediaForm.once('error', (err) => {
    //   console.log(err);
    //   return res.status(400).json(response.responseError("maximum file size is 1 mb & cannot upload more than 1 file.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    // });
    mediaForm.parse(req, function (err, fields, files) {
      // console.log(Object.keys(files).length,"lengthuuu");
      req.body.fileThere = Object.keys(files).length;
      title = fields.title || "";
      msg = fields.msg || "";
      // console.log('fileThere---yu->', req.body.fileThere);
      if(req.body.fileThere){
        const whitelist = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        if (whitelist.includes(files.attachment.mimetype)) {
          console.log("allowed")
          if(files.attachment.size > 1048576){
            return res.status(400).json(response.responseError("maximum file size is 1 mb & cannot upload more than 1 file.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
          let name = `${files.attachment.originalFilename.split('.').shift()}~${crypto.randomBytes(2).toString('hex')}.${files.attachment.originalFilename.split('.').pop()}`;
          // let name = `${files.originalFilename}`
          let dest = `./public/uploads/${name}`;
          let data = fs.readFileSync(files.attachment.filepath);
          fs.writeFileSync(dest, data);
          // fs.unlinkSync(this.openedFiles[x].filepath);
          let img = new Media({
            file_size: files.size,
            file_type: files.mimetype,
            file_name: `${req.config.siteHeader}://${req.headers.host}/uploads/${name}`,
            file_extension:  files.attachment.originalFilename.split('.').pop(),
            og_file_name: files.attachment.originalFilename.split('.').shift()
          });
          img.save()
            .then(done => {
              // res.send('uploaded');
              // return;
              // console.log("title----,", title);
              // console.log("msg----,", msg);
              req.body.title = title;
              req.body.msg = msg;
              req.body.attachment = done.file_name || "";
              next();
            })
            .catch(e => next(e));

        }else{
          return res.status(400).json(response.responseError("This File is Not Allowed ", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
        }
      }else{
        // console.log(files,title,msg)
        // console.log("title----,", title);
        // console.log("msg----,", msg);
        req.body.title = title;
        req.body.msg = msg;
        req.body.attachment = "";
        next();
      }
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "uploadFileIntoMedia not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.upload = multer(multerOptions).single('attachment')

exports.resizeBanner = async (req, res, next) => {
  if (!req.file) {
    req.body.file = "";
    next();
  } else {
    console.log(req.file,"reeeeeeeee")
    const extension = req.file.originalname
    const imageName = `${Date.now()}-${extension}`;
    req.body.file = `https://${req.headers.host}/uploads/${imageName}`;
    console.log(req.body.file);
    next();
  }
}

exports.postCreateMessage = async (req,res,next) => {
  try {
    console.log("req.body--->", req.body);
    const newMsg = new Message({
      title: req.body.title,
      msg: req.body.msg,
      attachment: req.body.attachment,
      status: "active",
      viewoption: req.user.view_option,
      center_id: req.user.center_id,
      added_by: req.user.main && req.user.main == req.config.admin.main ? 1 : 0
    });
    console.log("newMsg---->", newMsg);
    await newMsg.save();
    return res.status(200).json(response.responseSuccess("New Message Created Succesfuly", 200));
  } catch(err) {
    helper.errorDetailsForControllers(err, "postCreateMessage not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
}
exports.postUpdateMessage = async (req,res,next) => {
  try{
    const oldMessage = await Message.findById({_id:req.params.message_id})
    const updateMessage = Message.updateOne({
      _id: req.params.message_id
    }, {
      $set: {
        title: req.body.title,
        msg: req.body.msg,
        attachment:req.body.attachment ? req.body.attachment : oldMessage.attachment ,
      },
    }, { new: true }
    ).exec((err, result) => {
      if (err) {
        console.log(err,"err")
        return res.status(400).json(response.responseError("Meesage Not Updated", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess(" Message Updated Succesfuly", 200));
    })
  }catch(err){
    helper.errorDetailsForControllers(err, "postCreateMessage not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.getDetailQuickResponse = async (req,res,next) => {
  try {
    if (!req.params.message_id) {
      return res.status(400).json(response.responseError("Invalid parameter provided!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    let messages = await Message.getMessageDetail(req.params.message_id);
    if (!messages.length) {
      return res.status(400).json(response.responseError("Quick Response details not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    return res.status(200).json(response.responseSuccess("Detailed Quick Response",  messages, 200));
  }catch(err){
    helper.errorDetailsForControllers(err, "getDeatilQuickResponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.getExistingClientQuickResponse = async (req,res,next) => {
  try{
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {
      return res.status(400).json(response.responseError("This api is not available for admin.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let leads = await Acknowledgment.find({
        msg_id: req.params.message_id,
        center_id:{$in: objectIdArray}
      }, {
        parent_name:1,
        lead_no:1,
        lead_date:1,
        child_first_name:1,
        child_last_name:1,
        parent_email:1,
        parent_whatsapp:1,
        last_sent:1
      })
        .sort({ last_sent: -1 })
        .skip(skip)
        .limit(limit)
      let result = leads.map(a => a.lead_id);
      let totalCountDoc = await Acknowledgment.countDocuments({
        msg_id: req.params.message_id,
        center_id:{
          $in: objectIdArray
        }});
      if (!leads.length) {
        return res.status(400).json(response.responseError("Existing Clients not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Existing Clients", {total_records :totalCountDoc, leads}, 200));
    }
  } catch(err) {
    helper.errorDetailsForControllers(err, "getExistingClientQuickResponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}
exports.getOtherClientQuickResponse = async (req, res, next) => {
  try{
    // console.log(req.params.message_id ,"existingclientt")
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {
      return res.status(400).json(response.responseError("This api is not available for admin.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let acknowledgments = await Acknowledgment.find({ msg_id: req.params.message_id })
      let result = acknowledgments.map(a => a.lead_id);
      let leads = await Lead.find({
        school_id: {
          $in: objectIdArray
        },
        _id: {
          $nin: result
        } },{
          parent_name:1,
          lead_no:1,
          lead_date:1,
          child_first_name:1,
          child_last_name:1,
          parent_email:1,
          parent_whatsapp:1
        })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt:-1 })
      // console.log(leads,"uuuu")
      let totalCountDoc = await Lead.countDocuments({ school_id: {$in: objectIdArray}, _id: { $nin: result } });
      // console.log(leads,"opopo")
      if (!leads.length) {
        return res.status(400).json(response.responseError("Other Client not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Other Client", {total_records :totalCountDoc, leads}, 200));
    }
  }catch(err){
    helper.errorDetailsForControllers(err, "getOtherClientQuickResponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.getAllLeadQuickResponse = async (req,res,next) =>{
  try {
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {
      let leadPromise =  Lead.find({},{
        parent_name:1,
        lead_no:1,
        lead_date:1,
        child_first_name:1,
        child_last_name:1,
        parent_email:1,
        parent_whatsapp:1
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt:-1 })
      let countPromise = Lead.countDocuments({})
      const [leads, count] = await Promise.all([leadPromise, countPromise]);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Other Clients.", {total_records :count, leads}, 200));
    } else {
      return res.status(400).json(response.responseError("This api is not available for non-admin user(s).", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch(err) {
    helper.errorDetailsForControllers(err, "getAllLeadQuickResponse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

/* 
  This method is responsible to send quick response through list
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.sendQuickResponseThroughList = async (req, res, next) => {
  try {
    let message = await Message.findOne({ _id: req.params.message_id }, {
      title: 1,
      msg: 1,
      attachment: 1,
      status: 1
    });
    if (message) {
      const responses = await Response.find({ msg_id: req.params.message_id }, {
        sent_count: 1
      });

      return res.status(200).json(response.responseSuccess("Send quick response - message", {message, sent_count: _.sumBy(responses, function(response) { return response.sent_count; })}, 200));
    } else {
      return res.status(400).json(response.responseError("Message not found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "sendQuickResponseThroughList not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

/* 
  This method is responsible to get all lead list quick response
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.getAllLeadListQuickResponse = async (req, res, next) => {
  try {
    let aggregateQue = [];
    let bookmarkedLeads = [];
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;

    if (req.user && req.user.main == req.config.admin.main) {
      // Admin
      let centers = await Center.find({status: "active"}).distinct('_id');
      // let message = await Message.findOne({ _id: req.params.message_id });
      aggregateQue = [
        {
          '$match': {
            'school_id': {$in: centers}
          }
        }, {
          '$sort': {
            'lead_date': -1
          }
        },{
          '$lookup': {
            'from': 'statuses',
            'localField': 'status_id',
            'foreignField': '_id',
            'as': 'status_id'
          }
        }, {
          '$unwind': {
            'path': '$status_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'substatuses',
            'localField': 'substatus_id',
            'foreignField': '_id',
            'as': 'substatus_id'
          }
        }, {
          '$unwind': {
            'path': '$substatus_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'child_first_name': 1,
            'child_last_name': 1,
            'parent_name': 1,
            'parent_first_contact': 1,
            'parent_second_contact': 1,
            'parent_second_whatsapp': 1,
            'parent_first_whatsapp': 1,
            'parent_whatsapp': 1,
            'parent_email': 1,
            'secondary_first_contact': 1,
            'secondary_Second_contact': 1,
            'secondary_second_whatsapp': 1,
            'secondary_first_whatsapp': 1,
            'secondary_whatsapp': 1,
            'secondary_email': 1,
            'status_id.name': 1,
            'substatus_id.name': 1,
            'stage': 1,
            'follow_due_date': 1,
            'follow_due_time': 1,
            'updatedAt': 1
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }
      ];

      // SEARCHES START
      if (req.query.search) {
        aggregateQue.unshift({
          '$match': {
            $or: [
              {
                parent_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                child_first_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                child_last_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                parent_first_contact: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                parent_email: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              }
            ]
          }
        })
      }
      //SEARCHES END

      // STAGE START
      if (req.query.stage) {
        aggregateQue.unshift({
          '$match': {
            'stage': req.query.stage
          }
        });
      }
      // STAGE END

      // STATUS START
      if (req.query.status) {
        let status = req.query.status.map(s => mongoose.Types.ObjectId(s));
        aggregateQue.unshift({
          '$match': {
            'status_id': {$in:status}
          }
        });
      }
      // STATUS END

      // PROGRAM START
      if (req.query.program) {
        let program = req.query.program.map(s => mongoose.Types.ObjectId(s));
        findQue = {
          program_id: {$in:program}
        };
        aggregateQue.unshift({
          '$match': {
            'program_id': {$in:program}
          }
        });
      }
      // PROGRAM END

      const leads = await Lead.aggregate(aggregateQue);
      aggregateQue.splice(aggregateQue.length - 2, 2);
      const totalCount = await Lead.aggregate(aggregateQue);

      // bookmark leads
      const bookmarkLists = await Bookmark.findOne({
        user_id: req.user._id,
        type: "lead"
      }, {
        leads_data: 1
      });

      if (leads && leads.length) {
        if (bookmarkLists) {
          // Bookmark found
          const leadBookmarkIds = bookmarkLists.leads_data && bookmarkLists.leads_data.length ? _.map(bookmarkLists.leads_data, function (id) {
            return id.toString()
          }) : []

          _.map(leads, function (lead) {
            if (leadBookmarkIds.includes(lead._id.toString())) {
              lead.is_bookmark = 1;
            } else {
              lead.is_bookmark = 0;
            }
            return lead;
          });
        } else {
          // Bookmark not found
          _.map(leads, function (lead) {
            return lead.is_bookmark = 0;
          });
        }
      }

      if (!leads.length) {
        return res.status(400).json(response.responseError("lead list not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All lead list", {total_records :totalCount.length, leads}, 200));
    } else {
      // Non-Admin
      let message = await Message.findOne({ _id: req.params.message_id });
      let centers = await Center.find({_id: {$in: req.user.center_id}, status: "active"}).distinct('_id');
      let acknowledgments = await Acknowledgment.find({ msg_id: message._id })
      let result = acknowledgments.map(acknowledgment => acknowledgment.lead_id);

      let aggregateQue = [
        {
          '$match': {
            'school_id': {$in: centers}
          }
        }, {
          '$match': {
            '_id': { $nin: result }
          }
        }, {
          '$sort': {
            'lead_date': -1
          }
        },{
          '$lookup': {
            'from': 'statuses',
            'localField': 'status_id',
            'foreignField': '_id',
            'as': 'status_id'
          }
        }, {
          '$unwind': {
            'path': '$status_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'substatuses',
            'localField': 'substatus_id',
            'foreignField': '_id',
            'as': 'substatus_id'
          }
        }, {
          '$unwind': {
            'path': '$substatus_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'child_first_name': 1,
            'child_last_name': 1,
            'parent_name': 1,
            'parent_first_contact': 1,
            'parent_second_contact': 1,
            'parent_second_whatsapp': 1,
            'parent_first_whatsapp': 1,
            'parent_whatsapp': 1,
            'parent_email': 1,
            'secondary_first_contact': 1,
            'secondary_Second_contact': 1,
            'secondary_second_whatsapp': 1,
            'secondary_first_whatsapp': 1,
            'secondary_whatsapp': 1,
            'secondary_email': 1,
            'status_id.name': 1,
            'substatus_id.name': 1,
            'stage': 1,
            'follow_due_date': 1,
            'follow_due_time': 1,
            'updatedAt': 1
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }
      ];

      // SEARCHES START
      if (req.query.search) {
        aggregateQue.unshift({
          '$match': {
            $or: [
              {
                parent_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                child_first_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                child_last_name: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                parent_first_contact: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              },
              {
                parent_email: {
                  $regex: req.query.search,
                  $options: 'i'
                }
              }
            ]
          }
        })
      }
      //SEARCHES END

      // STAGE START
      if (req.query.stage) {
        aggregateQue.unshift({
          '$match': {
            'stage': req.query.stage
          }
        });
      }
      // STAGE END

      // STATUS START
      if (req.query.status) {
        let status = req.query.status ? JSON.parse(req.query.status).map(s => mongoose.Types.ObjectId(s)) : [];
        aggregateQue.unshift({
          '$match': {
            'status_id': {$in:status}
          }
        });
      }
      // STATUS END

      // PROGRAM START
      if (req.query.program) {
        let program = req.query.program ? JSON.parse(req.query.program).map(s => mongoose.Types.ObjectId(s)) : [];
        findQue = {
          program_id: {$in:program}
        };
        aggregateQue.unshift({
          '$match': {
            'program_id': {$in:program}
          }
        });
      }
      // PROGRAM END

      const leads = await Lead.aggregate(aggregateQue);
      aggregateQue.splice(aggregateQue.length - 2, 2);
      const totalCount = await Lead.aggregate(aggregateQue);

      // bookmark leads
      const bookmarkLists = await Bookmark.findOne({
        user_id: req.user._id,
        type: "lead"
      }, {
        leads_data: 1
      });

      if (leads && leads.length) {
        if (bookmarkLists) {
          // Bookmark found
          const leadBookmarkIds = bookmarkLists.leads_data && bookmarkLists.leads_data.length ? _.map(bookmarkLists.leads_data, function (id) {
            return id.toString()
          }) : []

          _.map(leads, function (lead) {
            if (leadBookmarkIds.includes(lead._id.toString())) {
              lead.is_bookmark = 1;
            } else {
              lead.is_bookmark = 0;
            }
            return lead;
          });
        } else {
          // Bookmark not found
          _.map(leads, function (lead) {
            return lead.is_bookmark = 0;
          });
        }
      }

      if (!leads.length) {
        return res.status(400).json(response.responseError("lead list not found", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All lead list", {total_records :totalCount.length, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllLeadListQuickResponse not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

/*
  This method is responsible to send message to lead.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.postSendMessageToLead = async (req, res, next) => {
  try {
    let newMsg;
    let string = "@client_name";
    let msg = req.body.message;
    let lead = await Lead.findOne({ _id: req.body.lead_id });
    let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));

    let message_id = req.body.message_id;
    let whatsapp_no = req.body.to;
    let email_id = req.body.to;

    if(msg.includes(string)){
      newMsg = msg.replace("@client_name",`${lead.parent_name}`);
    } else {
      newMsg = req.body.message;
    }

    let checkWhatsapp = req.body.type;
    let message = await Message.findById({ _id: message_id });

    // Save feed module
    let feed;
    let centeridForFeed = [];
    let userType;
    if (req.user && req.user.main == req.config.admin.main) {
      // Admin
      userType = "admin";
      feed = await Feed.countDocuments({});
    } else {
      // Non-Admin
      userType = "nonadmin";
      centeridForFeed = objectIdArray
      feed = await Feed.countDocuments({
        center_id: {
          $in: objectIdArray
        }
      });
    }
    const saveFeed = new Feed({
      parent_name: lead.parent_name,
      msg: newMsg || message.msg,
      msg_id: message_id,
      center_id: centeridForFeed,
      user_type: userType,
      'last_sent.last_date': moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY"),
      'last_sent.last_time': moment.utc().tz("Asia/Kolkata").format("hh:mm A"),
      medium: checkWhatsapp == "whatsapp" ? "Whatsapp" : "E-mail",
      count: feed + 1,
      updatedBy_name: req.user.name
    });
    await saveFeed.save();
    // Save feed module

    if (checkWhatsapp == "whatsapp") {
      // Whatsapp sending
      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY");
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm A");
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a");
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

      let lead_id = req.body.lead_id;
      let message = await Message.findById({ _id: message_id });
      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in: objectIdArray}}]});

      if (response) {
        // got response
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394ba0b858bfdf6844e96e",
          substatus_id: "64394c0cb858bfdf6844e973",
          follow_status: "Quick Response (Whatsapp)",
          follow_sub_status: "WhatsApp",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "whatsapp",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id,
            center_id: { $in: objectIdArray }
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              center_id: req.user.center_id,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(lead_id) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          return res.status(200).json(responseJSON.responseSuccess("Send whatsapp message to lead", null, 200));
        });
      } else {
        // got no response
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.user.center_id,
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
        });
        await newResponse.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // got acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // got no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394ba0b858bfdf6844e96e",
          substatus_id: "64394c0cb858bfdf6844e973",
          follow_status: "Quick Response (Whatsapp)",
          follow_sub_status: "WhatsApp",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "whatsapp",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(lead_id) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        return res.status(200).json(responseJSON.responseSuccess("Send whatsapp message to lead", null, 200));
      }
    } else if (checkWhatsapp == "email") {
      // Email sending
      let finMsg = newMsg.replace(/\n/g,"<br>");

      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY");
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm A");
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a");
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

      let lead_id = req.body.lead_id;
      let message = await Message.findById({ _id: message_id });
      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in: objectIdArray}}]});

      if (response) {
        // got response
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id,
            center_id: { $in: objectIdArray }
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              center_id: req.user.center_id,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(lead_id) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          // send a mail
          await mail.send2({
            user: email_id,
            subject: message.title,
            msg: {msg: finMsg, attachment: message.attachment || []},
            filename: "email-message-send",
            title: "KIDO India",
          });
          return res.status(200).json(responseJSON.responseSuccess("Email Sent.", null, 200));
        });
      } else {
        // got no response
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.user.center_id,
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
        });
        await newResponse.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // got acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // got no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(lead_id) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        await mail.send2({
          user: email_id,
          subject: message.title,
          msg: {msg: finMsg, attachment: message.attachment},
          filename: "email-message-send",
          title: "KIDO India",
        });
        return res.status(200).json(responseJSON.responseSuccess("Send email to lead.", null, 200));
      }
    } else if (checkWhatsapp == "sms") {
      // SMS sending
      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY");
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm A");
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a");
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

      let lead_id = req.body.lead_id;
      let message = await Message.findById({ _id: message_id });
      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in: objectIdArray}}]});

      if (response) {
        // got response
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "65265448d072d7ac1a6f022d",
          substatus_id: "652654e9d072d7ac1a6f0231",
          follow_status: "Quick Response (SMS)",
          follow_sub_status: "SMS",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "sms",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id,
            center_id: { $in: objectIdArray }
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              center_id: req.user.center_id,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(lead_id) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          return res.status(200).json(responseJSON.responseSuccess("Send sms to lead", null, 200));
        });
      } else {
        // got no response
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.user.center_id,
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
        });
        await newResponse.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // got acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(response.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // got no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "65265448d072d7ac1a6f022d",
          substatus_id: "652654e9d072d7ac1a6f0231",
          follow_status: "Quick Response (SMS)",
          follow_sub_status: "SMS",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "sms",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(lead_id) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        return res.status(200).json(responseJSON.responseSuccess("Send sms to lead", null, 200));
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postSendMessageToLead not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};


/*
  This method is responsible to send message to multiple leads.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.postSendEmailToMultipleLeads = async (req, res, next) => {
  try {
    let newMsg;
    let feed;
    let centeridForFeed = [];
    let userType;
    let string = "@client_name";
    let msg = req.body.message;
    let message_id = req.body.message_id;
    let message = await Message.findById({ _id: message_id });
    let emailIds = req.body.to;

  //  for (let  leadId of req.body.leads) {
    for (let [i, leadId] of req.body.leads.entries()) {
      let lead = await Lead.findOne({ _id: leadId }).lean();
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      if(msg.includes(string)){
        newMsg = msg.replace("@client_name",`${lead.parent_name}`);
      } else {
        newMsg = req.body.message;
      }

      let finMsg = newMsg.replace(/\n/g,"<br>");

      if (req.user && req.user.main == req.config.admin.main) {
        // Admin
        userType = "admin";
        feed = await Feed.countDocuments({});
      } else {
        // Non-Admin
        userType = "nonadmin";
        centeridForFeed = objectIdArray
        feed = await Feed.countDocuments({
          center_id: {
            $in: objectIdArray
          }
        });
      }

      const saveFeed = new Feed({
        parent_name: lead.parent_name,
        msg: newMsg || message.msg,
        msg_id: message_id,
        center_id: centeridForFeed,
        user_type: userType,
        'last_sent.last_date': moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY"),
        'last_sent.last_time': moment.utc().tz("Asia/Kolkata").format("hh:mm A"),
        medium: "E-mail",
        count: feed + 1,
        updatedBy_name: req.user.name
      });
      await saveFeed.save();

      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY");
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm A");
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a");
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

      let lead_id = leadId;

      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in: objectIdArray}}]});

      if (response) {
        // got response
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id,
            center_id: { $in: objectIdArray }
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              center_id: req.user.center_id,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(lead_id) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          // send a mail
          // console.log(emailIds[i]);
          await mail.send2({
            user: emailIds[i],
            subject: message.title,
            msg: {msg: finMsg, attachment: message.attachment || []},
            filename: "email-message-send",
            title: "KIDO India",
          });
        });
      } else {
        // got no response
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.user.center_id,
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
        });
        await newResponse.save();

        // acknowledge
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]});
        if (acknowledgmentData) {
          // got acknowledge
          const updateAcknowledgment = Acknowledgment.updateOne({
            _id: acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg || message.msg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.user.view_option,
              updatedBy_name: req.user.name,
              updatedBy: req.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json(responseJSON.responseError("Something went wrong!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
            }
          })
        } else {
          // got no acknowledge
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg || message.msg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.user.view_option,
            updatedBy_name: req.user.name,
            updatedBy: req.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg || message.msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.user.name,
          updatedBy: req.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();

        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(lead_id) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        await mail.send2({
          user: emailIds[i],
          subject: message.title,
          msg: {msg: finMsg, attachment: message.attachment},
          filename: "email-message-send",
          title: "KIDO India",
        });
        return res.status(200).json(responseJSON.responseSuccess("Email sent.", null, 200));
      }
    }
    return res.status(200).json(responseJSON.responseSuccess("Email Sent.", null, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "postSendEmailToMultipleLeads not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};