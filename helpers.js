const cacher = require('./services/redis/cacher');
const _ = require('lodash');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

exports.checkPermission = (user, roles, permissionValue) => {
  let rawCacheData = roles;
  let roleCacheData = JSON.parse(rawCacheData);
  let foundUser = _.find(roleCacheData, role => role?.user_id?._id === user._id.toString());
  if (foundUser) {
    let hasPermission = _.some(foundUser.role_id.permissions, {"name": permissionValue})
    return hasPermission;
  } else {
    return false;
  }
}