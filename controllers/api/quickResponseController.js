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