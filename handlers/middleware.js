const _ = require('lodash');

// Not in use anymore
exports.test = (permissionValue) => {
  return (req, res, next) => {
    let user = req.session.user;
    let rawCacheData = req.permissionCacheData;
    let roleCacheData = JSON.parse(rawCacheData);
    let foundUser = _.find(roleCacheData, role => role?.user_id?._id === user._id);
    let hasPermission = _.some(foundUser.role_id.permissions, {"name": permissionValue});
    if (hasPermission) {
      next();
    } else {
      req.flash('error', req.responseAdmin.OUTSIDE_USER);
      res.redirect('back');
      return;
    }
  }
}