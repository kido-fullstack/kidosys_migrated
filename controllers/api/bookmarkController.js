const mongoose = require('mongoose');
const Lead = mongoose.model('Lead');
const Followup = mongoose.model('Followup');
const Bookmark = mongoose.model('Bookmark');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const momentZone = require('moment-timezone');
const moment = require("moment");

exports.test = (req, res, next) => {
  return res.send('hey');
};

exports.checkValidMongoID = async (req, res, next) => {
  try {
    if (!helper.isValidMongoID(req.body.id)) {
      return res.status(400).json(response.responseError('Invalid Parameter ID!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      next();
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "checkValidMongoID - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.checkId = async (req, res, next) => {
  try {
    if (req.body.type == "lead") {
      const lead = await Lead.findOne({ _id: req.body.id });
      if (lead) {
        next();
      } else {
        return res.status(400).json(response.responseError("This id is not a lead id. Please provide a correct lead id in order to bookmark.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    } else if (req.body.type == "enq") {
      const lead = await Lead.findOne({ _id: req.body.id });
      if (lead) {
        next();
      } else {
        return res.status(400).json(response.responseError("This id is not a lead id. Please provide a correct lead id in order to bookmark.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    } 
  } catch (err) {
    helper.errorDetailsForControllers(err, "checkId - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
}

exports.saveBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    let queryType;
    // console.log(user);
    const bookmark = await Bookmark.findOne({ user_id: user._id, type: req.body.type });
    // console.log(bookmark);
    // return;
    if (bookmark) {
      if (req.body.type == "lead") {
        queryType = "leads_data";
      } else if (req.body.type == "enq") {
        queryType = "enqs_data";
      }

      const myList = bookmark[queryType].map(obj => obj.toString());
      const idIncludedOrNot = myList.includes(req.body.id);
      const operator = idIncludedOrNot ? '$pull' : '$addToSet';
      const remarks = idIncludedOrNot ? 'Removed!' : 'Saved!';

      await Bookmark.findByIdAndUpdate(bookmark._id, {
        [operator]: {
          [queryType]: req.body.id
        },
      }, {
        new: true
      });
      return res.status(200).json(response.responseSuccess(remarks, [], 200));
    } else {
      if (req.body.type == "lead") {
        const newBookmark = new Bookmark({
          user_id: user._id,
          type: "lead",
          leads_data: [req.body.id],
          enqs_data: null,
          followups_data: null
        })
        await newBookmark.save();
        return res.status(200).json(response.responseSuccess("Saved!", [], 200));
      } else if (req.body.type == "enq") {
        const newBookmark = new Bookmark({
          user_id: user._id,
          type: "enq",
          leads_data: null,
          enqs_data: [req.body.id],
          followups_data: null
        })
        await newBookmark.save();
        return res.status(200).json(response.responseSuccess("Saved!", [], 200));
      } 
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "saveBookmark - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};