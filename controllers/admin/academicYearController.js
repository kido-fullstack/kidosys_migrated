const mongoose = require('mongoose');
const AcademicYear = mongoose.model('Academicyear');
const moment = require('moment');
const helper = require('../../handlers/helper');

exports.test = async (req, res, next) => {
  try {
    // console.log(req.responseAdmin);
    res.send('heuy');
  } catch (err) {
    console.log(err);
  }
};

exports.getAllAcaYear = async (req, res, next) => {
  try {
    const academicYears = await AcademicYear.find().sort({ createdAt: req.responseAdmin.DESC });
    return res.render('admin/all-academic-years', {
      title: 'Academic Year',
      academicYears,
      moment
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllAcaYear not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddAcademicYear = async (req, res, next) => {
  try {
    return res.render('admin/add-academic-year', {
      title: 'Add Academic Year'
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddAcademicYear not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddAcademicYear = async (req, res, next) => {
  try {
    const newYear = new AcademicYear({
      name: req.body.name,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status
    });
    newYear.save((err, result) => {
      if (err) {
        console.log(err);
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      req.body.year_id = result._id.toString();
      // next();
      req.flash('success', req.responseAdmin.ACADEMIC_YEAR_UPDATED);
      res.redirect(req.responseUrl.ALL_ACADEMIC_YEAR);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddAcademicYear not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.updateStatusAll = async (req, res, next) => {
  try {
    let arr = [];
    const academicYears = await AcademicYear.find() || [];
    if (academicYears.length) {
      for (let [i, year] of academicYears.entries()) {
        if (year._id.toString() === req.body.year_id) {
          year.status = req.responseAdmin.ACTIVE;
          await year.save();
        } else {
          year.status = req.responseAdmin.INACTIVE;
          await year.save();
        }
        arr.push(year._id);
      }
      Promise.all(arr)
        .then((response) => {
          req.flash('success', req.responseAdmin.ACADEMIC_YEAR_UPDATED);
          res.redirect(req.responseUrl.ALL_ACADEMIC_YEAR);
          return;
        })
        .catch((err) => {
          console.log(err);
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "updateStatusAll not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findOne({ _id: req.params.year_id });
    return res.render('admin/edit-academic-year', {
      title: 'Edit Academic Year',
      year,
      moment
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditAcademicYear not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditAcademicYear = async (req, res, next) => {
  try {
    const acaYear = await AcademicYear.findOne({ _id: req.params.year_id });
    if (req.body.status !== acaYear.status) {
      // normal update
      const update = await AcademicYear.updateOne(
        { _id: req.params.year_id },
        {
          $set: {
            name: req.body.name,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status
          }
        }
      ).exec((err, result) => {
        if (err) {
          console.log(err);
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        }
        req.body.year_id = req.params.year_id;
        // next();
        req.flash('success', req.responseAdmin.ACADEMIC_YEAR_UPDATED);
        res.redirect(req.responseUrl.ALL_ACADEMIC_YEAR);
        return;
      })
      // then loop inactive status change
    } else {
      // normal update
      const update = await AcademicYear.updateOne(
        { _id: req.params.year_id },
        {
          $set: {
            name: req.body.name,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status
          }
        }
      ).exec((err, result) => {
        if (err) {
          console.log(err);
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        }
        req.flash('success', req.responseAdmin.ACADEMIC_YEAR_UPDATED);
        res.redirect(req.responseUrl.ALL_ACADEMIC_YEAR);
        return;
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditAcademicYear not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};