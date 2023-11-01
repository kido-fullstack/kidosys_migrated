const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');
const helper = require('../../handlers/helper');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({
          message: req.responseAdmin.FILE_TYPE_NOT_ALLOWED
        },
        false)
    }
  }
};

exports.allCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({
      status: req.responseAdmin.ACTIVE
    });
    return res.render('admin/all-category', {
      title: 'All Category',
      categories
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddCategory = (req, res, next) => {
  try {
    return res.render('admin/add-category', {
      title: 'Add Category'
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.uploadCategory = multer(multerOptions).single('category_img');

exports.resizeCategory = async (req, res, next) => {
  // console.log(req.config);
  if (!req.file) {
    // req.body.image = "";
    next();
    return;
  } else {
    const extension = req.file.mimetype.split('/')[1];
    const imageName = `${uuid.v4()}.${extension}`;
    req.body.category_img = `${req.config.siteHeader}://${req.headers.host}/uploads/category/${imageName}`;

    const Picture = await jimp.read(req.file.buffer);
    // await Picture.resize(400, jimp.AUTO);
    await Picture.write(`./public/uploads/category/${imageName}`);

    // once we written the file on our filesystem, call next() middleware.
    next();
  }
};

exports.postAddCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ category_name: req.body.category_name });
    if (!category) {
      let newcat = new Category(req.body);
      await newcat.save((err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR)
          req.redirect('back');
          return;
        }
        req.flash('success', req.responseAdmin.NEW_CATEGORY);
        res.redirect('back');
        return;
      });
    } else {
      req.flash('error', req.responseAdmin.SAME_CATEGORY_EXIST);
      res.redirect('back');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddCategory not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getViewCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.category_id});
    res.render('admin/view-category', {
      title: 'View Category',
      category
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getViewCategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.category_id});
    res.render('admin/edit-category', {
      title: 'Edit Category',
      category
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditCategory not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditCategory = async (req, res, next) => {
  try {
    const category = await Category.updateOne(
      { _id: req.params.category_id },
      req.body,
      { new: true }
    ).exec((err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR)
        req.redirect('back');
        return;
      }
      req.flash('success', req.responseAdmin.UPDATED_CATEGORY);
      res.redirect('back');
      return;
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditCategory not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};