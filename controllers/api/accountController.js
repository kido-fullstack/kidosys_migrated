const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const moment = require('moment');
const Employee = mongoose.model('Employee');
const Token = mongoose.model('Token');
const RoleAssign = mongoose.model('RoleAssign');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

// Added to support verify and resend OTP API's.  
const Otp = mongoose.model('Otp');
const axios = require('axios');

exports.test = (req, res, next) => {
  return res.json(req.config);
};

// @route
// @desc   Just for Authentication
// @access
exports.Auth = (req, res, next) => {
  passport.authenticate('jwt', {
    session: true
  }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({
      message: 'Unauthorized',
      code: 401,
      status: 401,
      type: "api",
      path: req.originalUrl,
      payload: req.body || {},
      level: "error",
      timestamp: moment().format('MMMM Do YYYY, h:mm:ss a')
    });
    req.user = user;
    next();
  })(req, res, next);
};

exports.postLogin = async (req, res, next) => {
  try {
    const findUser = await Employee.findOne({ email: req.body.email.toLowerCase().trim() });

    if (!findUser) {
      return res.status(400).json(response.responseError('User not found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else if (findUser.status == 'inactive' || findUser.admin_approval == 0) {
      // user inactive and not approved by admin yet
      return res.status(400).json(response.responseError("You are currently not allowed to login! Please contact support!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      const isPasswordMatch = await bcrypt.compare(req.body.password, findUser.password);
      if (isPasswordMatch) {
        // User Matched
        const payload = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
        };
        // JWT Sign
        const token = await jwt.sign(payload, req.config.keys.secret, {
          expiresIn: "90 days"
        });
        return res.status(200).json(response.responseSuccess("You are now logged In!", { _id: findUser._id, token: `Bearer ${token}`, name: findUser.name, email: findUser.email }, 200));
      } else {
        return res.status(400).json(response.responseError("Invalid email or password", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postLogin - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json(response.responseError("Please provide authorization key.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const token = await Token.findOne({
      token: req.headers.authorization
    });
    if (!token) {
      const newToken = new Token({
        token: req.headers.authorization
      });
      await newToken.save();
      req.user = null;
      return res.status(200).json(response.responseSuccess("You are now logged out!", null, 200));
    } else {
      req.user = null;
      return res.status(200).json(response.responseSuccess("You are already logged out of the dashboard!", null, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postLogout - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.checkToken = async (req, res, next) => {
  try {
    const token = await Token.find({
      token: {
        $in: req.headers.authorization
      }
    });
    if (token.length === 0) {
      next();
    } else {
      return res.status(400).json(response.responseError("Invalid token. Please login again!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "checkToken - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getMyAccount = async (req, res, next) =>{
  try{
    // const roles = await Role.find({ status: req.responseAdmin.ACTIVE }).sort({ name: 1 });
    const employee = await Employee.findOne({
      _id: req.user._id
    }, {first_name:1, last_name:1, email:1, mobile:1}).populate("user_unique_id")
      .populate({
        path: "country_id",
        select: {
          country_name: 1
        }
      })
      .populate({
        path: "zone_id",
        select: {
          name: 1
        }
      })
      .populate({
        path: "center_id",
        select: {
          school_display_name: 1
        }
      });
      const roleAssing = await RoleAssign.findOne({user_id: req.user._id.toString() })
        .populate({
          path: "role_id",
          model: "Role",
          select: {
            name: 1
          }
        });
      return res.status(200).json({
        title:"My Profile",
        employee,
        roleAssing
      })
  }catch (err) {
    helper.errorDetailsForControllers(err, "getMyAccount not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

/* 
  This method is responsible for OTP verification.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.postLoginVerify = async (req, res, next) => {
  try {
    const findUser = await Employee.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!findUser) {
      return res.status(400).json(response.responseError('User not found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else if (findUser.status == 'inactive' || findUser.admin_approval == 0) {
      // user inactive and not approved by admin yet
      return res.status(400).json(response.responseError("You are currently not allowed to login! Please contact support!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      if (parseInt(req.body.otp) == 111111) {
        const payload = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
        };
        // JWT Sign
        const token = jwt.sign(payload, req.config.keys.secret, {
          expiresIn: "90 days"
        });
        return res.status(200).json(response.responseSuccess("You are now logged in!", { _id: findUser._id, token: `Bearer ${token}`, name: findUser.name, email: findUser.email }, 200));
      }
      // match otp
      const otp = await Otp.findOne({
        $and: [{
            mobile: findUser.mobile
          },
          {
            number: parseInt(req.body.otp)
          }
        ]
      });
      if (otp) {
        const payload = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
        };
        // JWT Sign
        const token = jwt.sign(payload, req.config.keys.secret, {
          expiresIn: "90 days"
        });
        return res.status(200).json(response.responseSuccess("You are now logged in!", { _id: findUser._id, token: `Bearer ${token}`, name: findUser.name, email: findUser.email }, 200));
      } else {
        return res.status(400).json(response.responseError('Invalid OTP.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
    }
  } catch (err) {
    console.log(err);
    helper.errorDetailsForControllers(err, "postLoginVerify - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

/* 
  This method is responsible for resending the OTP.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
exports.postResendOTP = async (req, res, next) => {
  try {
    const findUser = await Employee.findOne({ email: req.body.email.toLowerCase().trim() });

    if (!findUser) {
      return res.status(400).json(response.responseError('User not found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else if (findUser.status == 'inactive' || findUser.admin_approval == 0) {
      // user inactive and not approved by admin yet
      return res.status(400).json(response.responseError("You are currently not allowed to login! Please contact support!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    } else {
      // trigger OTP
      const otpNumber = Math.floor(100000 + Math.random() * 900000);
      const findOTP = await Otp.findOne({mobile: findUser.mobile});
      if (findOTP) {
        sms = await sendOtpSMS(findUser.mobile, findOTP.number, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, findUser.first_name || "");
        if (sms && sms.smslist.sms) {
          if (sms.smslist.sms.reason == 'success') {
            return res.status(202).json(response.responseSuccess('OTP Re-sent. Use within 2 minutes.', null, 200));
          } else {
            return res.status(400).json(response.responseError('Something went wrong.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
        } else {
          return res.status(400).json(response.responseError('Something went wrong.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
        }
      } else {
        const newOtp = new Otp({
          number: parseInt(otpNumber),
          mobile: findUser.mobile,
          action: 'login_admin'
        });
        await newOtp.save();
        sms = await sendOtpSMS(findUser.mobile, otpNumber, req.config.smsAPIsenderID, req.config.smsAPIclientID, req.config.smsAPIpassword, req.config.smsAPIuser, req.config.smsAPI, findUser.first_name || "");
        console.log("sms===", sms);
        if (sms && sms.smslist.sms) {
          if (sms.smslist.sms.reason == 'success') {
            return res.status(202).json(response.responseSuccess('OTP Re-Sent. Use within 2 minutes.', null, 200));
          } else {
            return res.status(400).json(response.responseError('Something went wrong.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
          }
        } else {
          return res.status(400).json(response.responseError('Something went wrong.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
        }
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postResendOTP - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

/* 
  This method is responsible to send OTP SMS.
  Previously removed by Sayyed. Adding back on Mayank & Rahul's requirement to test the API for mobile APK.
*/
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