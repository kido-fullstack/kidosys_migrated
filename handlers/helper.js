const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const Permission = mongoose.model('Permission');
const RoleAssign = mongoose.model('RoleAssign');
const Role = mongoose.model('Role');
const Counter = mongoose.model('Counter');
const generator = require('generate-password');
const moment = require("moment");
const Cryptr = require('cryptr');
const QRCode = require('qrcode');
const config = require('../config/');
const handlers = require('../helpers');
const cryptr = new Cryptr(config.keys.secret);
const cryptrqr = new Cryptr('mySecretKey', { pbkdf2Iterations: 100, saltLength: 2 })
const { ShortCrypt } = require("short-crypt");
const sc = new ShortCrypt(config.keys.key);
const response = require('../handlers/response');

exports.errorDetailsForControllers = (err, errMsg, errPath, payload, currentUser, type, projectPath) => {
  err.errMsg = errMsg;
  err.errPath = errPath;
  err.payload = payload;
  err.currentUser = currentUser;
  err.type = type || "";
  err.projectPath = projectPath;

  return err;

};

exports.errorDetails = (message, code, status, type, stack, errMsg, errPath, payload, currentUser, projectPath) => {
  return {
    message,
    code,
    status,
    type,
    stackHighlighted: stack,
    controllerMsg: errMsg,
    path: errPath,
    payload,
    currentUser,
    projectPath
  }
};

exports.toBeDeletedErrorDetails = (message, code, status, type, stack, errMsg, errPath, payload, currentUser, projectPath) => {
  return {
    message,
    code,
    status,
    type,
    payload
  }
};

exports.getAllAssignedRolesByCache = async (modelName, cacher) => {
  return new Promise((resolve, reject) => {
    modelName
      .find()
      .populate({
        path: 'role_id',
        model: 'Role',
        select: {
          name: 1,
          permissions: 1
        },
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      })
      .populate({
        path: 'user_id',
        model: 'Employee',
        select: {
          name: 1
        }
      })
      .then(async (results) => {
        await cacher.saveToCache('roles', JSON.stringify(results));
        resolve();
      })
      .catch(err => {
        reject("ERR in fetching roles from REDIS.");
      })
  })
};

exports.generatePassword = (length) => {
  return password = generator.generate({
    length,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
    exclude: '",.'
  });
};

exports.generateCharacters = (arr) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

exports.encryptPassword = (password) => {
  return cryptr.encrypt(password);
};
// exports.encryptQr = (qrcode) => {
//   return cryptrqr.encrypt(qrcode);
// };
exports.encryptQr = (qrcode) => {
  return sc.encryptToURLComponent(qrcode)
};

exports.decryptPassword = (password) => {
  return cryptr.decrypt(password);
};
// exports.decryptQr = (qrcode) => {
//   return cryptrqr.decrypt(qrcode);
// };
exports.decryptQr = (qrcode) => {
  return sc.decryptURLComponent(qrcode);
};

exports.generateQRCode = (url) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(url)
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  })
};

exports.requirePermission = (permissionName) => {
  return (req, res, next) => {
    const permission = handlers.checkPermission(req.session.user, req.permissionCacheData, permissionName);
    if (req.session.user.main) {
      if (req.session.user.main == req.config.admin.main) {
        next();
      } else {
        req.flash('error', 'You do not have permission to access this.');
        res.redirect('back');
        return;
      }
    } else {
      if (permission) {
        next();
      } else {
        req.flash('error', 'You do not have permission to access this.');
        res.redirect('back');
        return;
      }
    }
  }
};

exports.checkSuperAdmin = async (req, res, next) => {
  try {
    let adminCheck = 0;
    const user = req.session.user;
    if (user) {
      if (user.main) {
        if (user.main == req.config.admin.main) {
          adminCheck = 1;
          return adminCheck;
        } else {
          adminCheck = 0;
          return adminCheck;
        }
      } else {
        adminCheck = 0;
        return adminCheck;
      }
    } else {
      adminCheck = 0;
      return adminCheck;
    }
  } catch (err) {
    console.log('ERR in handlers/helpers.js in checkAdmin');
    console.log(err);
    return;
  }
};

exports.isValidMongoID = (id) => {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) {
      return true;
    } else {
      return false;
    }
  }
};

exports.requireAPIPermission = (permissionName) => {
  return (req, res, next) => {
    const permission = handlers.checkPermission(req.user, req.permissionCacheData, permissionName);
    if (req.user.main) {
      if (req.user.main == req.config.admin.main) {
        next();
      } else {
        return res.status(403).json(response.responseError('Permission Denied.', 403, 403, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    } else {
      if (permission) {
        next();
      } else {
        return res.status(403).json(response.responseError('Permission Denied.', 403, 403, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    }
  }
};

exports.leadCounter = async () => {
  const count = await Counter.findOne({
    _id: mongoose.Types.ObjectId("649441c04247946da4988428")
  });
  let str = count.lead_counter;
  const numericPart = str.match(/\d+$/);
  const incrementedNumericPart = (parseInt(numericPart[0]) + 1).toString();
  const paddedNumericPart = incrementedNumericPart.padStart(numericPart[0].length, '0');
  const newLeadNumber = str.replace(/\d+$/, paddedNumericPart);
  // update the counter number
  count.lead_counter = newLeadNumber;
  await count.save();
  return newLeadNumber;
}
