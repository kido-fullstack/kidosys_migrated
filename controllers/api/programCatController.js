const mongoose = require('mongoose');
const Lead = mongoose.model('Lead');
const Center = mongoose.model('Center');
const Followup = mongoose.model('Followup');
const Bookmark = mongoose.model('Bookmark');
const ProgramCategory = mongoose.model('Programcategory');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const momentZone = require('moment-timezone');
const moment = require("moment");
const helpers = require("../../handlers/helper");

exports.GetProByCenter = async (req, res, next) => {
  try {
    const programCats = await Center.findOne({ _id: mongoose.Types.ObjectId(req.body.center_id) }, { school_name: 1, school_display_name: 1, programcategory_id: 1 }).populate(
      "programcategory_id"
    );
    if (programCats) {
      return res.status(200).json(response.responseSuccess("Program category according to a center", programCats, 200));
    } else {
      return res.status(400).json(response.responseError("No program categories found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "GetProByCenter - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.GetProgramByCenter = async (req, res, next) =>{
  try{
    if(req.query.center_id){
      const programCats = await Center.findOne({ _id: mongoose.Types.ObjectId(req.query.center_id) }, { programcategory_id: 1 }).populate({
        path: "programcategory_id",
        select: {
          title: 1
        }
      });
      if (programCats) {
        return res.status(200).json(response.responseSuccess("Program category according to a center", programCats.programcategory_id, 200));
      } else {
        return res.status(400).json(response.responseError("No program categories found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
  } else{
    const programCats = await ProgramCategory.find({}, {title: 1});
    if (programCats) {
      return res.status(200).json(response.responseSuccess("All Program category.", programCats, 200));
    } else {
      return res.status(400).json(response.responseError("No program categories found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  }
} catch (err) {
    helper.errorDetailsForControllers(err, "GetProByCenter - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};