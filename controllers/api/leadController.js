const mongoose = require('mongoose');
const RoleAssign = mongoose.model('RoleAssign');
const Role = mongoose.model('Role');
const Lead = mongoose.model('Lead');
const moment = require('moment');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const { permission_name } = require('../../config/responseSetting');

exports.test = (req, res, next) => {
  return res.json({
    message: 'API working'
  })
};

const filterOutPermissions = (role, permission_name) => {
  return _.filter(role.permissions, { name: permission_name }).length == 0 ? 0 : 1
}

exports.configJSON = async (req, res, next) => {
  try {
    let role;
    let configFile;
    const roleAssigned = await RoleAssign.findOne({ user_id: req.user._id });
    if (roleAssigned) {
      // non-admin
      role = await Role
      .findOne({ _id: roleAssigned.role_id })
      .populate({
        path: 'permissions',
        model: 'Permission',
        select: {
          name: 1,
          status: 1
        }
      });
      configFile = {
        super_admin: 0,
        permissions: {
          users: {
            view_masters: filterOutPermissions(role, permission_name.USER_VIEW_MASTER),
            view_listing: filterOutPermissions(role, permission_name.USER_VIEW_LISTING),
            view_password: filterOutPermissions(role, permission_name.USER_VIEW_PASSWORD),
            send_mail: filterOutPermissions(role, permission_name.USER_SEND_MAIL),
            reset_password: filterOutPermissions(role, permission_name.USER_RESET_PASSWORD),
            add: filterOutPermissions(role, permission_name.USER_ADD_USER),
            edit: filterOutPermissions(role, permission_name.USER_EDIT_USER),
          },
          academic_years: {
            view_masters: filterOutPermissions(role, permission_name.ACADEMIC_YEAR_MASTER),
            view_listing: filterOutPermissions(role, permission_name.ACADEMIC_YEAR_LISTING),
            add: filterOutPermissions(role, permission_name.ACADEMIC_YEAR_ADD),
            edit: filterOutPermissions(role, permission_name.ACADEMIC_YEAR_EDIT),
          },
          messages: {
            view_masters: filterOutPermissions(role, permission_name.MSG_VIEW_MASTER),
            view_listing: filterOutPermissions(role, permission_name.MSG_LISTING),
            add: filterOutPermissions(role, permission_name.MSG_ADD),
            edit: filterOutPermissions(role, permission_name.MSG_EDIT)
          },
          leads: {
            view_listing: filterOutPermissions(role, permission_name.LEAD_LISTING),
            add: filterOutPermissions(role, permission_name.LEAD_ADD),
            edit: filterOutPermissions(role, permission_name.LEAD_EDIT),
            follow_up_listing: filterOutPermissions(role, permission_name.FOLLOWUP_LISTING),
            follow_up_add: filterOutPermissions(role, permission_name.FOLLOWUP_ADD),
            follow_up_edit: filterOutPermissions(role, permission_name.FOLLOWUP_EDIT),
          },
          content_view: {
            view_listing: filterOutPermissions(role, permission_name.CONTENT_VIEW_LISTING)
          },
        }
      };
    } else {
      // admin
      configFile = {
        super_admin: 1,
        permissions: {
          users: {
            view_masters: 1,
            view_listing: 1,
            view_password: 1,
            send_mail: 1,
            reset_password: 1,
            add: 1,
            edit: 1
          },
          academic_years: {
            view_masters: 1,
            view_listing: 1,
            add: 1,
            edit: 1
          },
          messages: {
            view_masters: 1,
            view_listing: 1,
            add: 1,
            edit: 1
          },
          leads: {
            view_listing: 1,
            add: 1,
            edit: 1,
            follow_up_listing: 1,
            follow_up_add: 1,
            follow_up_edit: 1,
          },
          content_view: {
            view_listing: 1
          },
        }
      };
    }
    return res.status(200).json(response.responseSuccess("Configurations", configFile, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "config function - GET request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

