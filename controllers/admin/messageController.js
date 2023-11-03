const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const Response = mongoose.model('Response');
const moment = require('moment');
const helper = require('../../handlers/helper');

exports.test = async (req, res, next) => {
  return res.send('hey');
};

exports.getAllMessages = async (req, res, next) => {
  try {
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      var messages = await Message
        .find()
        .populate({
          path: "createdBy",
          select: {
            first_name: 1,
            last_name: 1
          }
        })
        .sort({ createdAt: req.responseAdmin.DESC });

      const respCnt = await Response.aggregate([
          {
            $group: {
              _id: '$msg_id', // Group by the 'category' field
              count: { $sum: 1 } // Count the occurrences in each group
            }
          }
        ]);
        var msgs_fin = [];
        messages.map((msg, i) => {

          var temp = 0;

          msg["count"] = temp;

          respCnt.map((resp, j) => {
            if(mongoose.Types.ObjectId(resp._id).toString() == mongoose.Types.ObjectId(msg._id).toString()){
              temp = resp.count;              
              // console.log(temp);
            }
          });
          var temp1 = msg.toJSON();
          temp1.count = temp;
          // temp1["count"] = "ashdjasd";
          // console.log( temp1);
          // JSON.parse
          // msgs_fin[i] = { ...msg, count: temp };
          messages[i] = temp1;

      }); 

      return res.render('admin/all-messages', {
        title: 'All Messages',
        messages,
        moment
      })
    } else {
      const messages = await Message
        .find({ center_id: req.session.user.center_id })
        .populate({
          path: "createdBy",
          select: {
            first_name: 1,
            last_name: 1
          }
        })
        .sort({ createdAt: req.responseAdmin.DESC });
      return res.render('admin/all-messages', {
        title: 'All Messages',
        messages,
        moment
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllMessages not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddMessage = async (req, res, next) => {
  try {
    return res.render('admin/add-message', {
      title: 'Add Message'
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddMessage not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddMessage = async (req, res, next) => {
  try {
    var fileArr = [];
    if (req.body.pdf_file) {
      fileArr = typeof req.body.pdf_file == 'string' ? [req.body.pdf_file] : req.body.pdf_file;
    }

    const newMsg = new Message({
      title: req.body.msg_title,
      msg: req.body.msg_desc,
      attachment:fileArr,
      status: req.body.status,
      viewoption: req.session.user.view_option,
      center_id: req.session.user.center_id,
      added_by: req.session.user.main && req.session.user.main == req.config.admin.main ? 1 : 0,
      createdBy: req.session.user._id
    });
    await newMsg.save();
    req.flash('success', req.responseAdmin.NEW_MESSAGE);
    res.redirect(req.responseUrl.ALL_MESSAGE);
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddMessage not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditMessage = async (req, res, next) => {
  try {
    const message = await Message.findOne({ _id: req.params.message_id});
    res.render('admin/edit-message', {
      title: 'Edit Message',
      message,
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditMessage not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.postEditMessage = async (req, res, next) => {
  try {
    // console.log(req.body,"upd
    // console.log(req.body.pdf_file);
    const message = await Message.findOne({ _id: req.params.message_id});
    const updateMessage = Message.updateOne({
      _id: req.params.message_id
    }, {
      $set: {
        title: req.body.msg_title,
        msg: req.body.msg_desc,
        attachment: req.body.pdf_file || [],
        status: req.body.status
      },
    }, { new: true }
    ).exec((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.flash('success', req.responseAdmin.COMMON_UPDATED);
      res.redirect(req.responseUrl.ALL_MESSAGE);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditMessage not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddFromDirectMessage = async (req, res, next) => {
  try {
    // console.log(req.session);
    // return;
    const newMsg = new Message({
      title: req.body.msg_title,
      msg: req.body.msg_desc,
      attachment: req.body.pdf_file,
      status: req.body.status,
      viewoption: req.session.user.view_option,
      center_id: req.session.user.center_id,
      added_by: req.session.user.main && req.session.user.main == req.config.admin.main ? 1 : 0,
      createdBy: req.session.user._id
    });
    await newMsg.save();
    return res.status(200).json({
      message: "New template saved!",
      data: newMsg,
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddMessage not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postViewAttachments = async (req, res, next) => {
  try {
    // console.log(req.body, "--------req.body");
    const message = await Message.findById(req.body.msgId, 'attachment');
    // console.log(message);
    return res.status(200).json({
      message: "Message",
      data: message,
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postViewAttachments not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};