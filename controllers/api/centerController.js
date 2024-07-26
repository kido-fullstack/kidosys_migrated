const mongoose = require('mongoose');
const Center = mongoose.model('Center');
const ViewOption = mongoose.model('ViewOption');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

// Adding to support get data by center API.
const State = mongoose.model('State');
const Country = mongoose.model('Country');
const City = mongoose.model('City');

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
      centers = await Center.find({ status: req.responseAdmin.ACTIVE }, { school_name: 1, school_display_name: 1,school_code:1,city:1 });
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      centers = await Center.find({ _id: {$in: objectIdArray} }, { school_name: 1, school_display_name: 1,school_code:1,city:1 });
    }
    centers.sort((a, b) => a.school_name < b.school_name ? -1 : 1)
    var indexOfHO = -1;
    var HOposbls = ["HEAD OFFICE", "head office", "Others", "Other","HO Centre"];
    centers.forEach((ele,key) => {
      if( HOposbls.indexOf(ele.school_name)   !== -1){
        indexOfHO = key;
      }
    })
    if (indexOfHO !== -1) {
      var thirdItem = centers.splice(indexOfHO, 1)[0];
      centers.push(thirdItem);
    }
    // console.log(indexOfHO);
    // console.log(centers);
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

/* 
  This method is responsible to get centers by user.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.getByUser = async (req, res, next) => {
  try {
    let centers = [];
    if (req.user && req.user.main == req.config.admin.main) {
      // Admin
      centers = await Center
        .find({ status: "active" }, {
          school_name: 1,
          school_display_name: 1
        })
        .sort({ school_name: 1 });
    } else {
      // Non-Admin
      const viewOption = await ViewOption.findOne({
        _id: req.user.view_option
      });
      centers = await Center
        .find({ _id: { $in: viewOption.centers }, status: "active" }, {
          school_name: 1,
          school_display_name: 1
        })
        .sort({ school_name: 1 });
    }
    return res.status(200).json(response.responseSuccess("Get center according to user!", centers, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCenter - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

/* 
  This method is responsible to get the data by center.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.getDataByCenter = async (req, res, next) => {
  try {
    const center = await Center.findOne({
      _id: req.body.center_id
    });
    if (center) {
      if (center.state && center.city) {
        const state = await State.findOne({
          state_name: center.state
        }, { id: 1, country_id: 1, state_name: 1,  });
        const city = await City.findOne({
          city_name: center.city
        }, { id: 1, country_id: 1, city_name: 1, state_id: 1 })
        if (state) {
          var country = await Country.findOne({
            country_id: state.country_id
          }, { country_id: 1, country_code: 1, country_name: 1 })
        }
        return res.status(200).json(response.responseSuccess("Get data by center.", {
          country: country || {},
          state: state || {},
          city: city || {}
        }, 200));
      } else {
        return res.status(200).json(response.responseSuccess("Get data by center.", {
          country: {},
          state: {},
          city: {}
        }, 200));
      }
    } else {
      return res.status(400).json(response.responseError('Center not found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getDataByCenter - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};