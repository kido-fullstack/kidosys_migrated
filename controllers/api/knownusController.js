const mongoose = require('mongoose');
// const Status = mongoose.model('Status');
const Employee = mongoose.model('Employee');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getAllKnownus = async (req, res, next) => {
  try {
    const KnowUsCollection = mongoose.connection.db.collection("knowus");
    const knowuss = await KnowUsCollection.find({
      status: "active",
    }).toArray();
    if (knowuss.length) {
      return res.status(200).json(response.responseSuccess("All Status", knowuss, 200));
    } else {
      return res.status(400).json(response.responseError("No Status found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllKnownus - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};