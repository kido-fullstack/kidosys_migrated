const mongoose = require('mongoose');
const dateTime = require('node-datetime');
const _ = require('lodash');
const moment = require('moment');
const momentZone = require('moment-timezone');
const Employee = mongoose.model('Employee');
const Key = mongoose.model('Key');
const Role = mongoose.model('Role');
const Center = mongoose.model("Center");
const RoleAssign = mongoose.model('RoleAssign');
const Country = mongoose.model('Country');
const Zone = mongoose.model('Zone');
const Permission = mongoose.model('Permission');
const SpecificListing = mongoose.model('SpecificListing');
const ViewOption = mongoose.model('ViewOption');
const bcrypt = require('bcrypt');
const helper = require('../../handlers/helper');
const cacher = require('../../services/redis/cacher');
const mail = require('../../handlers/mail');
const ObjectId = require("mongodb").ObjectId;

exports.test = (req, res, next) => {
  res.send('hey');
};

exports.allEmployee = async (req, res, next) => {
  try {
    let employees = [];
    let datas;
    let coutry_id
    const roles = await Role.find({ status: "active" });
    // console.log(req.config.admin.email,"req.config.admin.main")
    if (req.session.user) {
      if (req.session.user.main && req.session.user.main == req.config.admin.main) {
        employees = await Employee
          .find({ email: { $nin: ["sysadmin@system.com", "kidoindia@kidoschools.com", "rahulgupta0992@gmail.com"] } })
          .populate({
            path: "center_id",
            select: {
              school_display_name: 1
            }
          })
          .populate({
            path: "role_id",
            select: {
              name: 1
            }
          })
          .populate({
            path: "country_id"
          })
          .populate({
            path: "zone_id"
          })
          .sort({
            createdAt: req.responseAdmin.DESC
          });
        // employees = await Employee.aggregate([
        //   {
        //     '$match': {
        //       "email" : {$ne : req.config.admin.email}
        //     }
        //   }
          // },{
          //   $lookup: {
          //     from: "viewoptions",
          //     localField: "view_option",
          //     foreignField: "_id",
          //     // 'pipeline': [{'$sort': {"order": -1}}],
          //     as: "viewoption",
          //   },
          // },{
          //   $unwind:{
          //     path: "$viewoption"
          //   }
          // },
          //   {
          //   $unwind:{
          //     path: "$viewoption.countries"
          //   }
          // },{
          //   $unwind:{
          //     path:"$viewoption.zones"
          //   }
          // },{
          //   $lookup:{
          //     from: "centers",
          //     localField: "center_id",
          //     foreignField: "_id",
          //     // 'pipeline': [{'$sort': {"order": -1}}],
          //     as: "center",
          //   }
          // },{
          //   $unwind:{
          //     path: "$center"
          //   }
          // },{
          //   $lookup:{
          //     from: "roles",
          //     localField: "role_id",
          //     foreignField: "_id",
          //     // 'pipeline': [{'$sort': {"order": -1}}],
          //     as: "role",
          //   }
          // },{
          //   $unwind:{
          //     path: "$role"
          //   }
          // }
        // ])
          // coutry_id = employees.view_option
          const countries = await Country.find({ status: "Active" });
          const zones = await Zone.find({ status: "active" });
          const centers = await Center.find({ status: "active" }, { school_display_name: 1 });
          datas = {
            countries,
            zones,
            centers
          };
      } else {
        let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
        employees = await Employee
          .find({ email: { $nin: ["sysadmin@system.com", "kidoindia@kidoschools.com", "rahulgupta0992@gmail.com"] } })
          .find({ center_id: {$in: objectIdArray} })
          .find({ _id: { $ne: req.session.user._id } })
          .populate({
            path: "center_id",
            select: {
              school_display_name: 1
            }
          })
          .populate({
            path: "role_id",
            select: {
              name: 1
            }
          })
          .populate({
            path: "country_id"
          })
          .populate({
            path: "zone_id"
          })
          .sort({
            createdAt: req.responseAdmin.DESC
          });
        // employees = await Employee.aggregate([
        //   {
        //     '$match': {
        //       "center_id" : ObjectId(req.session.user.center_id)
        //     }
        //   },{
        //     '$match': {
        //       "_id" : {$ne: req.session.user._id}
        //     }
        //   }
        //   ,{
        //     $lookup: {
        //       from: "viewoptions",
        //       localField: "view_option",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "viewoption",
        //     },
        //   },{
        //     $unwind:{
        //       path: "$viewoption"
        //     }
        //   },
        //     {
        //     $unwind:{
        //       path: "$viewoption.countries"
        //     }
        //   },{
        //     $unwind:{
        //       path:"$viewoption.zones"
        //     }
        //   },{
        //     $lookup:{
        //       from: "centers",
        //       localField: "center_id",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "center",
        //     }
        //   },{
        //     $unwind:{
        //       path: "$center"
        //     }
        //   },{
        //     $lookup:{
        //       from: "roles",
        //       localField: "role_id",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "role",
        //     }
        //   },{
        //     $unwind:{
        //       path: "$role"
        //     }
        //   }
        // ])
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
    }
    // console.log(employees,"employees")
    // console.log(coutry_id,"coutry_id")
    return res.render('admin/all-employee', {
      title: 'All Employee',
      employees,
      data: datas,
      roles
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "all employee err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAddEmployee = async (req, res, next) => {
  try {
    const rolesPromise = Role.find({ status: req.responseAdmin.ACTIVE }).sort({ name: 1 });
    const countriesPromise = Country.find({ status: 'Active' }).sort({ country_name: 1 });
    const zonesPromise = Zone.find({ status: req.responseAdmin.ACTIVE }).sort({ name: 1 });
    const [roles, countries, zones] = await Promise.all([rolesPromise, countriesPromise, zonesPromise]);
    if (req.body.adminCheck) {
      // console.log('Admin Hai...');
      return res.render('admin/add-employee', {
        title: 'Add User',
        roles,
        countries,
        zones
      });
    } else {
      // return res.render('admin/add-employee-apart-admin', {
      //   title: 'Add Employee',
      //   roles: req.body.apartAdminRoles,
      //   countries,
      //   zones
      // });
      return res.render('admin/add-employee-apart-admin', {
        title: 'Add User',
        roles,
        countries,
        zones
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "get employee page err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.checkDuplicateEntryForEmployee = async (req, res, next) => {
  try {
    const userOne = await Employee.findOne({
      emp_unique_id: req.body.emp_unique_id.trim(),
    });
    if (userOne) {
      return res.status(200).json({
        message: "User with employee unique ID already present.",
        data: null,
        code: 404
      });
    } else {
      const userTwo = await Employee.findOne({
        email: req.body.email.toLowerCase().trim()
      });
      if (userTwo) {
        return res.status(200).json({
          message: "User with email address already present.",
          data: null,
          code: 404
        });
      } else {
        next();
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "checkDuplicateEntryForEmployee err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

const generateDynamicPassword = (startNum, endNum, randomChars) => {
  const genPassword = helper.generatePassword(_.random(startNum, endNum));
  const staticPassword = helper.generateCharacters(randomChars.split(""));
  return `${genPassword}${staticPassword}${dateTime.create().format('S')}`;
};

exports.onlyAdminEntry = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      if (user.main) {
        if (user.main == req.config.admin.main) {
          req.body.adminCheck = 1;
          next();
        } else {
          req.flash('error', 'You do not have permission to access this.');
          res.redirect('back');
          return;
        }
      } else {
        req.flash('error', 'You do not have permission to access this.');
        res.redirect('back');
        return;
      }
    } else {
      req.flash('error', 'You do not have permission to access this.');
      res.redirect('back');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "onlyAdminEntry err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.checkAdminOrNot = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      if (user.main) {
        if (user.main == req.config.admin.main) {
          req.body.adminApp = {
            subject: req.config.mailMessage.newUser.subject,
            title: req.config.mailMessage.newUser.title
          };
          req.body.adminCheck = 1;
          next();
        } else {
          req.body.adminApp = {
            subject: req.config.mailMessage.approvalUser.subject,
            title: req.config.mailMessage.approvalUser.title
          };
          req.body.adminCheck = 0;
          next();
        }
      } else {
        req.body.adminApp = {
          subject: req.config.mailMessage.approvalUser.subject,
          title: req.config.mailMessage.approvalUser.title
        };
        req.body.adminCheck = 0;
        next();
      }
    } else {
      req.body.adminApp = {
        subject: req.config.mailMessage.approvalUser.subject,
        title: req.config.mailMessage.approvalUser.title
      };
      req.body.adminCheck = 0;
      next();
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "checkAdminOrNot err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

// exports.checkAdminOrNott = async (req, res, next) => {
//   try {
//     const user = req.session.user;
//     const permissionsCount = await Permission.countDocuments();
//     const roleAssign = await RoleAssign.findOne({ user_id: user._id });
//     const role = await Role.findOne({ _id: roleAssign.role_id });
//     console.log(role && role.permissions && role.permissions.length == permissionsCount);
//     if (role && role.permissions && role.permissions.length == permissionsCount) {
//       console.log('Admin hai!!');
//       req.body.adminApp = {
//         subject: req.config.mailMessage.newUser.subject,
//         title: req.config.mailMessage.newUser.title
//       };
//       req.body.adminCheck = 1;
//       next();
//     } else {
//       let roleArr = [];
//       const roles = await Role.find({});
//       for (let rul of roles) {
//         if (rul && rul.permissions && rul.permissions.length !== permissionsCount) {
//           roleArr.push(rul);
//         }
//       }
//       console.log('Admin NAHI hai!!');
//       req.body.adminApp = {
//         subject: req.config.mailMessage.approvalUser.subject,
//         title: req.config.mailMessage.approvalUser.title
//       };
//       req.body.adminCheck = 0;
//       req.body.apartAdminRoles = roleArr;
//       next();
//     }
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "add employee err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

const checkViewOp = async (country_id, zone_id, center_id) => {
  try {
    const viewOps = await ViewOption.findOne({
      countries: country_id,
      zones: zone_id,
      centers: center_id
    });
    return viewOps;
  } catch (err) {
    helper.errorDetailsForControllers(err, "add checkViewOp err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddEmployee = async (req, res, next) => {
  try {
    let uniqueID = dateTime.create().format('YmdHMS');
    let userUniqueID = `#${req.body.first_name.trim().toLowerCase()}_${uniqueID}`;
    const confirmPassword = generateDynamicPassword(req.config.startPasswordNumber, req.config.endPasswordNumber, req.config.randomCharacters);
    bcrypt.hash(confirmPassword, 10, async function (err, hash) {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect('back');
        return;
      }

      const checkViewOption = await checkViewOp(req.body.country_id, req.body.zone_id, req.body.center_id);
      let newViewOption;

      if (checkViewOption) {
        newViewOption = checkViewOption;
      } else {
        newViewOption= new ViewOption({
          countries: req.body.country_id,
          zones: req.body.zone_id,
          centers: req.body.center_id,
          role_id: req.body.role_type
        });
        const viewOption = await newViewOption.save();
      }
      // console.log(req.body.center_id,"req.body.center_id")
      const newEmployee = new Employee({
        user_unique_id: userUniqueID,
        emp_unique_id: req.body.emp_unique_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        name: `${req.body.first_name} ${req.body.last_name}`,
        email: req.body.email.toLowerCase().trim(),
        password: hash,
        mobile: req.body.mobile,
        status: req.body.status,
        controlled_by: req.session.user._id,
        added_by: req.session.user._id,
        view_option: newViewOption._id,
        zone_id: req.body.zone_id,
        country_id: req.body.country_id,
        school_id: req.body.center_id,
        center_id: req.body.center_id,
        role_id: req.body.role_type,
        admin_approval: req.body.adminCheck
      });
      const emp = await newEmployee.save();
      let newAssign = new RoleAssign({
        role_id: req.body.role_type,
        user_id: emp._id
      });
      const assignedRole = await newAssign.save();
      await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
      const newListing = new SpecificListing({
        user_id: emp._id,
        role_assign_id: assignedRole._id,
        countries: req.body.country_id,
        zones: req.body.zone_id,
        centers: req.body.center_id,
        createdBy: req.session.user_id,
        updatedBy: req.session.user_id
      });
      const specificListing = await newListing.save();
      const updateviewOption = ViewOption.updateOne({
        _id: newViewOption._id
      }, {
        $set: {
          countries: req.body.country_id,
          zones: req.body.zone_id,
          centers: req.body.center_id,
          role_id: req.body.role_type,
          user_id: emp._id,
          role_assign_id: assignedRole._id
        },
      }, { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err,"err")
          return;
        }
      })

      const encryptedPassString = helper.encryptPassword(confirmPassword);
      const newKey = new Key({
        user_id: emp._id,
        enc_key: encryptedPassString
      });
      const saveKey = await newKey.save();
      await mail.send({
        user: req.body.email,
        subject: req.body.adminApp.subject,
        msg: {
          email: req.body.email,
          password: confirmPassword,
          firstName: req.body.first_name
        },
        filename: 'email-new-user',
        title: req.body.adminApp.title
      });
      // req.flash('success', req.responseAdmin.NEW_USER);
      // res.redirect('back');
      // return;
      return res.status(200).json({
        message: "User created successfully.",
        data: null,
        code: 200
      })
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "add employee err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddEmployeee = async (req, res, next) => {
  try {
    const user = await Employee.findOne({ email: req.body.email.trim().toLowerCase() });
    if (user) {
      req.flash('error', req.responseAdmin.SAME_USER_EXIST);
      res.redirect('back');
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async function (err, hash) {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect('back');
          return;
        }
        const newEmployee = new Employee({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          mobile: req.body.mobile,
          status: req.body.status,
        });
        newEmployee.save(async (err, result) => {
          if (err) {
            req.flash('error', req.responseAdmin.SOMETHING_ERR);
            res.redirect('back');
            return;
          }
          let newAssign = new RoleAssign({
            role_id: req.body.role_type,
            user_id: result._id
          });
          await newAssign.save();
          await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
          req.flash('success', req.responseAdmin.NEW_USER);
          res.redirect('back');
          return;
        })
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "add employee err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getEditEmployee = async (req, res, next) => {
  try {
    const roles = await Role.find({ status: req.responseAdmin.ACTIVE }).sort({ name: 1 });
    const employee = await Employee.findOne({
      _id: req.params.employee_id
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
    const roleAssign = await RoleAssign.findOne({ user_id: employee._id.toString() });
    if (employee) {
      res.render('admin/edit-employee', {
        title: 'Update Employee',
        employee,
        roles,
        roleAssign
      });
      return;
    } else {
      req.flash('error', req.responseAdmin.EMPLOYEE_NOT_FOUND);
      res.redirect('back');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "edit employee page err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEditEmployee = async (req, res, next) => {
  try {
    const user = await Employee.findOne({ _id: req.params.employee_id });
    const roleAssign = await RoleAssign.findOne({ user_id: user._id });

    if (req.body.password != "") {
      bcrypt.hash(req.body.password, 10, async function (err, hash) {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect('back');
          return;
        }
        const updateEmployee = await Employee.findOneAndUpdate({
          _id: req.params.employee_id
        }, {
          $set: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            name: `${req.body.first_name} ${req.body.last_name}`,
            password: hash,
            mobile: req.body.mobile,
            email: req.body.email,
            status: req.body.status,
            role_id: req.body.role_type
          }
        }, {
          new: true
        }).exec(async (err, result) => {
          if (err) {
            req.flash('error', req.responseAdmin.SOMETHING_ERR);
            res.redirect('back');
            return;
          }
          // update password in key
          let keyData = await Key.findOne({user_id: user._id});
          if (keyData) {
            const encryptedPassString = helper.encryptPassword(req.body.password);
            const timeZone = momentZone.tz.guess();
            const currentDateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
            await Key.updateOne(
              { user_id: user._id },
              {
                $set: {
                  enc_key: encryptedPassString,
                  createdAt: currentDateByTimeZone
                }
              }
            );
          };

          if (req.body.role_type.toString() !== roleAssign.role_id.toString()) {
            roleAssign.role_id = req.body.role_type;
            await roleAssign.save();
            await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
          }
          if (req.session.user && req.session.user.main == req.config.admin.main) {
            req.flash('success', req.responseAdmin.UPDATED_USER);
            res.redirect(req.responseUrl.ALL_USER);
            return;
          } else {
            user.admin_approval = 0;
            await user.save();
            req.flash('success', req.responseAdmin.UPDATED_USER);
            res.redirect(req.responseUrl.ALL_USER);
            return;
          }
        })
      })
    } else {
      const updateEmployee = await Employee.findOneAndUpdate({
        _id: req.params.employee_id
      }, {
        $set: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          name: `${req.body.first_name} ${req.body.last_name}`,
          email: req.body.email,
          mobile: req.body.mobile,
          status: req.body.status,
          role_id: req.body.role_type
        }
      }, {
        new: true
      }).exec(async (err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect('back');
          return;
        }
        if (req.body.role_type.toString() !== roleAssign.role_id.toString()) {
          roleAssign.role_id = req.body.role_type;
          await roleAssign.save();
          await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
        }
        if (req.session.user && req.session.user.main == req.config.admin.main) {
          req.flash('success', req.responseAdmin.UPDATED_USER);
          res.redirect(req.responseUrl.ALL_USER);
          return;
        } else {
          user.admin_approval = 0;
          await user.save();
          req.flash('success', req.responseAdmin.UPDATED_USER);
          res.redirect(req.responseUrl.ALL_USER);
          return;
        }
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "edit employee err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAdminEmail = async (req, res, next) => {
  try {
    const user = await Employee.findOne({ _id: req.session.user.controlled_by }, {email: 1, name: 1});
    // console.log(user.email);
    req.body.mainAdminObj = user;
    next();
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddEmployeeApartAdmin err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postAddEmployeeApartAdmin = async (req, res, next) => {
  try {
    let uniqueID = dateTime.create().format('YmdHMS');
    let userUniqueID = `#${req.body.first_name.trim().toLowerCase()}_${uniqueID}`;
    const confirmPassword = generateDynamicPassword(req.config.startPasswordNumber, req.config.endPasswordNumber, req.config.randomCharacters);
    bcrypt.hash(confirmPassword, 10, async function (err, hash) {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect('back');
        return;
      }
      // console.log(req.session.user.view_option);
      const newEmployee = new Employee({
        user_unique_id: userUniqueID,
        emp_unique_id: req.body.emp_unique_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        name: `${req.body.first_name} ${req.body.last_name}`,
        email: req.body.email,
        password: hash,
        mobile: req.body.mobile,
        status: req.body.status,
        country_id: req.session.user.country_id,
        controlled_by: req.session.user.controlled_by,
        added_by: req.session.user.added_by,
        view_option: req.session.user.view_option,
        school_id: req.session.user.school_id,
        center_id: req.session.user.center_id,
        admin_approval: 0
      });
      const emp = await newEmployee.save();
      let newAssign = new RoleAssign({
        role_id: req.body.role_type,
        user_id: emp._id
      });
      const assignedRole = await newAssign.save();
      await helper.getAllAssignedRolesByCache(RoleAssign, cacher);

      const encryptedPassString = helper.encryptPassword(confirmPassword);
      const newKey = new Key({
        user_id: emp._id,
        enc_key: encryptedPassString
      });
      const saveKey = await newKey.save();
      const viewOption = await ViewOption.findOne({ _id: req.session.user.view_option })
          .populate({
            path: "countries",
            select: {
              country_name: 1
            }
          })
          .populate({
            path: "zones",
            select: {
              name: 1
            }
          })
          .populate({
            path: "centers",
            select: {
              school_name: 1
            }
          });
        // console.log(viewOption);
        // await mail.send({
        //   user: req.config.admin.email,
        //   subject: req.body.adminApp.subject,
        //   msg: {
        //     firstName: `${req.body.first_name} ${req.body.last_name}`,
        //     country: viewOption.countries[0].country_name,
        //     zone: viewOption.zones[0].name,
        //     center: viewOption.centers[0].school_name
        //   },
        //   filename: 'email-approval-user',
        //   title: req.body.adminApp.title
        // });
      // req.flash('success', "Mail sent for approval to admin.");
      // res.redirect('back');
      // return;
      return res.status(200).json({
        message: "User created successfully.",
        data: null,
        code: 200
      })
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddEmployeeApartAdmin err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAllPendingApprovals = async (req, res, next) => {
  try {
    const employees = await Employee.find({ admin_approval: 0 });
    return res.render('admin/all-pending-employees', {
      title: 'All pending approvals',
      employees
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPendingApprovals err - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.viewPassword = async (req, res, next) => {
  try {
   const passwordKey = await Key.findOne({ user_id: req.body.user_id }, {
    enc_key: 1
   });
   const decryptPassword = helper.decryptPassword(passwordKey.enc_key);
   res.status(200).json({
    message: "View Password",
    password: decryptPassword,
    code: 200
   });
  } catch (err) {
    helper.errorDetailsForControllers(err, "viewPassword err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.sendMailToUser = async (req, res, next) => {
  try {
    const user = await Employee.findOne({ _id: req.body.user_id });
    if (user.admin_approval == 1) {
      const passwordKey = await Key.findOne({ user_id: req.body.user_id }, {
        enc_key: 1
      });
      const decryptPassword = helper.decryptPassword(passwordKey.enc_key);

      const existingUserMailSettings = {
        subject: req.config.mailMessage.existingUser.subject,
        title: req.config.mailMessage.existingUser.title
      };

      // send mail
      await mail.send({
        user: user.email,
        subject: existingUserMailSettings.subject,
        msg: {
          email: user.email,
          password: decryptPassword,
          firstName: user.first_name ? user.first_name : user.name
        },
        filename: 'email-existing-user',
        title: existingUserMailSettings.title
      });

      return res.status(200).json({
        message: "Mail sent",
        data: [],
        code: 200
      })
    } else {
      return res.status(200).json({
        message: "This user is not approved yet!",
        data: [],
        code: 200
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "sendMailToUser err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.resetPasswordUser = async (req, res, next) => {
  try {
    const confirmPassword = generateDynamicPassword(req.config.startPasswordNumber, req.config.endPasswordNumber, req.config.randomCharacters);
    bcrypt.hash(confirmPassword, 10, async function (err, hash) {
      if (err) {
        req.flash('error', req.responseAdmin.SOMETHING_ERR);
        res.redirect('back');
        return;
      }
      const updatePassword = await Employee.findOneAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            password: hash
          }
        },
        { new: true }
      ).exec(async (err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect('back');
          return;
        }
        const encryptedPassString = helper.encryptPassword(confirmPassword);
        await Key.findOneAndUpdate(
          { user_id: req.body.user_id },
          {
            $set: {
              enc_key: encryptedPassString
            }
          }
        ).exec((err, resp) => {
          if (err) {
            req.flash('error', req.responseAdmin.SOMETHING_ERR);
            res.redirect('back');
            return;
          }
          return res.status(200).json({
            message: "Password changed",
            data: confirmPassword,
            code: 200
          })
        })
      })
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "resetPasswordUser err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.approveStatus = async (req, res, next) => {
  try {
    if (req.body.my_checkbox_value == 'true') {

      const user = await Employee.findOneAndUpdate({
        _id: req.body.id
      }, {
        $set: {
          admin_approval: 1
        }
      }, {
        new: true
      }).exec(async (err, result) => {
        if (err) {
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect('/admin/dashboard');
          return;
        }
        const password = await Key.findOne({ user_id: req.body.id });
        const decryptPassword = helper.decryptPassword(password.enc_key);

        await mail.send({
          user: result.email,
          subject: req.config.mailMessage.newUser.subject,
          msg: {
            email: result.email,
            password: decryptPassword,
            firstName: result.first_name ? result.first_name : result.name
          },
          filename: 'email-new-user',
          title: req.config.mailMessage.newUser.title
        });
        res.status(200).send({
          message: 'This user will be able to login!',
          type: 'success'
        });
        return;
      });

    } else {
      const user = await Employee.findOneAndUpdate({
        _id: req.body.id
      }, {
        $set: {
          admin_approval: 0
        }
      }, {
        new: true
      }).exec();

      res.status(200).send({
        message: 'This user will not be able to login!',
        type: 'danger'
      });
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "approveStatus err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};