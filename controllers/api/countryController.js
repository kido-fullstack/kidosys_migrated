const mongoose = require('mongoose');
const Country = mongoose.model('Country');
const Employee = mongoose.model('Employee');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getAllCountry = async (req, res, next) => {
  try {
    let countries = [];
    if (req.user && req.user.main == req.config.admin.main) {
      countries = await Country.find({ status: 'Active' }, { country_name: 1, country_code: 1, country_id: 1 });
    } else {
      countries = await Employee.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "viewoptions",
            localField: "view_option",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "viewoption",
          },
        },
        {
          $unwind: "$viewoption",
        },
        {
          $lookup: {
            from: "countries",
            localField: "viewoption.countries",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "countries",
          },
        },
        {
          $unwind: "$countries",
        },
        {
          $project: {
            _id: "$countries._id",
            country_name: "$countries.country_name",
            country_id: "$countries.country_id",
            country_code: "$countries.country_code",
          },
        },
      ]);
    }
    if (countries.length) {
      return res.status(200).json(response.responseSuccess("All Countries", countries, 200));
    } else {
      return res.status(400).json(response.responseError("No countries found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllCountry - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};