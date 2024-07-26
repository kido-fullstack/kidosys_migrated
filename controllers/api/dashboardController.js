const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
const Feed = mongoose.model('Feed');
const Country = mongoose.model('Country');
const Zone = mongoose.model('Zone');
const Center = mongoose.model('Center');
const ViewOption = mongoose.model('ViewOption');
const jwt = require('jsonwebtoken');

exports.getDashboardData = async (req, res, next) => {
  try {
    if (!req.query.token) {
      return res.render('admin/went-wrong', {
        title: "Something went wrong"
      });
    }
    const jwtData = jwt.verify(req.query.token, req.config.keys.secret);
    const user = await Employee.findById(jwtData.id);
    req.session.user = user;
    let datas;
    let feedOpts;
    if (req.session.user && req.session.user.main == req.config.admin.main) {
      // Admin
      feedOpts = {};
    } else {
      // Non-admin
      let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      feedOpts = {
        center_id: {
          $in: objectIdArray
        }
      }
    }
    const feeds = await Feed
      .find(feedOpts)
      .sort({
        count: -1
      })
      .limit(10);

    if (req.session.user && req.session.user.main && req.session.user.main == req.config.admin.main) {
      // ADMIN
      const countriesPromise = Country.find({ status: "Active" });
      const zonesPromise = Zone.find({ status: "active" });
      const centersPromise = Center.find({ status: "active" }, { school_display_name: 1 });
      const [countries, zones, centers] = await Promise.all([countriesPromise, zonesPromise, centersPromise])
      datas = {
        countries,
        zones,
        centers
      };
    } else {
      // NON-ADMIN
      datas = await ViewOption.findOne({
        _id: req.session.user.view_option,
      })
      .populate({
        path: 'countries'
      })
      .populate({
        path: 'zones'
      })
      .populate({
        path: 'centers'
      });
    }
    return res.render('admin/dashboard', {
      title: 'Dashboard',
      reportQuery: req.query.rep ? req.query.rep : "leads",
      messages: feeds,
      data: datas || []
    })
  } catch (err) {
    return res.render('admin/went-wrong', {
      title: "Something went wrong"
    });
  }
};