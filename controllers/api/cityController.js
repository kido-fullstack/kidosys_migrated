const mongoose = require('mongoose');
const City = mongoose.model("City");
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getCityByState = async (req, res, next) => {
  try {
    if (!req.body.state_id) {
      return res.status(400).json(response.responseError("Please provide state id.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const cities = await City.aggregate([
      {
        $match: {
          state_id: parseInt(req.body.state_id),
        },
      },
    ]);
    if (cities.length) {
      return res.status(200).json(response.responseSuccess("All cities according to states", cities, 200));
    } else {
      return res.status(400).json(response.responseError("No cities found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getStateByCountry - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};