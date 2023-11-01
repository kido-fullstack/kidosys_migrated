const mongoose = require('mongoose');
const Country = mongoose.model('Country');


const helper = require('../../handlers/helper');

exports.allCountry = async (req, res, next) => {
  try {
    const countrys = await Country.find().sort({ createdAt: req.responseAdmin.DESC });
    return res.render('admin/all-country', {
      title: 'All Country',
      countrys
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCountry not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddCountry = async (req, res, next) => {
  try {
    return res.render('admin/add-country', {
      title: 'Add Country',
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddcountry not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddCountry = async (req, res, next) => {
  try {
    let findCountry = await Country.find({country_name:req.body.country_name})
    if(findCountry.length === 0 ){
      const newCountry = new Country({
        country_name: req.body.country_name,
        status: req.body.status
      });
      await newCountry.save();
      req.flash('success', req.responseAdmin.NEW_COUNTRY);
      res.redirect(req.responseUrl.ALL_COUNTRY);
      return;

    } else {
      req.flash('error', 'Country already exist!');
      res.redirect('/admin/country/add');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddcountryot working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditCountry = async (req, res, next) => {
  try {
    const country = await Country.findOne({ _id: req.params.country_id});

    res.render('admin/edit-country', {
      title: 'Edit Country',
      country
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditCountry not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditCountry = async (req, res, next) => {
  try {
    // console.log(req.body)
    const updateCountry= await Country.updateOne({
      _id: req.params.country_id
    }, {
      $set: {
        country_name:req.body.country_name,
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
      res.redirect(req.responseUrl.ALL_COUNTRY);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditCountry not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

