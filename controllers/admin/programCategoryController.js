const mongoose = require('mongoose');
const Programcategory = mongoose.model('Programcategory');
const helper = require('../../handlers/helper');

exports.allProgramCategory = async (req, res, next) => {
  try {
    const programcategorys = await Programcategory.find({ title: { $ne: "Not Provided" } }).sort({ createdAt: req.responseAdmin.DESC });
    return res.render('admin/all-program-category', {
      title: 'All ProgramCategory',
      programcategorys
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allProgramCategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddProgramCategory = async (req, res, next) => {
  try {
    return res.render('admin/add-program-category', {
      title: 'Add Program Category',
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddprogramcategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddProgramCategory = async (req, res, next) => {
  try {
    const programCat = await Programcategory.findOne({ title: req.body.title.trim() });
    if (programCat) {
      req.flash('error', 'Program Categroy already exist!');
      res.redirect(req.responseUrl.ALL_PROGRAM_CATEGORY);
      return;
    }
    const newProgramcategory = new Programcategory({
      title:req.body.title,
      status: req.body.status
    });
    await newProgramcategory.save();
    req.flash('success', req.responseAdmin.NEW_PROGRAM_CATEGORY);
    res.redirect(req.responseUrl.ALL_PROGRAM_CATEGORY);
    return;

  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddProgramCategorynot working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditProgramCategory = async (req, res, next) => {
  try {
    const programcategory = await Programcategory.findOne({ _id: req.params.programcategory_id});
    res.render('admin/edit-program-category', {
      title: 'Edit Course',
      programcategory
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditProgramCategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditProgramCategory = async (req, res, next) => {
  try {
    const updateProgramCategory = Programcategory.updateOne({
      _id: req.params.programcategory_id
    }, {
      $set: {
        title: req.body.title,
        status: req.body.status
      },
    }, { new: true }
    ).exec((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.flash('success', req.responseAdmin.UPDATED);
      res.redirect(req.responseUrl.ALL_PROGRAM_CATEGORY);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditProgramCategory not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};