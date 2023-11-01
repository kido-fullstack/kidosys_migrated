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