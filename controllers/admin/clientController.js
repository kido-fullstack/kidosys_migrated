const mongoose = require('mongoose');
const Client = mongoose.model('Client');
const State = mongoose.model('State');
const City = mongoose.model('City');
const response = require('../../handlers/response');
const helper = require('../../handlers/helper');
const cacher = require('../../services/redis/cacher');

exports.test = (req, res, next) => {
  res.send('helllo');
};

exports.allClient = async (req, res, next) => {
  try {
    const dataCache = await cacher.getFromCache('all_clients');
    if (dataCache) {
      return res.render('admin/all-client', {
        title: 'All Clients',
        clients: JSON.parse(dataCache)
      });
    } else {
      const clients = await Client
        .find()
        .sort({
          createdAt: req.responseAdmin.DESC
        });
      await cacher.saveToCacheAndExpire('all_clients', JSON.stringify(clients), 1800);
      return res.render('admin/all-client', {
        title: 'All Clients',
        clients
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "get all client error", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddClient = async (req, res, next) => {
  try {
    const states = await State
      .find()
      .sort({
        state_name: 1
      });

    return res.render('admin/add-client', {
      title: 'Add Client',
      states
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "add page client error", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddClient = async (req, res, next) => {
  try {
    const newClient = new Client({
      name: req.body.name,
      company_name: req.body.company_name,
      spoc: req.body.spoc,
      email: req.body.email,
      mobile: req.body.mobile,
      transport: req.body.transport,
      landline_1: req.body.landline_1,
      landline_2: req.body.landline_2,
      landline_3: req.body.landline_3,
      state: req.body.state,
      city: req.body.city,
      address: req.body.address,
      gst: req.body.gst,
      status: req.body.status
    });
    await newClient.save((err, result) => {
      if (err) {
        req.flash('error', 'Something went wrong!');
        res.redirect('back');
        return;
      }
      req.flash('success', 'New Client Created!');
      res.redirect('back');
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "add client err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.client_id
    });
    const states = await State
      .find()
      .sort({
        state_name: 1
      });

    const cities = await City
      .find()
      .sort({
        state_name: 1
      });
    if (client) {
      res.render('admin/edit-client', {
        title: 'Update Client',
        client,
        states,
        cities
      });
      return;
    } else {
      req.flash('error', 'Client not found!');
      res.redirect('back');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "edit client page err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditClient = async (req, res, next) => {
  try {
    const updateClient = await Client.findOneAndUpdate({
      _id: req.params.client_id
    }, {
      $set: {
        name: req.body.name,
        company_name: req.body.company_name,
        spoc: req.body.spoc,
        email: req.body.email,
        mobile: req.body.mobile,
        transport: req.body.transport,
        landline_1: req.body.landline_1,
        landline_2: req.body.landline_2,
        landline_3: req.body.landline_3,
        state: req.body.state,
        city: req.body.city,
        address: req.body.address,
        gst: req.body.gst,
        status: req.body.status
      }
    }, {
      new: true
    }).exec((err, result) => {
      if (err) {
        req.flash('error', 'Something went wrong!');
        res.redirect('back');
        return;
      }
      req.flash('success', 'Client updated');
      res.redirect('/admin/client/all');
      return;
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "edit client err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.selectState = async (req, res, next) => {
  try {
    // console.log(req.params.state_id);
    const cities = await City
      .find({
        state_id: req.params.state_id
      }, {
        id: 1,
        city_name: 1,
        state_id: 1
      });
    return res.status(200).json(response.responseSuccess('Cities according to states', cities, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "select state err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.selectSubStatus = async (req, res, next) => {
  try {
    // console.log(req.params.status_id);
    const SubStatusCollection = mongoose.connection.db.collection('substatus');
    const subStatuses = await SubStatusCollection.find({status_id: mongoose.Types.ObjectId(req.params.status_id), status: 'active'}).toArray();

    // const cities = await City
    //   .find({
    //     state_id: req.params.state_id
    //   }, {
    //     id: 1,
    //     city_name: 1,
    //     state_id: 1
    //   });
    return res.status(200).json(response.responseSuccess('SubStatuses according to Status', subStatuses, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "select state err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};