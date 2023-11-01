const mongoose = require('mongoose');
const Country = mongoose.model('Country');
const Employee = mongoose.model('Employee');
const ViewOption = mongoose.model('ViewOption');
const Zone = mongoose.model('Zone');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getZoneByCountry = async (req, res, next) => {
  try {
    let zones = [];
    if (req.user && req.user.main == req.config.admin.main) {
      if (Object.keys(req.body).length && req.body.country_id.length) {
        zones = await Zone.find({ country_id:{ $in:req.body.country_id } }, { name: 1 })
      } else {
        zones = await Zone.find({ status: 'active' }, { name: 1 })
      }
    } else {
      if (Object.keys(req.body).length && req.body.country_id.length) {
        zones = await Zone.find({country_id:{$in:req.body.country_id}}, { name: 1 })
      } else {
        nonAdminZone = await ViewOption.findOne({
          _id: req.user.view_option,
        }).populate({
          path: 'zones',
          select: {
            name: 1
          }
        })
        zones = nonAdminZone.zones
       }
    }
     if (zones.length) {
        return res.status(200).json(response.responseSuccess("Get zones by countries or all zones", zones, 200));
      } else {
        return res.status(400).json(response.responseError("No Zones found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }

  } catch (err) {
    helper.errorDetailsForControllers(err, "getZoneByCountry - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};