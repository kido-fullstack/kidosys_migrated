const mongoose = require("mongoose");
const Time = mongoose.model('Time');

exports.test = (req, res, next) => {
  try {
    return res.send('working');
  } catch (err) {
    console.log(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const times = await Time.find();
    return res.json(times);
  } catch (err) {
    console.log(err);
  }
};

exports.getAllRange = async (req, res, next) => {
  try {
    var start = new Date();
    start.setHours(0,0,0,0);

    var end = new Date();
    end.setHours(23,59,59,999);

    const times = await Time.find({createdAt: {$gte: start, $lt: end}});
    res.json(times);
  } catch (err) {
    console.log(err);
  }
};

exports.postTime = async (req, res, next) => {
  try {
    const newTime = new Time({
      name: req.body.name
    });
    await newTime.save();
    return res.json(newTime);
  } catch (err) {
    console.log(err);
  }
};