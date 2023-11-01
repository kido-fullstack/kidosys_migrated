const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Category = mongoose.model('Category');
const helper = require('../../handlers/helper');

exports.allCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({
      status: req.responseAdmin.ACTIVE
    })
      .populate({
        path: 'category_id',
        select: {
          category_name: 1,
          category_desc: 1,
          category_img: 1
        }
      });
    return res.render('admin/all-course', {
      title: 'All Course',
      courses
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCourses not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddCourse = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: req.responseAdmin.ACTIVE });
    return res.render('admin/add-course', {
      title: 'Add Course',
      categories
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddCourse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ course_name: req.body.course_name });
    if (course) {
      req.flash('error', req.responseAdmin.SAME_CATEGORY_EXIST);
      res.redirect('back');
      return;
    } else {
      const newCourse = new Course({
        course_name: req.body.course_name,
        category_id: req.body.category_id,
        status: req.body.status
      });
      await newCourse.save();
      req.flash('success', req.responseAdmin.NEW_COURSE);
      res.redirect(req.responseUrl.ALL_COURSE);
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddCourse not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.course_id});
    const categories = await Category.find({ status: req.responseAdmin.ACTIVE });
    res.render('admin/edit-course', {
      title: 'Edit Course',
      categories,
      course
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditCourse not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditCourse = async (req, res, next) => {
  try {
    const updateCourse = Course.updateOne({
      _id: req.params.course_id
    }, {
      $set: {
        course_name: req.body.course_name,
        category_id: req.body.category_id,
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
      res.redirect(req.responseUrl.ALL_COURSE);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditCourse not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};