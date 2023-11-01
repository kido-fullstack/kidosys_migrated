const mongoose = require('mongoose');
const _ = require('lodash');
const Role = mongoose.model('Role');
const RoleAssign = mongoose.model('RoleAssign');
const Permission = mongoose.model('Permission');
const cacher = require('../../services/redis/cacher');
const helper = require('../../handlers/helper');

exports.test = (req, res, next) => {
  res.send('hey');
}

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: req.responseAdmin.DESC});
    return res.render('admin/all-roles', {
      title: 'All Roles',
      roles
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllRoles not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddRole = async (req, res, next) => {
  try {
    const permissions = await Permission.find();
    const permGroup = _.groupBy(permissions, 'category');
    return res.render('admin/add-role', {
      title: 'Add Role',
      permissions,
      permGroup
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddRole not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: req.responseAdmin.DESC});
    return res.render('admin/all-permissions', {
      title: 'All Permissions',
      permissions
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPermissions not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddPermission = (req, res, next) => {
  try {
    return res.render('admin/add-permission', {
      title: 'Add Permission'
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddPermission not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddPermission = async (req, res, next) => {
  try {
    const permission = await Permission.findOne({ name: req.body.name });
    if (permission) {
      req.flash('error', req.responseAdmin.SAME_PERMISSION_EXIST);
      res.redirect('back');
      return;
    } else {
      const newPermissions = new Permission({
        name: req.body.name,
        status: req.body.status
      });
      newPermissions.save((err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        }
        req.flash('success', req.responseAdmin.NEW_PERMISSION);
        res.redirect(req.responseUrl.ALL_PERMISSION_URL);
        return;
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddPermission not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postCreateRole = async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.body.name });
    if (role) {
      req.flash('error', req.responseAdmin.SAME_ROLE_EXIST);
      res.redirect('back');
      return;
    } else {
      const newRole = new Role({
        name: req.body.name,
        permissions: req.body.permissions,
        status: req.body.status
      });
      newRole.save((err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        }
        req.flash('success', req.responseAdmin.NEW_ROLE);
        res.redirect(req.responseUrl.ALL_ROLE_URL);
        return;
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddRole not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditRole = async (req, res, next) => {
  try {
    const role = await Role.findOne({ _id: req.params.role_id });
    const permissions = await Permission.find();
    const permGroup = _.groupBy(permissions, 'category');
    return res.render('admin/edit-role', {
      title: "Edit Role",
      role,
      permissions,
      permGroup
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditRole not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditRole = async (req, res, next) => {
  try {
    const update = await Role.findOneAndUpdate(
      { _id: req.params.role_id },
      {
        name: req.body.name,
        permissions: req.body.permissions,
      }
    ).exec(async (err, result) => {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect(req.responseUrl.DASHBOARD_URL);
        return;
      }
      await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
      req.flash('success', req.responseAdmin.UPDATED_ROLE);
      res.redirect(req.responseUrl.ALL_ROLE_URL);
      return;
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEditRole not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};