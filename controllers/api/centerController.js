const mongoose = require('mongoose');
const Center = mongoose.model('Center');
const ViewOption = mongoose.model('ViewOption');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.test = (req, res, next) => {
  return res.json({
    message: 'API working'
  })
};

exports.viewCenter = async (req, res, next) => {
  try {
    const center = await Center.findOne({ _id: req.params.center_id });
    if (center) {
      return res.status(200).json(response.responseSuccess("View Center", center, 200));
    } else {
      return res.status(400).json(response.responseError("No center detail found", 400));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "viewCenter - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.editCenter = async (req, res, next) => {
  try {
    const updateCenter = await Center.updateOne({
      _id: req.params.center_id
    }, {
        $set: {
          center_name: req.body.center_name,
          print_name: req.body.print_name,
          center_code: req.body.center_code,
          center_desc: req.body.center_desc,
          center_add: req.body.center_add,
          center_spoc: req.body.center_spoc,
          center_contact: req.body.center_contact,
          center_email: req.body.center_email,
          status: req.body.status
        }
    }, {
      new: true
    }).exec((err, result) => {
      if (err) {
        return res.status(400).json(response.responseError("Something went wrong!", 400));
      }
      return res.status(200).json(response.responseSuccess("updated successfully!", null, 200));
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "editCenter - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};
exports.getCenterByZone = async (req, res, next) => {
  try {
    let centers
    if(req.user && req.user.main == req.config.admin.main){
      if(Object.keys(req.body).length && req.body.zone_id.length){
        centers = await Center.find({zone_id:{$in:req.body.zone_id}})
      }else{
        centers = await Center.find({ status: 'active' })
      }

    }else{
      if(Object.keys(req.body).length && req.body.zone_id.length){
        centers = await Center.find({zone_id:{$in:req.body.zone_id}})
      }else{
        nonAdminCenter = await ViewOption.findOne({
          _id: req.user.view_option,
        }).populate({
          path: 'centers'
        })
        centers = nonAdminCenter.centers
      }
    }
    if (centers.length) {
        return res.status(200).json(response.responseSuccess("Zone Filter On Country", centers, 200));
      } else {
        return res.status(400).json(response.responseError("No centers found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getCenterByZone - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.allCenter = async (req, res, next) => {
  try {
    let centers = [];
    if (req.user.main && req.user.main == req.config.admin.main) {
      centers = await Center.find({ status: req.responseAdmin.ACTIVE }, { school_name: 1, school_display_name: 1 });
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      centers = await Center.find({ _id: {$in: objectIdArray} }, { school_name: 1, school_display_name: 1 });
    }
    if (centers.length) {
      return res.status(200).json(response.responseSuccess("All centers.", centers, 200));
    } else {
      return res.status(400).json(response.responseError('No centers found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCenter - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};