const mongoose = require('mongoose');
const Zone = mongoose.model('Zone');
const Country = mongoose.model('Country');
const helper = require('../../handlers/helper');

exports.test = async (req, res, next) => {
  try {
    res.send('hey');
  } catch (err) {
    console.log(err);
  }
};

exports.getAllZones = async (req, res, next) => {
  try {
    const zones = await Zone
      .find()
      .sort({
        createdAt: req.responseAdmin.DESC
      });
    return res.render('admin/all-zones', {
      title: 'All Zones',
      zones
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllZones not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddZone = async (req, res, next) => {
  try {
    const countrys = await Country.find({ status: "Active" });
    return res.render('admin/add-zone', {
      title: 'Add Zone',
      countrys
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddZone not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddZone = async (req, res, next) => {
  try {
    // console.log(req.body)
    const newZone = new Zone({
      name: req.body.name,
      status: req.body.status,
      country_id:req.body.country_id
    });
    newZone.save((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.flash('success', req.responseAdmin.NEW_ZONE);
      res.redirect(req.responseUrl.ALL_ZONE);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddZone not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditZone = async (req, res, next) => {
  try {
    const zone = await Zone.findOne({ _id: req.params.zone_id });
    const countrys = await Country.find({ status: 'Active' });
    return res.render('admin/edit-zone', {
      title: 'Edit Zone',
      zone,
      countrys
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditZone not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditZone = async (req, res, next) => {
  try {
    // console.log(req.body)
    const update = Zone.updateOne(
      { _id: req.params.zone_id },
      {
        $set: {
          name: req.body.name,
          status: req.body.status,
          country_id:req.body.country_id
        }
      }
    ).exec((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.flash('success', req.responseAdmin.UPDATED_ZONE);
      res.redirect(req.responseUrl.ALL_ZONE);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditZone not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAllZonesOnDropdown = async (req, res, next) => {
  try {
    const zones = await Zone.find({ country_id: req.body.type, status: req.responseAdmin.ACTIVE }).sort({ order: 1 });
    return res.status(200).json({
      msg: 'zones',
      data: zones,
      code: 200
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