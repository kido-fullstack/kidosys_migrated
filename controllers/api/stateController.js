const mongoose = require('mongoose');
const State = mongoose.model("State");
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getStateByCountry = async (req, res, next) => {
  try {
    if (!req.body.country_id) {
      return res.status(400).json(response.responseError("Please provide country id.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const states = await State.aggregate([
      {
        $match: {
          country_id:  parseInt(req.body.country_id),
        },
      },
      {
        $project: {
          _id: 1,
          id: 1,
          country_id: 1,
          state_name: 1,
          state_code: 1
        }
      }
    ]);
    if (states.length) {
      return res.status(200).json(response.responseSuccess("All states according to country", states, 200));
    } else {
      return res.status(400).json(response.responseError("No states found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getStateByCountry - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};