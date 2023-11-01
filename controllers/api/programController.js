const mongoose = require('mongoose');
const Program = mongoose.model('Program');
const Center = mongoose.model('Center');
const ProgramCategory = mongoose.model('Programcategory');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const moment = require("moment");

exports.GetProByProCat = async (req, res, next) => {
  try {
    const programs = await Program.find(
      {
        programcategory_id: req.body.cat_id,
        status: "active",
      }, { program_name: 1 })
      .sort({ order: 1 });

    if (programs.length) {
      return res.status(200).json(response.responseSuccess("Programs according to program category.", programs, 200));
    } else {
      return res.status(400).json(response.responseError('No programs found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "GetProByProCat - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllProgram = async (req, res, next) => {
  try {
    let programs;
    if (req.user && req.user.main == req.config.admin.main) {
      programs = await Program.find({ status: "active" },{ program_name: 1 });
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      programs = await Center.aggregate([
        {
          $match:{
            _id:{$in: objectIdArray}
          }
        },{
          $lookup: {
            from: "programs",
            localField: "program_id",
            foreignField: "_id",
            as: "result"
          }
        },{
          $unwind:{
            path:"$result"
          }
        },{
          $project:{
            "program_name" :"$result.program_name",
            "_id": 0,
            "_id" :"$result._id"
          }
        }
      ])
    }
    if (programs.length) {
      return res.status(200).json(response.responseSuccess("All Program", programs, 200));
    } else {
      return res.status(400).json(response.responseError("No Programs found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllProgram - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getProgramByProgramCategory = async (req, res, next) =>{
  try{
    if(req.query.programcategory_id){
      const programCats = await Program.find({ programcategory_id: mongoose.Types.ObjectId(req.query.programcategory_id) }, {program_name: 1});
      if (programCats) {
        return res.status(200).json(response.responseSuccess("Program according to a ProgramCategory", programCats, 200));
      } else {
        return res.status(400).json(response.responseError("No program  found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    } else{
      const programCats = await Program.find({}, {program_name: 1});
      if (programCats) {
        return res.status(200).json(response.responseSuccess("All Programs.", programCats, 200));
      } else {
        return res.status(400).json(response.responseError("No program  found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      }
    }catch (err) {
      helper.errorDetailsForControllers(err, "getAllProgram - get request", req.originalUrl, req.body, {}, "api", __filename);
      next(err);
      return;
    }
  };
