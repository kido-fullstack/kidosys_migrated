const mongoose = require('mongoose');
const Acknowledgment = mongoose.model("Acknowledgment");
const Feed = mongoose.model("Feed");
const Program = mongoose.model('Program');
const State = mongoose.model('State');
const City = mongoose.model('City');
const Lead = mongoose.model('Lead');
const Country = mongoose.model("Country");
const Zone = mongoose.model("Zone");
const Center = mongoose.model("Center");
const ViewOption = mongoose.model("ViewOption");
// const pdf = require('html-pdf');
const datetime = require('node-datetime');
const _ = require("lodash");
const helper = require('../../handlers/helper');
const config = require('../../config/');
const cacher = require('../../services/redis/cacher');

exports.testAdminAPI = (req, res, next) => {
  try {
    // return res.send('Admin API Works!!');
    return res.render('admin/email-message-send');
  } catch (err) {
    helper.errorDetailsForControllers(err, "test admin api err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    let datas;
    let feedOpts;
    if (req.session.user && req.session.user.main == req.config.admin.main) {
      // Admin
      feedOpts = {};
    } else {
      // Non-admin
      let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      feedOpts = {
        center_id: {
          $in: objectIdArray
        }
      }
    }
    const feeds = await Feed
      .find(feedOpts)
      .sort({
        count: -1
      })
      .limit(10);

    if (req.session.user && req.session.user.main && req.session.user.main == req.config.admin.main) {
      // ADMIN
      const countriesPromise = Country.find({ status: "Active" });
      const zonesPromise = Zone.find({ status: "active" });
      const centersPromise = Center.find({ status: "active" }, { school_display_name: 1 });
      const [countries, zones, centers] = await Promise.all([countriesPromise, zonesPromise, centersPromise])
      datas = {
        countries,
        zones,
        centers
      };
    } else {
      // NON-ADMIN
      datas = await ViewOption.findOne({
        _id: req.session.user.view_option,
      })
      .populate({
        path: 'countries'
      })
      .populate({
        path: 'zones'
      })
      .populate({
        path: 'centers'
      });
    }
    return res.render('admin/dashboard', {
      title: 'Dashboard',
      reportQuery: req.query.rep ? req.query.rep : "leads",
      messages: feeds,
      data: datas || []
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "get dashboard err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.redirectToDashboard = (req, res, next) => {
  try {
    return res.redirect('/admin/dashboard');
  } catch (err) {
    helper.errorDetailsForControllers(err, "redirect to dashboard - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.redirectToFourOhFour = (req, res, next) => {
  try {
    return res.render('admin/404', { title: '404' });
  } catch (err) {
    helper.errorDetailsForControllers(err, "redirect to 404 - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.redirectToErr = (req, res, next) => {
  try {
    return res.render('admin/errorAdmin', { title: 'Something went wrong' });
  } catch (err) {
    helper.errorDetailsForControllers(err, "redirect to something went wrong - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.allMasters = (req, res, next) => {
  res.render('admin/all-masters', {
    title: 'All Masters',
    adminCheck: req.body.adminCheck
  });
};

exports.programDropdown = async (req, res, next) => {
  try {
    // console.log(req.body.type,"iddd")
    const Programs = await Program.find({
      programcategory_id: req.body.type,
      status: "active",
    }).sort({ order: 1 });
    return res.status(200).json({
      msg: "Programs",
      data: Programs || [],
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "dropdownFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.stateDropdown = async (req, res, next) => {
  try {
    // console.log(parseInt(req.body.type),"statefilter")

    const stateId = parseInt(req.body.type);

    // let id = req.body.type
    // return;
    const States = await State.aggregate([
      {
        $match: {
          country_id: stateId,
        },
      },
    ]);
    // console.log(States,"states")
    return res.status(200).json({
      msg: "States",
      data: States,
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "stateFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.cityDropdown = async (req, res, next) => {
  try {
    // console.log(parseInt(req.body.type),"cityfilter")

    const cityId = parseInt(req.body.type);

    // let id = req.body.type
    // return;
    const Citys = await City.aggregate([
      {
        $match: {
          state_id: cityId,
        },
      },
    ]);
    // console.log(Citys,"states")
    return res.status(200).json({
      msg: "Citys",
      data: Citys,
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "stateFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.checkEmailValidation = async (req, res, next) => {
  try {
    // console.log(req.body);
    let lead;
    if (req.body.type == "primary") {
      lead = await Lead.findOne({ parent_email: req.body.emailId }, { lead_no: 1 });
      // console.log(lead);
    }
    if (req.body.type == "secondary") {
      lead = await Lead.findOne({ secondary_email: req.body.secondary_email }, { lead_no: 1 });
    }

    return res.status(200).json({
      message: "Lead",
      data: lead,
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEmailValidation not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};