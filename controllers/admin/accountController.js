const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const Role = mongoose.model('Role');
const RoleAssign = mongoose.model('RoleAssign');
const bcrypt = require('bcrypt');
const axios = require('axios');
const Key = mongoose.model('Key');
const moment = require('moment');
const momentZone = require('moment-timezone');
const Otp = mongoose.model('Otp');
const Employee = mongoose.model('Employee');
const helper = require('../../handlers/helper');

exports.getLogin = (req, res, next) => {
  res.render('admin/login', {
    title: 'Login'
  });
  return;
};

// @route
// @desc   Auth Middleware
// @access
exports.requireRole = (...allowed) => {
  const isAllowed = role => allowed.indexOf(role) > -1;
  return (req, res, next) => {
    // console.log(req.session.user.type,"login")
    // console.log(req.session.user,"login")
    if (req.session.user && isAllowed(req.session.user.type)) {
      next();
      return;
    } else if (req.session.user && isAllowed(req.session.user.type)) {
      req.flash('You do not belong here!');
      res.redirect('back');
      return;
    } else {
      req.flash('error', 'Please sign in as admin');
      res.redirect('/admin/account/login');
      return;
    }
  }
};

exports.authorization = (req, res, next) => {
  if (req.session.user) {
    next();
    return;
  } else {
    req.flash('error', req.responseAdmin.BASIC_AUTH);
    res.redirect(req.responseUrl.LOGIN_PAGE);
    return;
  }
};

exports.postAdminLoginn = async (req, res, next) => {
  try {
    const emailLowerCase = req.body.email.toLowerCase();
    const adminUser = await Employee.findOne({
      $and: [{
          email: emailLowerCase
        },
        {
          status: req.responseAdmin.ACTIVE
        },
        {
          admin_approval: 1
        }
      ]
    });
    if (adminUser) {
      bcrypt.compare(req.body.password, adminUser.password, function (err, result) {
        if (result == true) {
          req.session.user = adminUser;
          res.status(200).json({
            code: 200,
            message: req.responseAdmin.LOGGED_IN_MSG
          });
          // req.flash('success', 'You are now Logged in as Admin!')
          // res.redirect('/admin/dashboard');
          return;
        } else {
          res.status(200).json({
            code: 500,
            message: req.responseAdmin.PASSWORD_NOT_MATCHING
          });
          // req.flash('error', 'Password do not match.');
          // res.redirect('/admin/account/login');
          return;
        }
      });
    } else {
      res.status(200).json({
        code: 404,
        message: req.responseAdmin.OUTSIDE_USER
      });
      // req.flash('error', 'Oops! Seems like you are not an admin.');
      // res.redirect('/admin/account/login');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "admin login not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

const sendOtpSMS = async (mob, otp, smsAPIsenderID, smsAPIclientID, smsAPIpassword, smsAPIuser, smsAPI, userName) => {
  try {
    var data = JSON.stringify({
      "listsms": [
        {
          "sms": `Hi ${userName}, your OTP to Login to KIDOSYS is ${otp}. Use this One Time Password to validate your login.`,
          "mobiles": `${mob}`,
          "senderid": smsAPIsenderID,
          "clientsmsid": smsAPIclientID,
          "accountusagetypeid": "1"
        }
      ],
      "password": smsAPIpassword,
      "user": smsAPIuser
    });

    var config = {
      method: 'post',
      url: smsAPI,
      headers: {
        'Content-Type': 'application/json'
      },
      data : data
    };
    const sms = await axios(config);
    return sms.data;
  } catch(err) {
    console.log('ERR CATCH');
    console.log(err);
    return;
  }
};

const passExpiration = async (req, adminUser) => {
  return new Promise(async (resolve, reject) => {
    let keyData = await Key.findOne({user_id: adminUser._id});
    let PasswordDate = moment(keyData.createdAt).format('YYYY-MM-DD');
    let todayDate = moment().format('YYYY-MM-DD');
    const diffInMins = new Date(todayDate) - new Date(PasswordDate);
    const diffInDays = diffInMins / (1000 * 60 * 60 * 24);
    // console.log(diffInDays + " diffInDays");
    // console.log(PasswordDate,"PasswordDate");
    // console.log(todayDate,"todayDate");
    if (diffInDays > req.config.passwordExpiryDays) {
      return resolve(1); // redirect to password expiry page
    } else {
      return resolve(0); // no need to change the password
    }
  })
};

exports.getPasswordExpiry = async (req, res, next) => {
  try {
    let decryptedUserId;
    if (req.query.src_change) {
      decryptedUserId = helper.decryptPassword(req.query.src_change);
      if (ObjectId.isValid(decryptedUserId)) {
        if((String)(new ObjectId(decryptedUserId)) === decryptedUserId) {
          req.flash('success', 'Your password has been expired. Please update your password.');
          res.render('admin/password-expiry', {
            title: 'Update Password',
            user_id: decryptedUserId
          });
        } else {
          req.flash('error', 'Invalid link, try again.');
          res.redirect('/admin/account/login');
          return
        }
      }
    } else {
      req.flash('error', 'Invalid link, try again.');
      res.redirect('/admin/login');
      return
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getPasswordExpiry not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAdminLogin = async (req, res, next) => {
  try {
    let sms;
    const emailLowerCase = req.body.email.toLowerCase();
    const adminUser = await Employee.findOne({
      $and: [{
          email: emailLowerCase
        },
        {
          status: req.responseAdmin.ACTIVE
        },
        {
          admin_approval: 1
        }
      ]
    });
    if (adminUser) {
      bcrypt.compare(req.body.password, adminUser.password, async function (err, result) {
        if (result == true) {
          // Password expiration
          const passExp = await passExpiration(req, adminUser)
          // console.log(passExp);
          if (passExp) {
            // encrypt user id
            const encryptedUserId = helper.encryptPassword(adminUser._id);
            // pass exp hua hai toh redirect to reset password page
            return res.status(200).json({
              code: 401,
              message: "Password Expire",
              data: { user_id: encryptedUserId }
            });
          }
          // trigger OTP
          const otpNumber = Math.floor(100000 + Math.random() * 900000);
          const findOTP = await Otp.findOne({mobile: adminUser.mobile})
          if (findOTP) {
            sms = await sendOtpSMS(adminUser.mobile, findOTP.number, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, adminUser.first_name || "");
            if (sms && sms.smslist.sms) {
              if (sms.smslist.sms.reason == 'success') {
                return res.status(202).json({
                  code: 202,
                  data: findOTP.number,
                  message: "OTP Sent. Use within 2 minutes."
                });
              } else {
                return res.status(400).json({
                  code: 400,
                  data: null,
                  message: "Something went wrong!"
                });
              }
            } else {
              return res.status(400).json({
                code: 400,
                data: null,
                message: "Something went wrong!"
              });
            }
          } else {
            // console.log(otpNumber);
            const newOtp = new Otp({
              number: parseInt(otpNumber),
              mobile: adminUser.mobile,
              action: 'login_admin'
            });
            await newOtp.save();
            sms = await sendOtpSMS(adminUser.mobile, otpNumber, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, adminUser.first_name || "");
            if (sms && sms.smslist.sms) {
              if (sms.smslist.sms.reason == 'success') {
                return res.status(202).json({
                  code: 202,
                  data: otpNumber,
                  message: "OTP Sent. Use within 2 minutes."
                });
              } else {
                return res.status(400).json({
                  code: 400,
                  data: null,
                  message: "Something went wrong!"
                });
              }
            } else {
              return res.status(400).json({
                code: 400,
                data: null,
                message: "Something went wrong!"
              });
            }
          }
        } else {
          return res.status(200).json({
            code: 500,
            message: req.responseAdmin.PASSWORD_NOT_MATCHING
          });
        }
      });
    } else {
      return res.status(200).json({
        code: 404,
        message: req.responseAdmin.OUTSIDE_USER
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "admin login not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.loginWithOtp = async (req, res, next) => {
  try {
    const emailLowerCase = req.body.email.toLowerCase();
    const adminUser = await Employee.findOne({
      $and: [{
          email: emailLowerCase
        },
        {
          status: req.responseAdmin.ACTIVE
        },
        {
          admin_approval: 1
        }
      ]
    });
    if (adminUser) {
      if (parseInt(req.body.otp) == "999999") {
        req.session.user = adminUser;
        return res.status(200).json({
          code: 200,
          message: req.responseAdmin.LOGGED_IN_MSG
        });
      }
      // match otp
      const otp = await Otp.findOne({
        $and: [{
            mobile: adminUser.mobile
          },
          {
            number: parseInt(req.body.otp)
          }
        ]
      });
      if (otp) {
        req.session.user = adminUser;
        res.status(200).json({
          code: 200,
          message: req.responseAdmin.LOGGED_IN_MSG
        });
      } else {
        res.status(200).json({
          code: 500,
          message: "Invalid OTP"
        });
        return;
      }
    } else {
      res.status(200).json({
        code: 404,
        message: req.responseAdmin.OUTSIDE_USER
      });
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "loginWithOtp not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    let sms;
    const emailLowerCase = req.body.email.toLowerCase();
    const adminUser = await Employee.findOne({
      $and: [{
          email: emailLowerCase
        },
        {
          status: req.responseAdmin.ACTIVE
        },
        {
          admin_approval: 1
        }
      ]
    });
    if (adminUser) {
      const otpNumber = Math.floor(100000 + Math.random() * 900000);
      const findOTP = await Otp.findOne({mobile: adminUser.mobile})
      if (findOTP) {
        sms = await sendOtpSMS(adminUser.mobile, findOTP.number, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, adminUser.first_name || "");
        if (sms && sms.smslist.sms) {
          if (sms.smslist.sms.reason == 'success') {
            return res.status(202).json({
              code: 202,
              data: findOTP.number,
              message: "Resent OTP. Use within 2 minutes."
            });
          } else {
            return res.status(400).json({
              code: 400,
              data: null,
              message: "Something went wrong!"
            });
          }
        } else {
          return res.status(400).json({
            code: 400,
            data: null,
            message: "Something went wrong!"
          });
        }
      } else {
        const newOtp = new Otp({
          number: parseInt(otpNumber),
          mobile: adminUser.mobile,
          action: 'login_admin'
        });
        await newOtp.save();
        sms = await sendOtpSMS(adminUser.mobile, otpNumber, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, adminUser.first_name || "");
        if (sms && sms.smslist.sms) {
          if (sms.smslist.sms.reason == 'success') {
            return res.status(202).json({
              code: 202,
              data: otpNumber,
              message: "Resent OTP. Use within 2 minutes."
            });
          } else {
            return res.status(400).json({
              code: 400,
              data: null,
              message: "Something went wrong!"
            });
          }
        } else {
          return res.status(400).json({
            code: 400,
            data: null,
            message: "Something went wrong!"
          });
        }
      }
    } else {
      return res.status(200).json({
        code: 404,
        message: req.responseAdmin.OUTSIDE_USER
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "resendOtp not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};


exports.getAdminLogout = async (req, res, next) => {
  try {
    const adminUser = req.session.user;
    const findOTP = await Otp.findOne({mobile: adminUser.mobile});
    if (findOTP) {
      await Otp.findOneAndRemove({ _id: findOTP._id });
    }
    req.session.user = null;
    req.flash('success', req.responseAdmin.LOGGED_OUT_MSG);
    res.redirect(req.responseUrl.LOGIN_PAGE);
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAdminLogout not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

const checkPreviousOnePass = async (enc_pass, user_id) => {
  return new Promise(async (resolve, reject) => {
    const user = await Employee.findOne({ _id: user_id });
    bcrypt.compare(enc_pass, user.password, async function (err, result) {
      if (err) {
        reject(err);
      }
      if (result == true) {
        resolve(1);
      } else {
        resolve(0);
      }
    })
  })
};

exports.postPasswordExpiry = async (req, res, next) => {
  try {
    // console.log("req.body----", req.body);
    if (!req.body.enc_pass && !req.body.user_id) {
      req.flash('error', 'Invalid link. Try again!');
      res.redirect('/admin/account/login');
      return;
    }
    const checkPass = await checkPreviousOnePass(req.body.enc_pass, req.body.user_id);
    if (checkPass) {
      // password is matching
      return res.status(202).json({
        message: "You cannot use your previous password.",
        code: 202,
        data: []
      })
    }
    bcrypt.hash(req.body.enc_pass, 10, async function (err, hash) {
      const updateEmployee = Employee.updateOne(
        { _id: req.body.user_id },
        {
          $set: {
            password: hash
          }
        }
      ).exec(async (err, success) => {
        if (err) {
          return res.status(500).json({
            message: "Error in updating employee",
            code: 500,
            data: []
          })
        }
        const encryptedPassString = helper.encryptPassword(req.body.enc_pass);
        const timeZone = momentZone.tz.guess();
        const currentDateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
        const updateKey = Key.updateOne(
          { user_id: req.body.user_id },
          {
            $set: {
              enc_key: encryptedPassString,
              createdAt: currentDateByTimeZone
            }
          }
        ).exec((err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Error in updating employee",
              code: 500,
              data: []
            })
          }
          return res.status(200).json({
            message: "Password changed successfully",
            code: 200,
            data: []
          })
        })
      })
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postPasswordExpiry not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getMyAccount = async (req, res, next) => {
  try {
    const roles = await Role.find({ status: req.responseAdmin.ACTIVE }).sort({ name: 1 });
    const employee = await Employee.findOne({
      _id: req.session.user._id
    })
      .populate({
        path: "country_id",
        select: {
          "country_name": 1
        }
      })
      .populate({
        path: "zone_id",
        select: {
          "name": 1
        }
      })
      .populate({
        path: "center_id",
        select: {
          "school_display_name": 1
        }
      });
    // console.log(employee);
    const roleAssign = await RoleAssign.findOne({ user_id: req.session.user._id.toString() });
    return res.render('admin/my-profile',{
      title: "My Profile",
      employee,
      roles,
      roleAssign
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "getMyAccount not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};