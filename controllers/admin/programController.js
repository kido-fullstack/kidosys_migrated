const mongoose = require('mongoose');
const Program = mongoose.model('Program');
const Programcategory = mongoose.model('Programcategory');
const helper = require('../../handlers/helper');

exports.allProgram = async (req, res, next) => {
  try {
    const programs = await Program.find({ program_name: { $ne: "Not Provided" } }).sort({ createdAt: req.responseAdmin.DESC })
    .populate("programcategory_id")
    // console.log(programs)
    return res.render('admin/all-program', {
      title: 'All Program',
      programs
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allProgram not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddProgram = async (req, res, next) => {
  try {
    const programcategorys = await Programcategory.find({ status: req.responseAdmin.ACTIVE });
    return res.render('admin/add-program', {
      title: 'Add Program',
      programcategorys
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddprogram not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddProgram = async (req, res, next) => {
  try {
    const program = await Program.findOne({ $and: [{program_name: req.body.program_name.trim()}, {programcategory_id: req.body.programcategory_id}] });
    if (program) {
      req.flash('error', 'Program already exists!');
      res.redirect(req.responseUrl.ALL_PROGRAM);
      return;
    }
    const newProgram = new Program({
      program_name: req.body.program_name,
      programcategory_id: req.body.programcategory_id,
      min_age: req.body.min_age,
      max_age: req.body.max_age,
      program_desc: req.body.program_desc,
      status: req.body.status
    });
    await newProgram.save();
    req.flash('success', req.responseAdmin.NEW_PROGRAM);
    res.redirect(req.responseUrl.ALL_PROGRAM);
    return;

  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddProgramnot working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditProgram = async (req, res, next) => {
  try {
    const program = await Program.findOne({ _id: req.params.program_id});
    const programcategorys = await Programcategory.find({ status: req.responseAdmin.ACTIVE });
    res.render('admin/edit-program', {
      title: 'Edit Course',
      program,
      programcategorys
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditProgram not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditProgram = async (req, res, next) => {
  try {
    const updateProgram = Program.updateOne({
      _id: req.params.program_id
    }, {
      $set: {
        program_name: req.body.program_name,
        programcategory_id: req.body.programcategory_id,
        min_age: req.body.min_age,
        max_age: req.body.max_age,
        program_desc: req.body.program_desc,
        status: req.body.status
      },
    }, { new: true }
    ).exec((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.flash('success', req.responseAdmin.COMMON_UPDATED);
      res.redirect(req.responseUrl.ALL_PROGRAM);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditProgram not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};