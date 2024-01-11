  const mongoose = require("mongoose");
const momentZone = require('moment-timezone');
const multer = require('multer');
const XLSX = require('xlsx');
const _ = require('lodash');
const Lead = mongoose.model("Lead");
const Followup = mongoose.model("Followup");
const Center = mongoose.model("Center");
const Programcategory = mongoose.model("Programcategory");
const ViewOption = mongoose.model("ViewOption");
const Program = mongoose.model("Program");
const Country = mongoose.model("Country");
const Zone = mongoose.model("Zone");
const State = mongoose.model("State");
const City = mongoose.model("City");
const Employee = mongoose.model("Employee");
const Message = mongoose.model("Message");
const moment = require("moment");
const fs = require("fs");
const helper = require("../../handlers/helper");
const handlers = require("../../helpers");
const mail = require("../../handlers/mail");
const ObjectId = require("mongodb").ObjectId;
const { permission_name } = require('../../config/responseSetting');

const db = mongoose.connection;
const io = require('../../services/socket/');

exports.allLeads = async (req, res, next) => {
  try {
    let datas;
    let programs;
    let centersObj = [];
    // const programs = await Program.find({ status: "active" }, { program_name: 1 });
    const KnowUsCollection = mongoose.connection.db.collection("knowus");
    const knowuss = await KnowUsCollection.find({
      status: "active",
    }).toArray();
    const StatusCollection = mongoose.connection.db.collection("statuses")
    const statusess = await StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
      order: 1
    }).toArray();
    // console.log(statusess,"statusess")
    if (req.session.user && req.session.user.main && req.session.user.main == req.config.admin.main) {
      const countries = await Country.find({ status: "Active" });
      const zones = await Zone.find({ status: "active" });
      const centers = await Center.find({ status: "active" }, { school_display_name: 1 });
      programs = await Program.find({ status: "active" }, { program_name: 1 });
      datas = {
        countries,
        zones,
        centers
      };
    } else {
      // console.log(req.session.user.center_id)
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      centersObj = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      programs = await Center.aggregate([
        {
          $match:{
            status: "active"
          }
        },
        {
          $match:{
            _id:{$in: centersObj}
          }
        },{
          $lookup: {
            from: "programs",
            localField: "program_id",
            foreignField: "_id",
            as: "result"
          }
        },{
          $unwind:{
            path:"$result"
          }
        },{
          $project:{
            "program_name" :"$result.program_name",
            "_id": 0,
            "_id" :"$result._id"
          }
        }
      ])
      // console.log(programs,"programss")
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

    const permissionEditLead = handlers.checkPermission(req.session.user, req.permissionCacheData, "LeadEdit");
    const permissionAddFollowUp = handlers.checkPermission(req.session.user, req.permissionCacheData, "FollowUpAdd");
    const permissionTransferLead = handlers.checkPermission(req.session.user, req.permissionCacheData, "LeadTransfer");

    return res.render("admin/all-lead", {
      title: "All leads",
      data: datas,
      user_type: req.session.user && req.session.user.main ? 1 : 0,
      programs,
      knowuss,
      statusess,
      permissionEditLead,
      permissionAddFollowUp,
      permissionTransferLead,
      centersObj: centersObj || []
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "allLeads not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.getAddLead = async (req, res, next) => {
  try {
    if(req.session.user.main &&  req.session.user.main == req.config.admin.main){
      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      const StatusCollection = mongoose.connection.db.collection("statuses");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();

      const programs = await Program.find({ status: req.responseAdmin.ACTIVE });
      // const Employees = await Employee.find({_id:req.session.user._id  })
      // const employees = await Employee.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectId(req.session.user._id),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "viewoptions",
      //       localField: "view_option",
      //       foreignField: "_id",
      //       // 'pipeline': [{'$sort': {"order": -1}}],
      //       as: "viewoption",
      //     },
      //   },
      //   {
      //     $unwind: "$viewoption",
      //   },
      //   {
      //     $lookup: {
      //       from: "countries",
      //       localField: "viewoption.countries",
      //       foreignField: "_id",
      //       // 'pipeline': [{'$sort': {"order": -1}}],
      //       as: "countries",
      //     },
      //   },
      //   {
      //     $unwind: "$countries",
      //   },
      //   {
      //     $project: {
      //       _id: "$countries._id",
      //       country_name: "$countries.country_name",
      //       country_id:"$countries.country_id"
      //     },
      //   },
      // ]);
      const employees = await Country.find({ status: 'Active' });
      // const viewOption = await ViewOption.findOne({_id:req.session.user.view_option})
      // console.log(viewOption,"viewoption")

      const centers = await Center.find({ status: "active" });

      const statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
        order: 1
      }).toArray();
      const ActionCollection =
        mongoose.connection.db.collection("actionplanneds");
        const actionPromise = await ActionCollection
          .find({
            status: "active",
          })
          .sort({
            order: 1
          })
          .toArray();
      // console.log(employees, "Employees");
      // console.log(req.session.user._id, "req.session.user._id ");
      const [statuses, knowuss, actions] = await Promise.all([
        statusesPromise,
        knowussPromises,
        actionPromise,
      ]);
      // console.log(statuses,"stacenterstus")
      return res.render("admin/add-lead", {
        title: "Add Lead",
        programs,
        knowuss,
        statuses,
        actions,
        centers,
        employees,
        type: "super_admin",
      });
    } else {

      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      const StatusCollection = mongoose.connection.db.collection("statuses");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();

      const programs = await Program.find({ status: req.responseAdmin.ACTIVE });
      // const Employees = await Employee.find({_id:req.session.user._id  })
      const employees = await Employee.aggregate([
        {
          $match: {
            _id: ObjectId(req.session.user._id),
          },
        },
        {
          $lookup: {
            from: "viewoptions",
            localField: "view_option",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "viewoption",
          },
        },
        {
          $unwind: "$viewoption",
        },
        {
          $lookup: {
            from: "countries",
            localField: "viewoption.countries",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "countries",
          },
        },
        {
          $unwind: "$countries",
        },
        {
          $project: {
            _id: "$countries._id",
            country_name: "$countries.country_name",
            country_id: "$countries.country_id",
          },
        },
      ]);
      const viewOption = await ViewOption.findOne({
        _id: req.session.user.view_option,
      });
      // console.log(viewOption.centers,"viewoption")

      const centers = await Center.find({ _id: { $in: viewOption.centers }, status: "active" });
      // console.log(centers.length,"centers")

      const statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]}}).sort({
        order: 1
      }).toArray();
      const ActionCollection =
        mongoose.connection.db.collection("actionplanneds");
      const actionPromise = await ActionCollection.find({
        status: "active",
      }).sort({
        order: 1
      }).toArray();
      // console.log(employees, "Employees");
      // console.log(req.session.user._id, "req.session.user._id ");
      const [statuses, knowuss, actions] = await Promise.all([
        statusesPromise,
        knowussPromises,
        actionPromise,
      ]);
      return res.render("admin/add-lead", {
        title: "Add Lead",
        programs,
        knowuss,
        statuses,
        actions,
        centers,
        employees,
        type: "non_admin",
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getAddLead not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

// exports.postAddLead = async (req, res, next) => {
//   try {
//     // console.log(req.session.user);
//     const randomNumber = Math.floor(100000 + Math.random() * 900000);

//     const newLead = new Lead({
//       lead_date: new Date(`${moment().format("YYYY")}-${moment().format("MM")}-${moment().format("DD")} 00:00:00.000`),
//       lead_no: `LD${randomNumber}`,
//       child_first_name: req.body.child_first_name,
//       child_last_name: req.body.child_last_name,
//       child_gender: req.body.child_gender,
//       child_dob: new Date(`${req.body.child_dob.split("/")[0]}-${req.body.child_dob.split("/")[1]}-${req.body.child_dob.split("/")[2]} 00:00:00.000`),
//       center_id: req.body.center_id,
//       child_course_id: req.body.child_course_id,
//       parent_name: req.body.parent_name,
//       parent_contact_no: req.body.parent_contact_no,
//       parent_contact_no_another: req.body.parent_contact_no_another,
//       parent_email: req.body.parent_email,
//       state: req.body.state.split("|")[1],
//       city: req.body.city,
//       area_locality: req.body.area_locality,
//       pincode: req.body.pincode,
//       lead_category: req.body.lead_category,
//       know_about_us: req.body.know_about_us,
//       follow_ups_id: []
//     })

//     await newLead.save(async (err, result) => {
//       if (err) {
//         req.flash('error', 'Something went wrong!');
//         res.redirect('/admin/lead/all');
//         return;
//       }
//       const newFollowUp = new Followup({
//         follow_status: req.body.follow_status.split("|")[1],
//         follow_sub_status: req.body.follow_sub_status,
//         action_taken: req.body.action_taken,
//         enq_stage: req.body.enq_stage,
//         notes: req.body.notes,
//         follow_up_date: new Date(`${req.body.follow_up_date.split("/")[0]}-${req.body.follow_up_date.split("/")[1]}-${req.body.follow_up_date.split("/")[2]} 00:00:00.000`),
//         follow_up_time: req.body.follow_up_time,
//         remark: req.body.remark,
//         updatedBy_name: req.session.user.name,
//         updatedBy: req.session.user._id,
//         lead_id: newLead._id
//       });

//       await newFollowUp.save(async (err, result) => {
//         if (err) {
//           req.flash('error', 'Something went wrong!');
//           res.redirect('/admin/lead/all');
//           return;
//         }
//         const lead = await Lead.findOne({ _id: newLead._id });
//         lead.follow_ups_id = [newFollowUp._id]
//         await lead.save();
//         req.flash('success', 'New lead added successfully!');
//         res.redirect('/admin/lead/all');
//         return;
//       })
//     });

//     return;
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "postAddLead not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

// exports.postAddLeadd = async (req, res, next) => {
//   try {
//     // console.log(req.body, "lead");
//     // console.log(req.session.user.view_option, "view_option");
//     // return;
//     const randomNumber = Math.floor(100000 + Math.random() * 900000);
//     if (req.session.user.main && req.session.user.main == req.config.admin.main) {
//       console.log('Super admin hai');
//       if (req.body.sibling == "on") {
//         console.log('siblings hai');

//         let whatsapp_number;
//         let parent_second_whatsapp;
//         let parent_first_whatsapp;
//         if (req.body.whatsapp_first == "on") {
//           whatsapp_number = req.body.parent_first_contact;
//           parent_second_whatsapp = 0;
//           parent_first_whatsapp = 1;
//         } else if (req.body.whatsapp_second == "on") {
//           whatsapp_number = req.body.parent_second_contact;
//           parent_second_whatsapp = 1;
//           parent_first_whatsapp = 0;
//         }

//         const timeZone = momentZone.tz.guess();
//         // console.log(timeZone);
//         const dateByTimeZone = momentZone.tz(Date.now(), timeZone);

//         const newLead = new Lead({
//           lead_date: new Date(
//             `${moment().format("YYYY")}-${moment().format(
//               "MM"
//             )}-${moment().format("DD")} 00:00:00.000`
//           ),
//           lead_no: `LD${randomNumber}`,
//           child_first_name: req.body.child_first_name,
//           child_dob: req.body.child_dob,
//           child_last_name: req.body.child_last_name,
//           child_gender: req.body.child_gender,
//           programcategory_id: req.body.programcategory_id,
//           program_id: req.body.program_id ? req.body.program_id : null,
//           school_id: req.body.school_id,
//           zone_id: zone.zone_id,
//           viewoption: req.session.user.view_option,
//           primary_parent: req.body.primary_parent,
//           parent_name: req.body.parent_name,
//           parent_first_contact: req.body.parent_first_contact,
//           parent_second_contact: req.body.parent_second_contact,
//           parent_email: req.body.parent_email,
//           parent_country: req.body.parent_country.split("|")[1]
//             ? req.body.parent_country.split("|")[1]
//             : null,
//           parent_state: req.body.parent_state.split("|")[1]
//             ? req.body.parent_state.split("|")[1]
//             : null,
//           parent_pincode: req.body.parent_pincode,
//           parent_area: req.body.parent_area,
//           parent_city: req.body.parent_city.split("|")[1]
//             ? req.body.parent_city.split("|")[1]
//             : null,
//           parent_know_aboutus: req.body.parent_know_aboutus
//             ? req.body.parent_know_aboutus
//             : [],
//           parent_whatsapp: whatsapp_number,
//           parent_second_whatsapp: parent_second_whatsapp,
//           parent_first_whatsapp: parent_first_whatsapp,
//           source_category: req.body.source_category,
//           status_id: req.body.status_id,
//           substatus_id: req.body.substatus_id,
//           stage: req.body.stage,
//           remark: req.body.remark,
//           viewoption: req.session.user.view_option,
//           action_taken: req.body.action_taken ? req.body.action_taken : [],
//           type: req.body.lead_type,
//         });
//         await newLead.save();
//         // console.log(req.body.adminCheck, "check");
//         if (req.body.adminCheck == 1) {
//           // console.log("admin sibling");
//           const lead = await Lead.findOne({
//             parent_name: req.body.parent_name,
//             lead_no: `LD${randomNumber}`,
//           });
//           const KnowUsCollection = mongoose.connection.db.collection("knowus");
//           const StatusCollection = mongoose.connection.db.collection("statuses");
//           const SubstatusCollection =
//             mongoose.connection.db.collection("substatuses");
//           const knowussPromises = KnowUsCollection.find({
//             status: "active",
//           }).toArray();
//           const programcategorys = await Programcategory.find({
//             status: req.responseAdmin.ACTIVE,
//           });
//           const programs = await Program.find({
//             status: req.responseAdmin.ACTIVE,
//           });
//           const statusesPromise = StatusCollection.find().toArray();
//           const substatusesPromise = SubstatusCollection.find().toArray();
//           const ActionCollection =
//             mongoose.connection.db.collection("actionplanneds");
//           const actionPromise = await ActionCollection.find({
//             status: "active",
//           }).toArray();
//           // const centers = await Center.find({ status: req.responseAdmin.ACTIVE });
//           // const viewOption = await ViewOption.findOne({_id:req.session.user.view_option})
//           // console.log(viewOption.centers,"viewoption")

//           // const centers = await Center.find({_id:{$in:[viewOption.centers]}});
//           const centers = await Center.find({ status: req.responseAdmin.ACTIVE });
//           // console.log(centers, "centers");

//           // const employees = await Employee.aggregate([
//           //   {
//           //     $match: {
//           //       _id: ObjectId(req.session.user._id),
//           //     },
//           //   },
//           //   {
//           //     $lookup: {
//           //       from: "viewoptions",
//           //       localField: "view_option",
//           //       foreignField: "_id",
//           //       // 'pipeline': [{'$sort': {"order": -1}}],
//           //       as: "viewoption",
//           //     },
//           //   },
//           //   {
//           //     $unwind: "$viewoption",
//           //   },
//           //   {
//           //     $lookup: {
//           //       from: "countries",
//           //       localField: "viewoption.countries",
//           //       foreignField: "_id",
//           //       // 'pipeline': [{'$sort': {"order": -1}}],
//           //       as: "countries",
//           //     },
//           //   },
//           //   {
//           //     $unwind: "$countries",
//           //   },
//           //   {
//           //     $project: {
//           //       _id: "$countries._id",
//           //       country_name: "$countries.country_name",
//           //       country_id:"$countries.country_id"
//           //     },
//           //   },
//           // ]);
//           const employees = await Country.find({ status: 'Active' });
//           // console.log(employees,"employee")
//           const country_ids = await Country.findOne({ _id: lead.parent_country });
//           // let country_ids
//           // employees.forEach((ele) => {
//           //   country_ids = ele.country_id
//           // })
//           // console.log(country_ids, "country_id");
//           const states = await State.aggregate([
//             {
//               $match: {
//                 country_id: country_ids
//                   ? country_ids.country_id
//                   : { $exists: false },
//               },
//             },
//           ]);
//           // console.log(states,states)
//           const citys = await City.aggregate([
//             {
//               $match: {
//                 country_id: country_ids
//                   ? country_ids.country_id
//                   : { $exists: false },
//               },
//             },
//           ]);
//           // console.log(citys,citys)
//           // console.log(employees,"employees")
//           const [statuses, knowuss, substatuses, actions] = await Promise.all([
//             statusesPromise,
//             knowussPromises,
//             substatusesPromise,
//             actionPromise,
//           ]);
//           // console.log(lead,"leads")
//           return res.render("admin/add-sibling", {
//             title: "Add Sibling",
//             lead,
//             programcategorys,
//             programs,
//             knowuss,
//             statuses,
//             substatuses,
//             moment,
//             actions,
//             centers,
//             states,
//             citys,
//             employees,
//             type : "super_admin"
//           });
//         } else {
//           const lead = await Lead.findOne({
//             parent_name: req.body.parent_name,
//             lead_no: `LD${randomNumber}`,
//           });
//           const KnowUsCollection = mongoose.connection.db.collection("knowus");
//           const StatusCollection = mongoose.connection.db.collection("statuses");
//           const SubstatusCollection =
//             mongoose.connection.db.collection("substatuses");
//           const knowussPromises = KnowUsCollection.find({
//             status: "active",
//           }).toArray();
//           const programcategorys = await Programcategory.find({
//             status: req.responseAdmin.ACTIVE,
//           });
//           const programs = await Program.find({
//             status: req.responseAdmin.ACTIVE,
//           });
//           const statusesPromise = StatusCollection.find().toArray();
//           const substatusesPromise = SubstatusCollection.find().toArray();
//           const ActionCollection =
//             mongoose.connection.db.collection("actionplanneds");
//           const actionPromise = await ActionCollection.find({
//             status: "active",
//           }).toArray();
//           // const centers = await Center.find({ status: req.responseAdmin.ACTIVE });
//           const viewOption = await ViewOption.findOne({
//             _id: req.session.user.view_option,
//           });
//           // console.log(viewOption.centers, "viewoption");

//           const centers = await Center.find({
//             _id: { $in: [viewOption.centers] },
//           });

//           const employees = await Employee.aggregate([
//             {
//               $match: {
//                 _id: ObjectId(req.session.user._id),
//               },
//             },
//             {
//               $lookup: {
//                 from: "viewoptions",
//                 localField: "view_option",
//                 foreignField: "_id",
//                 // 'pipeline': [{'$sort': {"order": -1}}],
//                 as: "viewoption",
//               },
//             },
//             {
//               $unwind: "$viewoption",
//             },
//             {
//               $lookup: {
//                 from: "countries",
//                 localField: "viewoption.countries",
//                 foreignField: "_id",
//                 // 'pipeline': [{'$sort': {"order": -1}}],
//                 as: "countries",
//               },
//             },
//             {
//               $unwind: "$countries",
//             },
//             {
//               $project: {
//                 _id: "$countries._id",
//                 country_name: "$countries.country_name",
//                 country_id: "$countries.country_id",
//               },
//             },
//           ]);
//           // console.log(employees,"employee")
//           let country_ids;
//           employees.forEach((ele) => {
//             country_ids = ele.country_id;
//           });
//           // console.log(country_ids,"country_id")
//           const states = await State.aggregate([
//             {
//               $match: {
//                 country_id: country_ids,
//               },
//             },
//           ]);
//           // console.log(states,states)
//           const citys = await City.aggregate([
//             {
//               $match: {
//                 country_id: country_ids,
//               },
//             },
//           ]);
//           // console.log(citys,citys)
//           // console.log(employees,"employees")
//           const [statuses, knowuss, substatuses, actions] = await Promise.all([
//             statusesPromise,
//             knowussPromises,
//             substatusesPromise,
//             actionPromise,
//           ]);
//           // console.log(lead,"leads")
//           return res.render("admin/add-sibling", {
//             title: "Add Sibling",
//             lead,
//             programcategorys,
//             programs,
//             knowuss,
//             statuses,
//             substatuses,
//             moment,
//             actions,
//             centers,
//             states,
//             citys,
//             employees,
//             type : "non_admin"
//           });
//         }
//       } else {
//         console.log('no sibling');

//         let whatsapp_number;
//         let parent_second_whatsapp;
//         let parent_first_whatsapp;
//         if (req.body.whatsapp_first == "on") {
//           whatsapp_number = req.body.parent_first_contact;
//           parent_second_whatsapp = 0;
//           parent_first_whatsapp = 1;
//         } else if (req.body.whatsapp_second == "on") {
//           whatsapp_number = req.body.parent_second_contact;
//           parent_second_whatsapp = 1;
//           parent_first_whatsapp = 0;
//         }

//         const newLead = new Lead({
//           lead_date: new Date(
//             `${moment().format("YYYY")}-${moment().format(
//               "MM"
//             )}-${moment().format("DD")} 00:00:00.000`
//           ),
//           lead_no: `LD${randomNumber}`,
//           child_first_name: req.body.child_first_name,
//           child_dob: req.body.child_dob,
//           child_last_name: req.body.child_last_name,
//           child_gender: req.body.child_gender,
//           programcategory_id: req.body.programcategory_id,
//           program_id: req.body.program_id ? req.body.program_id : null,
//           primary_parent: req.body.primary_parent,
//           parent_name: req.body.parent_name,
//           school_id: req.body.school_id,
//           viewoption: req.session.user.view_option,
//           parent_first_contact: req.body.parent_first_contact,
//           parent_second_contact: req.body.parent_second_contact,
//           parent_email: req.body.parent_email,
//           parent_country: req.body.parent_country.split("|")[1]
//             ? req.body.parent_country.split("|")[1]
//             : null,
//           parent_state: req.body.parent_state.split("|")[1]
//             ? req.body.parent_state.split("|")[1]
//             : null,
//           parent_pincode: req.body.parent_pincode,
//           parent_area: req.body.parent_area,
//           parent_city: req.body.parent_city.split("|")[1]
//             ? req.body.parent_city.split("|")[1]
//             : null,
//           parent_know_aboutus: req.body.parent_know_aboutus
//             ? req.body.parent_know_aboutus
//             : [],
//           parent_whatsapp: whatsapp_number,
//           parent_second_whatsapp: parent_second_whatsapp,
//           parent_first_whatsapp: parent_first_whatsapp,
//           source_category: req.body.source_category,
//           status_id: req.body.status_id,
//           substatus_id: req.body.substatus_id,
//           stage: req.body.stage,
//           remark: req.body.remark,
//           action_taken: req.body.action_taken ? req.body.action_taken : [],
//           type: req.body.lead_type,
//         });
//         await newLead.save();
//         await mail.send({
//           user: req.body.parent_email,
//           subject: "Thank You Email",
//           msg: {},
//           filename: "email-welcome-lead",
//           title: "Thank You Email",
//         });
//         if (req.body.stage === "Tour Booked") {
//           await mail.send({
//             user: req.body.parent_email,
//             subject: "Tour Mail",
//             msg: {},
//             filename: "email-welcome-lead",
//             title: "Tour Mail",
//           });
//         }
//         if (req.body.stage === "Post Tour") {
//           await mail.send({
//             user: req.body.parent_email,
//             subject: "Post Tour",
//             msg: {},
//             filename: "email-welcome-lead",
//             title: "Post Tour",
//           });
//         }
//         req.flash("success", "New lead added");
//         res.redirect("/admin/lead/all");
//         return;
//       }
//     } else {
//       console.log('normal user hai');
//     }
//   } catch (err) {
//     helper.errorDetailsForControllers(
//       err,
//       "postAddLead not working - post request",
//       req.originalUrl,
//       req.body,
//       {},
//       "redirect",
//       __filename
//     );
//     next(err);
//     return;
//   }
// };

exports.postAddLead = async (req, res, next) => {
  try {
    // console.log(req.body,"req.boyddd");
    // return;
    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    const zone = await Center.findOne({ _id: req.body.school_id });

    if (req.body.lead_type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;
      if (req.body.secondary_first_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_second_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // console.log('Super admin hai');
      if (req.body.sibling == "on") {
        // console.log('siblings hai');

        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }

        const timeZone = momentZone.tz.guess();
        const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          viewoption: req.session.user.view_option,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 1,
          is_related: null,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        const lead = await Lead.findOne({
          _id: newLead._id
        });
        const KnowUsCollection = mongoose.connection.db.collection("knowus");
        const StatusCollection = mongoose.connection.db.collection("statuses");
        const SubstatusCollection =
          mongoose.connection.db.collection("substatuses");
        const knowussPromises = KnowUsCollection.find({
          status: "active",
        }).toArray();
        const programcategorys = await Programcategory.find({
          status: req.responseAdmin.ACTIVE,
        });
        const programs = await Program.find({
          status: req.responseAdmin.ACTIVE,
        });
        const statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
          order: 1
        }).toArray();
        const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).toArray();
        const ActionCollection =
          mongoose.connection.db.collection("actionplanneds");
        const actionPromise = await ActionCollection.find({
          status: "active",
        }).sort({
          order: 1
        }).toArray();
        // const centers = await Center.find({ status: req.responseAdmin.ACTIVE });
        // const viewOption = await ViewOption.findOne({_id:req.session.user.view_option})
        // console.log(viewOption.centers,"viewoption")

        // const centers = await Center.find({_id:{$in:[viewOption.centers]}});
        const centers = await Center.find({ status: "active" });
        // console.log(centers, "centers");

        // const employees = await Employee.aggregate([
        //   {
        //     $match: {
        //       _id: ObjectId(req.session.user._id),
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "viewoptions",
        //       localField: "view_option",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "viewoption",
        //     },
        //   },
        //   {
        //     $unwind: "$viewoption",
        //   },
        //   {
        //     $lookup: {
        //       from: "countries",
        //       localField: "viewoption.countries",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "countries",
        //     },
        //   },
        //   {
        //     $unwind: "$countries",
        //   },
        //   {
        //     $project: {
        //       _id: "$countries._id",
        //       country_name: "$countries.country_name",
        //       country_id:"$countries.country_id"
        //     },
        //   },
        // ]);
        const employees = await Country.find({ status: 'Active' });
        // console.log(employees,"employee")
        const country_ids = await Country.findOne({ _id: lead.parent_country });
        // let country_ids
        // employees.forEach((ele) => {
        //   country_ids = ele.country_id
        // })
        // console.log(country_ids, "country_id");
        const states = await State.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        // console.log(states,states)
        const citys = await City.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        // console.log(citys,citys)
        // console.log(employees,"employees")
        const [statuses, knowuss, substatuses, actions] = await Promise.all([
          statusesPromise,
          knowussPromises,
          substatusesPromise,
          actionPromise,
        ]);
        // console.log(lead,"leads")

        return res.render("admin/add-sibling", {
          title: "Add Sibling",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          states,
          citys,
          employees,
          oldLead: newLead,
          type : "super_admin"
        });
      } else {
        // console.log('no sibling');

        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }

        const timeZone = momentZone.tz.guess();
        const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          stage: req.body.stage,
          remark: req.body.remark,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 0,
          is_related: null,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        // await mail.send({
        //   user: req.body.parent_email,
        //   subject: `Welcome - ${zone.school_display_name}`,
        //   msg: {
        //     lead_name: req.body.parent_name || "",
        //     center_name: zone.school_display_name || "",
        //     center_area: zone.area || "",
        //     sal: zone.cor_sal || "",
        //     spoc: zone.cor_spoc || "",
        //     email: zone.email_id || "",
        //     whatsapp: zone.whatsapp_number,
        //     contact: zone.contact_number || "",
        //     video: zone.center_video_url || "",
        //     website: zone.website_url || "",
        //     designation: zone.designation || "",
        //     activities: zone.activities_portal || "",
        //     address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
        //   },
        //   filename: "email-welcome-lead",
        //   title: `Welcome - ${zone.school_display_name}`,
        // });
        if (req.body.lead_type == "lead") {
          // send mail for type lead
          await mail.send({
            user: req.body.parent_email,
            subject: `Welcome to Kido International Preschool & Daycare`,
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              activities: zone.activities_portal || "",
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-welcome-lead",
            title: `KIDO India`,
          });
        }
        if (req.body.stage == "Post Tour") {
          // if stage in Post Tour, the send mail
          // mail sent
          await mail.send({
            user: req.body.parent_email,
            subject: "Thank you for visiting Kido International Preschool & Daycare",
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time,
              activities: zone.activities_portal || "",
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-post-tour-lead",
            title: "KIDO India",
          });
        }
        req.flash("success", "New lead recorded in our system.");
        res.redirect("/admin/lead/all");
        return;
      }
    } else {
      // console.log('normal user hai');
      if (req.body.sibling == "on") {
        // console.log('siblings hai');

        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }

        const timeZone = momentZone.tz.guess();
        const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          viewoption: req.session.user.view_option,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 1,
          is_related: null,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        const lead = await Lead.findOne({
          _id: newLead._id
        });
        const KnowUsCollection = mongoose.connection.db.collection("knowus");
        const StatusCollection = mongoose.connection.db.collection("statuses");
        const SubstatusCollection =
          mongoose.connection.db.collection("substatuses");
        const knowussPromises = KnowUsCollection.find({
          status: "active",
        }).toArray();
        const programcategorys = await Programcategory.find({
          status: req.responseAdmin.ACTIVE,
        });
        const programs = await Program.find({
          status: req.responseAdmin.ACTIVE,
        });
        const statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
          order: 1
        }).toArray();
        const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).toArray();
        const ActionCollection =
          mongoose.connection.db.collection("actionplanneds");
        const actionPromise = await ActionCollection.find({
          status: "active",
        }).sort({
          order: 1
        }).toArray();
        // const centers = await Center.find({ status: req.responseAdmin.ACTIVE });
        // const viewOption = await ViewOption.findOne({_id:req.session.user.view_option})
        // console.log(viewOption.centers,"viewoption")
        // console.log(centers, "centers");

        // const employees = await Employee.aggregate([
        //   {
        //     $match: {
        //       _id: ObjectId(req.session.user._id),
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "viewoptions",
        //       localField: "view_option",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "viewoption",
        //     },
        //   },
        //   {
        //     $unwind: "$viewoption",
        //   },
        //   {
        //     $lookup: {
        //       from: "countries",
        //       localField: "viewoption.countries",
        //       foreignField: "_id",
        //       // 'pipeline': [{'$sort': {"order": -1}}],
        //       as: "countries",
        //     },
        //   },
        //   {
        //     $unwind: "$countries",
        //   },
        //   {
        //     $project: {
        //       _id: "$countries._id",
        //       country_name: "$countries.country_name",
        //       country_id:"$countries.country_id"
        //     },
        //   },
        // ]);
        const employees = await Employee.aggregate([
          {
            $match: {
              _id: ObjectId(req.session.user._id),
            },
          },
          {
            $lookup: {
              from: "viewoptions",
              localField: "view_option",
              foreignField: "_id",
              // 'pipeline': [{'$sort': {"order": -1}}],
              as: "viewoption",
            },
          },
          {
            $unwind: "$viewoption",
          },
          {
            $lookup: {
              from: "countries",
              localField: "viewoption.countries",
              foreignField: "_id",
              // 'pipeline': [{'$sort': {"order": -1}}],
              as: "countries",
            },
          },
          {
            $unwind: "$countries",
          },
          {
            $project: {
              _id: "$countries._id",
              country_name: "$countries.country_name",
              country_id: "$countries.country_id",
            },
          },
        ]);
        const viewOption = await ViewOption.findOne({
          _id: req.session.user.view_option,
        });
        // console.log(viewOption.centers,"viewoption")

        const centers = await Center.find({
          _id: { $in: viewOption.centers },
          status: "active"
        });
        // console.log(employees,"employee")
        const country_ids = await Country.findOne({ _id: lead.parent_country });
        // let country_ids
        // employees.forEach((ele) => {
        //   country_ids = ele.country_id
        // })
        // console.log(country_ids, "country_id");
        const states = await State.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        // console.log(states,states)
        const citys = await City.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        // console.log(citys,citys)
        // console.log(employees,"employees")
        const [statuses, knowuss, substatuses, actions] = await Promise.all([
          statusesPromise,
          knowussPromises,
          substatusesPromise,
          actionPromise,
        ]);
        // console.log(lead,"leads")
        return res.render("admin/add-sibling", {
          title: "Add Sibling",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          states,
          citys,
          employees,
          oldLead: newLead,
          type : "non_admin"
        });
      } else {
        // console.log('no sibling');

        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }

        const timeZone = momentZone.tz.guess();
        const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 0,
          is_related: null,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        // await mail.send({
        //   user: req.body.parent_email,
        //   subject: `Welcome - ${zone.school_display_name}`,
        //   msg: {
        //     lead_name: req.body.parent_name || "",
        //     center_name: zone.school_display_name || "",
        //     center_area: zone.area || "",
        //     sal: zone.cor_sal || "",
        //     spoc: zone.cor_spoc || "",
        //     email: zone.email_id || "",
        //     whatsapp: zone.whatsapp_number,
        //     contact: zone.contact_number || "",
        //     video: zone.center_video_url || "",
        //     website: zone.website_url || "",
        //     designation: zone.designation || "",
        //     mon_fir_start: zone.mon_to_fri_start_time,
        //     mon_fir_end: zone.mon_to_fri_end_time,
        //     sat_start: zone.saturday_start_time,
        //     sat_end: zone.saturday_end_time,
        //     activities: zone.activities_portal || "",
        //     address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
        //   },
        //   filename: "email-welcome-lead",
        //   title: `Welcome - ${zone.school_display_name}`,
        // });
        if (req.body.lead_type == "lead") {
          // send mail for type lead
          await mail.send({
            user: req.body.parent_email,
            subject: `Welcome to Kido International Preschool & Daycare`,
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              activities: zone.activities_portal || "",
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-welcome-lead",
            title: `KIDO India`,
          });
        }
        if (req.body.stage == "Post Tour") {
          // if stage in Post Tour, the send mail
          // mail sent
          await mail.send({
            user: req.body.parent_email,
            subject: "Thank you for visiting Kido International Preschool & Daycare",
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time,
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-post-tour-lead",
            title: "KIDO India",
          });
        }
        req.flash("success", "New lead recorded in our system.");
        res.redirect("/admin/lead/all");
        return;
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postAddLead not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.postAddSiblingLead = async (req, res, next) => {
  try {
    const oldLead = await Lead.findOne({ _id: req.body.sibling_id });
    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    if (req.body.lead_type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;

      if (req.body.secondary_first_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_Second_contact == "on") {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    const zone = await Center.findOne({ _id: req.body.school_id });

    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // console.log('super admin');

      let whatsapp_number;
      let parent_second_whatsapp;
      let parent_first_whatsapp;
      if (req.body.whatsapp_first == "on") {
        whatsapp_number = req.body.parent_first_contact;
        parent_second_whatsapp = 0;
        parent_first_whatsapp = 1;
      } else if (req.body.whatsapp_second == "on") {
        whatsapp_number = req.body.parent_second_contact;
        parent_second_whatsapp = 1;
        parent_first_whatsapp = 0;
      }

      const timeZone = momentZone.tz.guess();
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
      const latestLeadCount = await helper.leadCounter();
      const newLead = new Lead({
        lead_date: dateByTimeZone,
        lead_no: latestLeadCount,
        child_first_name: req.body.child_first_name,
        child_dob: req.body.child_dob,
        child_last_name: req.body.child_last_name,
        child_gender: req.body.child_gender,
        child_pre_school: childPre,
        updatedBy_name: req.session.user.name,
        createdBy_name:  req.session.user.name,
        programcategory_id: req.body.programcategory_id,
        program_id: req.body.program_id ? req.body.program_id : null,
        school_id: req.body.school_id,
        zone_id: zone.zone_id,
        country_id: zone.country_id,
        viewoption: req.session.user.view_option,
        primary_parent: req.body.primary_parent,
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: req.body.parent_second_contact,
        parent_email: req.body.parent_email,
        parent_education: req.body.parent_education,
        parent_profession: req.body.parent_profession,
        parent_reference: req.body.parent_reference,
        secondary_parent_name: secParentName,
        secondary_parent_type: req.body.secondary_parent_type || "",
        secondary_first_contact: req.body.secondary_first_contact || "",
        secondary_Second_contact: req.body.secondary_Second_contact || "",
        secondary_second_whatsapp: sec_parent_second_whatsapp,
        secondary_first_whatsapp: sec_parent_first_whatsapp,
        secondary_whatsapp: sec_whatsapp_number,
        secondary_email: req.body.secondary_email || "",
        secondary_education: req.body.secondary_education || "",
        secondary_profession: req.body.secondary_profession || "",
        parent_landmark: req.body.parent_landmark || "",
        parent_house: req.body.parent_house || "",
        parent_street: req.body.parent_street || "",
        parent_address: req.body.parent_address || "",
        parent_country: req.body.parent_country.split("|")[1]
          ? req.body.parent_country.split("|")[1]
          : null,
        parent_state: req.body.parent_state.split("|")[1]
          ? req.body.parent_state.split("|")[1]
          : null,
        parent_pincode: req.body.parent_pincode,
        parent_area: req.body.parent_area,
        parent_city: req.body.parent_city.split("|")[1]
          ? req.body.parent_city.split("|")[1]
          : null,
        parent_know_aboutus: req.body.parent_know_aboutus
          ? req.body.parent_know_aboutus
          : [],
        parent_whatsapp: whatsapp_number,
        parent_second_whatsapp: parent_second_whatsapp,
        parent_first_whatsapp: parent_first_whatsapp,
        source_category: req.body.source_category,
        status_id: req.body.status_id,
        substatus_id: req.body.substatus_id,
        stage: req.body.stage,
        remark: req.body.remark,
        viewoption: req.session.user.view_option,
        action_taken: req.body.action_taken ? req.body.action_taken : [],
        type: req.body.lead_type,
        initial_status: req.body.status_id,
        initial_sub_status: req.body.substatus_id,
        initial_action: req.body.action_taken ? req.body.action_taken : [],
        initial_notes: req.body.remark,
        initial_stage: req.body.stage,
        enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
        follow_due_date: dateByTimeZone,
        follow_due_time : "",
        is_external: 0,
        external_source: "",
        sibling: 1,
        is_related: oldLead._id,
        cor_parent: req.body.cor_parent,
        company_name_parent: req.body.company_name_parent,
        do_followup: 1
      });
      await newLead.save();
      oldLead.sibling = 1;
      oldLead.is_related = newLead._id;
      await oldLead.save();
      if (req.body.lead_type == "lead") {
        // send mail for type lead
        await mail.send({
          user: req.body.parent_email,
          subject: `Welcome to Kido International Preschool & Daycare`,
          msg: {
            lead_name: req.body.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            activities: zone.activities_portal || "",
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-welcome-lead",
          title: `KIDO India`,
        });
      }
      // await mail.send({
      //   user: req.body.parent_email,
      //   subject: `Welcome to Kido International Preschool & Daycare`,
      //   msg: {
      //     lead_name: req.body.parent_name || "",
      //     center_name: zone.school_display_name || "",
      //     center_main_name: zone.school_name || "",
      //     center_area: zone.area || "",
      //     sal: zone.cor_sal || "",
      //     spoc: zone.cor_spoc || "",
      //     email: zone.email_id || "",
      //     whatsapp: zone.whatsapp_number,
      //     contact: zone.contact_number || "",
      //     video: zone.center_video_url || "",
      //     website: zone.website_url || "",
      //     designation: zone.designation || "",
      //     entity_name: zone.cor_entity_name || "",
      //     mon_fir_start: zone.mon_to_fri_start_time,
      //     mon_fir_end: zone.mon_to_fri_end_time,
      //     sat_start: zone.saturday_start_time,
      //     sat_end: zone.saturday_end_time,
      //     activities: zone.activities_portal || "",
      //     address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
      //   },
      //   filename: "email-welcome-lead",
      //   title: `KIDO India`,
      // });

      if (req.body.stage == "Post Tour") {
        // if stage in Post Tour, the send mail
        // mail sent
        await mail.send({
          user: req.body.parent_email,
          subject: "Thank you for visiting Kido International Preschool & Daycare",
          msg: {
            lead_name: req.body.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-post-tour-lead",
          title: "KIDO India",
        });
      }
      req.flash("success", "New lead recorded in our system.");
      res.redirect("/admin/lead/all");
      return;
    } else {
      // console.log('normal user');

      let whatsapp_number;
      let parent_second_whatsapp;
      let parent_first_whatsapp;
      if (req.body.whatsapp_first == "on") {
        whatsapp_number = req.body.parent_first_contact;
        parent_second_whatsapp = 0;
        parent_first_whatsapp = 1;
      } else if (req.body.whatsapp_second == "on") {
        whatsapp_number = req.body.parent_second_contact;
        parent_second_whatsapp = 1;
        parent_first_whatsapp = 0;
      }

      const timeZone = momentZone.tz.guess();
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
      const latestLeadCount = await helper.leadCounter();
      const newLead = new Lead({
        lead_date: dateByTimeZone,
        lead_no: latestLeadCount,
        child_first_name: req.body.child_first_name,
        child_dob: req.body.child_dob,
        child_last_name: req.body.child_last_name,
        child_gender: req.body.child_gender,
        child_pre_school: childPre,
        programcategory_id: req.body.programcategory_id,
        program_id: req.body.program_id ? req.body.program_id : null,
        school_id: req.body.school_id,
        zone_id: zone.zone_id,
        country_id: zone.country_id,
        viewoption: req.session.user.view_option,
        primary_parent: req.body.primary_parent,
        updatedBy_name: req.session.user.name,
        createdBy_name:  req.session.user.name,
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: req.body.parent_second_contact,
        parent_email: req.body.parent_email,
        parent_education: req.body.parent_education,
        parent_profession: req.body.parent_profession,
        parent_reference: req.body.parent_reference,
        secondary_parent_name: secParentName,
        secondary_parent_type: req.body.secondary_parent_type || "",
        secondary_first_contact: req.body.secondary_first_contact || "",
        secondary_Second_contact: req.body.secondary_Second_contact || "",
        secondary_second_whatsapp: sec_parent_second_whatsapp,
        secondary_first_whatsapp: sec_parent_first_whatsapp,
        secondary_whatsapp: sec_whatsapp_number,
        secondary_email: req.body.secondary_email || "",
        secondary_education: req.body.secondary_education || "",
        secondary_profession: req.body.secondary_profession || "",
        parent_landmark: req.body.parent_landmark || "",
        parent_house: req.body.parent_house || "",
        parent_street: req.body.parent_street || "",
        parent_address: req.body.parent_address || "",
        parent_country: req.body.parent_country.split("|")[1]
          ? req.body.parent_country.split("|")[1]
          : null,
        parent_state: req.body.parent_state.split("|")[1]
          ? req.body.parent_state.split("|")[1]
          : null,
        parent_pincode: req.body.parent_pincode,
        parent_area: req.body.parent_area,
        parent_city: req.body.parent_city.split("|")[1]
          ? req.body.parent_city.split("|")[1]
          : null,
        parent_know_aboutus: req.body.parent_know_aboutus
          ? req.body.parent_know_aboutus
          : [],
        parent_whatsapp: whatsapp_number,
        parent_second_whatsapp: parent_second_whatsapp,
        parent_first_whatsapp: parent_first_whatsapp,
        source_category: req.body.source_category,
        status_id: req.body.status_id,
        substatus_id: req.body.substatus_id,
        stage: req.body.stage,
        remark: req.body.remark,
        viewoption: req.session.user.view_option,
        action_taken: req.body.action_taken ? req.body.action_taken : [],
        type: req.body.lead_type,
        initial_status: req.body.status_id,
        initial_sub_status: req.body.substatus_id,
        initial_action: req.body.action_taken ? req.body.action_taken : [],
        initial_notes: req.body.remark,
        initial_stage: req.body.stage,
        enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
        follow_due_date: dateByTimeZone,
        follow_due_time : "",
        is_external: 0,
        external_source: "",
        sibling: 1,
        is_related: oldLead._id,
        cor_parent: req.body.cor_parent,
        company_name_parent: req.body.company_name_parent,
        do_followup: 1
      });
      await newLead.save();
      oldLead.sibling = 1;
      oldLead.is_related = newLead._id;
      await oldLead.save();
      if (req.body.lead_type == "lead") {
        // send mail for type lead
        await mail.send({
          user: req.body.parent_email,
          subject: `Welcome to Kido International Preschool & Daycare`,
          msg: {
            lead_name: req.body.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            activities: zone.activities_portal || "",
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-welcome-lead",
          title: `KIDO India`,
        });
      }
      if (req.body.stage == "Post Tour") {
        // if stage in Post Tour, the send mail
        // mail sent
        await mail.send({
          user: req.body.parent_email,
          subject: "Thank you for visiting Kido International Preschool & Daycare",
          msg: {
            lead_name: req.body.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-post-tour-lead",
          title: "KIDO India",
        });
      }
      req.flash("success", "New Siblings lead added");
      res.redirect("/admin/lead/all");
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postAddSiblingLead not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.getAddFollowUp = async (req, res, next) => {
  try {
    let statuses;
    const timeZone = momentZone.tz.guess();
    const StatusCollection = mongoose.connection.db.collection("statuses");
    const ActionCollection =
      mongoose.connection.db.collection("actionplanneds");
    const SubstatusCollection = mongoose.connection.db.collection("substatuses");
    const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).sort({
      order: 1
    }).toArray();
    const actionPromise = await ActionCollection.find({
      status: "active",
    }).sort({
      order: 1
    }).toArray();
    // console.log(statuses,"status")
    const [actions,substatuses] = await Promise.all([
      actionPromise,
      substatusesPromise
    ]);

    const followups = await Followup
      .find({ lead_id: req.params.lead_id })
      // .sort({ follow_up_date: -1 });
      .sort({ order: -1 });

    const lead = await Lead.findOne({
      _id: req.params.lead_id,
    }).populate("programcategory_id")
    .populate("program_id")
    .populate("parent_country")
    .populate("parent_state")
    .populate("parent_city")
    .populate("school_id", "school_display_name")
    .populate("zone_id", "name")
    .populate("country_id", "country_name")
    .populate("status_id", "name")
    .populate("substatus_id", "name")
    // console.log(lead,"lead")
    if (lead.type == "lead") {
      statuses = await StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
        order: 1,
      }).toArray();
    } else {
      statuses = await StatusCollection.find({
        name: {
          $in: [
            "Walked-in",
            "Walked in - Need to follow up",
            "Walked in, will not enroll",
            "Walked in - Lost to Competitor",
            "Enrolled",
          ],
        },
      }).toArray();
    }
    //   .populate('follow_ups_id', null, null, { sort: { 'follow_up_date': -1 } })
    //   .populate({
    //     path: 'center_id'
    //   })
    // .populate({
    //   path: 'child_course_id'
    // });

    if (req.session.user.main && req.session.user.main == "super_admin") {
      var nextlead = await Lead.findOne({_id: {$gt: ObjectId(req.params.lead_id) } }).limit(1);
      var prevlead = await Lead.findOne({ _id: { $lt: ObjectId(req.params.lead_id) } }).sort({ _id: -1 }).limit(1);
    }else{
      var nextlead = await Lead.findOne({_id:{$gt: ObjectId(req.params.lead_id) } , school_id:{$in:req.session.user.center_id}}).limit(1);
      var prevlead = await Lead.findOne({_id:{$lt: ObjectId(req.params.lead_id) } , school_id:{$in:req.session.user.center_id}}).sort({ _id: -1 }).limit(1);
    }
    // console.log(nextlead);
    res.render("admin/add-lead-followup", {
      title: "Add Followup",
      lead,
      moment,
      statuses,
      actions,
      currentUser: req.session.user,
      followups,
      substatuses,
      nextlead,
      prevlead,      
      timezone: timeZone || "",
      _
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getAddFollowUp not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.postAddFollowUp = async (req, res, next) => {
  try {
    // console.log(req.body,"req.body")
    let setOpts;
    const leadId = await Lead.findOne({ _id: req.params.lead_id });

    const zone = await Center.findOne({ _id: leadId.school_id });

    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

    let flDate = req.body.follow_up_date ? momentZone.tz(new Date(req.body.follow_up_date), "Asia/Kolkata") : undefined;

    let flTime = req.body.follow_up_time;

    let options = {
      type: req.body.lead_type,
      stage: req.body.stage,
      status_id: req.body.follow_status.split("|")[0],
      substatus_id: req.body.follow_sub_status.split("|")[0],
      action_taken: req.body.action_taken,
      follow_due_date: flDate,
      follow_due_time: flTime,
      comm_mode_latest: req.body.comm_mode,
      remark: req.body.notes,
      updatedAt: dateByTimeZone
    };

    if (req.body.stage == "Closed - Won") {
      options.enrolled = 1;
    }

    if (req.body.no_followup == "on") {
      delete options.follow_due_date;
      delete options.follow_due_time;
      options.do_followup = 0;
    } else {
      options.do_followup = 1;
    }

    if (req.body.someday == "on") {
      // flDate = moment(dateByTimeZone).add(30, 'days').format();
      // flTime = "11:00 PM"
      delete options.follow_due_date;
      delete options.follow_due_time;
      options.someday_follow = 0;
    } else {
      options.someday_follow = 1;
    }

    // console.log("flDate------------------", options);
    // console.log("flTime", flTime);

    // console.log(options);
    // return;
    if (req.body.no_followup == "on" || req.body.someday == "on") {
      setOpts = {
        $set: options,
        $unset: { follow_due_date: 1, follow_due_time: 1 }
      }
    } else {
      setOpts = {
        $set: options
      }
    }

    // console.log(setOpts);

    const updateLead = await Lead.updateOne(
      {
        _id: req.params.lead_id,
      },
      setOpts,
      { new: true }
    );

    const followupsOrder = await Followup.countDocuments({ lead_id: req.params.lead_id });
    // console.log("followupsOrder--------------", followupsOrder);

    const newFollowUp = new Followup({
      status_id: req.body.follow_status.split("|")[0],
      follow_status: req.body.follow_status.split("|")[1],
      follow_sub_status: req.body.follow_sub_status.split("|")[1],
      substatus_id: req.body.follow_sub_status.split("|")[0],
      action_taken: req.body.action_taken,
      enq_stage: req.body.stage,
      program_id: leadId.program_id,
      parent_know_aboutus: leadId.parent_know_aboutus
            ? leadId.parent_know_aboutus
            : [],
      type: req.body.lead_type,
      notes: req.body.notes,
      follow_up_date: flDate,
      follow_up_time: flTime,
      date_sort: moment(`${flDate}T${flTime}Z`).toISOString(),
      remark: req.body.remark || "",
      updatedBy_name: req.session.user.name,
      updatedBy: req.session.user._id,
      lead_id: req.params.lead_id,
      center_id: leadId.school_id,
      someday: req.body.someday == "on" ? 1 : 0,
      no_followup: req.body.no_followup == "on" ? 1 : 0,
      country_id: leadId.country_id || null,
      zone_id: leadId.zone_id || null,
      source_category: leadId.source_category || "",
      lead_no: leadId.lead_no,
      lead_name: leadId.parent_name || "",
      child_name: leadId.child_first_name ? `${leadId.child_first_name} ${leadId.child_last_name}` : "",
      is_whatsapp: 0,
      is_email: 0,
      not_to_show: 0,
      comm_mode: req.body.comm_mode,
      tour_date: req.body.tour_date,
      tour_time: req.body.tour_time,
      order: followupsOrder + 1
    });

    if (req.body.no_followup == "on") {
      delete newFollowUp.follow_up_date;
      delete newFollowUp.follow_up_time;
    }

    if (req.body.someday == "on") {
      delete newFollowUp.follow_up_date;
      delete newFollowUp.follow_up_time;
    }

    await newFollowUp.save(async (err, result) => {
      if (err) {
        req.flash("error", "Something went wrong!");
        res.redirect("back");
        return;
      }
      // const lead = await Lead.updateOne(
      //   { _id: req.params.lead_id },
      //   {
      //     $addToSet: { follow_ups_id: newFollowUp._id }
      //   }
      // ).exec((err, result) => {
      //   if (err) {
      //     req.flash('error', 'Something went wrong!');
      //     res.redirect('back');
      //     return;
      //   }
      if (req.body.follow_sub_status.split("|")[0] == "63b4080ff1f372a8e4fdb114") {
        // if tour booked sub-status, then send mail
        // mail sent
        await mail.send({
          user: leadId.parent_email,
          subject: "School Tour Booked: Kido International Preschool & Daycare",
          msg: {
            lead_name: leadId.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            date: moment(flDate).format("Do MMMM YYYY"),
            time: flTime,
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-tour-booked-lead",
          title: "KIDO India",
        });
      }
      if (req.body.follow_sub_status.split("|")[0] == "63b4082ff1f372a8e4fdb118") {
        // if tour booked reschdule sub-status, then send mail
        // mail sent
        await mail.send({
          user: leadId.parent_email,
          subject: "School Tour Rescheduled: Kido International Preschool & Daycare",
          msg: {
            lead_name: leadId.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            date: moment(flDate).format("Do MMMM YYYY"),
            time: flTime,
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-tour-reschedule-lead",
          title: "KIDO India",
        });
      }
      if (req.body.stage == "Post Tour") {
        // if stage in Post Tour, the send mail
        // mail sent
        await mail.send({
          user: leadId.parent_email,
          subject: "Thank you for visiting Kido International Preschool & Daycare",
          msg: {
            lead_name: leadId.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            date: moment(flDate).format("Do MMMM YYYY"),
            time: flTime,
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-post-tour-lead",
          title: "KIDO India",
        });
      }
      req.flash("success", "Follow Up Added!");
      res.redirect("back");
      return;
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postAddFollowUp not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};
exports.getEditFollowUp = async (req, res, next) => {
  try {
    // let follow_id = req.body.follow_id
    // console.log(req.params.follow_id,"param")
    const followup = await Followup.find({
      _id: req.params.follow_id,
    }).populate({
      path:"lead_id",
      populate:{
        path:'programcategory_id'
      },
    }).populate({
      path:"lead_id",
      populate:{
        path:'program_id'
      },
    }).populate({
      path:"lead_id",
      populate:{
        path:'parent_country'
      },
    }).populate({
      path:"lead_id",
      populate:{
        path:'parent_state'
      },
    }).populate({
      path:"lead_id",
      populate:{
        path:'parent_city'
      },
    })
    // console.log(followup,"followup")
    const StatusCollection = mongoose.connection.db.collection("statuses");
    const ActionCollection =
      mongoose.connection.db.collection("actionplanneds");

    const actionPromise = await ActionCollection.find({
      status: "active",
    }).sort({
      order: 1
    }).toArray();

    let statusesPromise;

    if (followup[0].type == "lead") {
      // console.log('TYPE----', followup[0].type);
      statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
        order: 1
      }).toArray();
    } else {
      // console.log('TYPE----tt', followup[0].type);
      statusesPromise = StatusCollection.find({
        name: {
          $in: [
            "Walked-in",
            "Walked in - Need to follow up",
            "Walked in, will not enroll",
            "Walked in - Lost to Competitor",
            "Enrolled",
          ],
        },
      }).toArray();
    }

    const SubstatusCollection =
      mongoose.connection.db.collection("substatuses");
    const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).toArray();
    // console.log(statuses,"status")
    const [statuses, actions, substatuses] = await Promise.all([
      statusesPromise,
      actionPromise,
      substatusesPromise,
    ]);
    const followupStringify = JSON.stringify(followup);
    const followupJSONs = JSON.parse(followupStringify);
    // console.log(followupJSONs,"populate")
    res.render("admin/edit-lead-followup", {
      title: "Edit Followup ",
      followupJSONs,
      currentUser: req.session.user,
      statuses,
      actions,
      moment,
      substatuses,
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getFollowup not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};
exports.postEditFollowUp = async (req, res, next) => {
  try {
    // console.log(req.body,"post")
    // return;
    const followUp = await Followup.findOne({ _id: req.params.follow_id });

    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

    let flDate = req.body.follow_up_date ? momentZone.tz(new Date(req.body.follow_up_date), "Asia/Kolkata") : undefined;

    let flTime = req.body.follow_up_time;

    let options = {
      type: req.body.lead_type,
      stage: req.body.stage,
      status_id: req.body.follow_status.split("|")[0],
      substatus_id: req.body.follow_sub_status.split("|")[0],
      action_taken: req.body.action_taken,
      updatedAt: dateByTimeZone
    };

    if (req.body.stage == "Closed - Won") {
      options.enrolled = 1;
    }

    if (req.body.no_followup == "on") {
      options.do_followup = 0;
    }

    if (req.body.someday == "on") {
      flDate = moment(dateByTimeZone).add(3, 'days').format();
      flTime = "11:00 PM"
    }

    // console.log(options);

    const updateLead = await Lead.updateOne(
      {
        _id: followUp.lead_id,
      },
      {
        $set: options,
      },
      { new: true }
    ).exec();

    const updateFollowup = await Followup.updateOne(
      {
        _id: req.params.follow_id,
      },
      {
        $set: {
          status_id: req.body.follow_status.split("|")[0],
          follow_status: req.body.follow_status.split("|")[1],
          follow_sub_status: req.body.follow_sub_status.split("|")[1],
          substatus_id: req.body.follow_sub_status.split("|")[0],
          action_taken: req.body.action_taken,
          enq_stage: req.body.stage,
          type: req.body.lead_type,
          notes: req.body.notes,
          follow_up_date: flDate,
          follow_up_time: flTime,
          remark: req.body.remark || "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
        },
      },
      { new: true }
    ).exec((err, result) => {
      if (err) {
        req.flash("error", "Something went wrong!");
        res.redirect("back");
        return;
      }
      req.flash("success", "Followup updated Successfully!");
      res.redirect(`/admin/lead/follow/all`);
      return;
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postFollowup not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};
exports.getViewLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.lead_id,
    })
      .populate({
        path: "center_id",
      })
      .populate({
        path: "child_course_id",
      });
    return res.render("admin/view-lead", {
      title: "View Lead",
      lead,
      moment,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getViewLead not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

// exports.getFollowLead = async (req, res, next) => {
//   try {
//     const LeadCategoryCollection = mongoose.connection.db.collection('leadcategories');
//     const StatusCollection = mongoose.connection.db.collection('status');

//     const leadCategoriesPromise = LeadCategoryCollection.find({status: 'active'}).toArray();
//     const centersPromise = Center.find({ status: 'active'}, { center_name: 1 });
//     const statusesPromise = StatusCollection.find({status: 'active'}).toArray();

//     const followUpsPromise = Followup.find({
//       follow_up_date: new Date(`${moment().format("YYYY")}-${moment().format("MM")}-${moment().format("DD")} 00:00:00.000`)
//     })
//       .populate({
//         path: 'lead_id',
//         select: {
//           lead_no: 1,
//           center_id: 1,
//           parent_name: 1,
//           child_first_name: 1,
//           child_last_name: 1,
//           lead_category: 1
//         },
//         populate: {
//           path: 'center_id',
//           model: 'Center',
//           select: {
//             center_name: 1
//           }
//         }
//       })
//       .sort({
//         follow_up_date: -1
//       });

//     const [followUps, leadCategories, centers, statuses] = await Promise.all([followUpsPromise, leadCategoriesPromise, centersPromise, statusesPromise]);

//     res.render('admin/all-followups', {
//       title: 'All Follow Ups',
//       followUps,
//       leadCategories,
//       centers,
//       statuses,
//       moment
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getFollowLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

exports.getFollowLead = async (req, res, next) => {
  try {
    let datas;
    let programs;
    const KnowUsCollection = mongoose.connection.db.collection("knowus");
    const knowuss = await KnowUsCollection.find({
      status: "active",
    }).toArray();
    const StatusCollection = mongoose.connection.db.collection("statuses")
    const statusess = await StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
      order: 1
    }).toArray();
    if (req.session.user && req.session.user.main && req.session.user.main == req.config.admin.main) {
      const countries = await Country.find({ status: "Active" });
      const zones = await Zone.find({ status: "active" });
      const centers = await Center.find({ status: "active" }, { school_display_name: 1 });
      programs = await Program.find({ status: "active" }, { program_name: 1 });
      datas = {
        countries,
        zones,
        centers
      };

    } else {
      let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      programs = await Center.aggregate([
        {
          $match:{
            _id:{$in: objectIdArray}
          }
        }, {
          $match: {
            status: "active"
          }
        },{
          $lookup: {
            from: "programs",
            localField: "program_id",
            foreignField: "_id",
            as: "result"
          }
        },{
          $unwind:{
            path:"$result"
          }
        },{
          $project:{
            "program_name" :"$result.program_name",
            "_id": 0,
            "_id" :"$result._id"
          }
        }
      ])
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

    const permissionEditLead = handlers.checkPermission(req.session.user, req.permissionCacheData, "LeadEdit");
    const permissionAddFollowUp = handlers.checkPermission(req.session.user, req.permissionCacheData, "FollowUpAdd");

    return res.render("admin/all-followups", {
      title: "All Follow Ups",
      data: datas,
      programs,
      knowuss,
      statusess,
      user_type: req.session.user && req.session.user.main ? 1 : 0,
      permissionEditLead,
      permissionAddFollowUp
    });

  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getFollowLead not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.postLeadDate = async (req, res, next) => {
  try {
    let startYear = moment(new Date(req.body.dates[0])).format("YYYY");
    let startMonth = moment(new Date(req.body.dates[0])).format("MM");
    let startDate = moment(new Date(req.body.dates[0])).format("DD");

    let endYear = moment(new Date(req.body.dates[1])).format("YYYY");
    let endMonth = moment(new Date(req.body.dates[1])).format("MM");
    let endDate = moment(new Date(req.body.dates[1])).format("DD");

    let newArr = [];
    const leads = await Lead.find({
      lead_date: {
        $gte: new Date(`${startYear}-${startMonth}-${startDate} 00:00:00.000`),
        $lte: new Date(`${endYear}-${endMonth}-${endDate} 00:00:00.000`),
      },
    })
      .populate({
        path: "follow_ups_id",
        select: {
          follow_status: 1,
          follow_sub_status: 1,
          follow_up_date: 1,
        },
      })
      .populate({
        path: "center_id",
        select: {
          center_name: 1,
        },
      })
      .sort({
        lead_date: -1,
      });

    if (leads.length) {
      leads.map((lead) => {
        newArr.push([
          moment(lead.lead_date).format("MMM Do YY"),
          lead.lead_no,
          moment(lead.follow_ups_id.slice(-1)[0].follow_up_date).format(
            "MMM Do YY"
          ),
          lead.parent_name,
          lead.child_first_name,
          lead.lead_category,
          lead.center_id.center_name,
          lead.follow_ups_id.slice(-1)[0].follow_status,
          lead.follow_ups_id.slice(-1)[0].follow_sub_status,
          `<a class="btn btn-link btn-primary" href="/admin/lead/view/detail/${lead._id}"><i class="fa fa-eye"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${lead._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/edit/${lead._id}"><i class="fa fa-edit"></i></a>`,
        ]);
      });
      Promise.all(newArr).then(() => {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      });
    } else {
      return res.status(200).json({
        msg: "success",
        code: 200,
        data: {
          newArr,
        },
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postLeadDate not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.postLeadFollowDate = async (req, res, next) => {
  try {
    let newArr = [];
    let followups;

    if (req.body.type == "daterange") {
      let startYear = moment(new Date(req.body.dates[0])).format("YYYY");
      let startMonth = moment(new Date(req.body.dates[0])).format("MM");
      let startDate = moment(new Date(req.body.dates[0])).format("DD");

      let endYear = moment(new Date(req.body.dates[1])).format("YYYY");
      let endMonth = moment(new Date(req.body.dates[1])).format("MM");
      let endDate = moment(new Date(req.body.dates[1])).format("DD");

      followups = await Followup.find({
        follow_up_date: {
          $gte: new Date(
            `${startYear}-${startMonth}-${startDate} 00:00:00.000`
          ),
          $lte: new Date(`${endYear}-${endMonth}-${endDate} 00:00:00.000`),
        },
      })
        .populate({
          path: "lead_id",
          select: {
            lead_no: 1,
            center_id: 1,
            parent_name: 1,
            child_first_name: 1,
            child_last_name: 1,
            lead_category: 1,
          },
          populate: {
            path: "center_id",
            model: "Center",
            select: {
              center_name: 1,
            },
          },
        })
        .sort({
          follow_up_date: -1,
        });

      if (followups.length) {
        followups.map((followUp) => {
          newArr.push([
            `<a href="/admin/lead/view/detail/${followUp.lead_id._id}">${followUp.lead_id.lead_no}</a>`,
            moment(followUp.follow_up_date).format("MMM Do YY"),
            moment(followUp.follow_up_date).fromNow(),
            followUp.lead_id.center_id.center_name,
            followUp.lead_id.parent_name,
            followUp.lead_id.child_first_name,
            followUp.lead_id.lead_category,
            followUp.follow_status,
            followUp.follow_sub_status,
            `<a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${followUp.lead_id._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/followup/edit/${followUp._id}"><i class="fa fa-edit"></i></a>`,
          ]);
        });
        Promise.all(newArr).then(() => {
          return res.status(200).json({
            msg: "success",
            code: 200,
            data: {
              newArr,
            },
          });
        });
      } else {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      }
    } else if (req.body.type == "overdue") {
      followups = await Followup.find({
        follow_up_date: {
          $gte: new Date(`2022-01-01 00:00:00.000`),
          $lte: new Date(
            `${moment().subtract(1, "days").format("YYYY")}-${moment()
              .subtract(1, "days")
              .format("MM")}-${moment()
              .subtract(1, "days")
              .format("DD")} 00:00:00.000`
          ),
        },
      })
        .populate({
          path: "lead_id",
          select: {
            lead_no: 1,
            center_id: 1,
            parent_name: 1,
            child_first_name: 1,
            child_last_name: 1,
            lead_category: 1,
          },
          populate: {
            path: "center_id",
            model: "Center",
            select: {
              center_name: 1,
            },
          },
        })
        .sort({
          follow_up_date: -1,
        });

      if (followups.length) {
        followups.map((followUp) => {
          newArr.push([
            `<a href="/admin/lead/view/detail/${followUp.lead_id._id}">${followUp.lead_id.lead_no}</a>`,
            moment(followUp.follow_up_date).format("MMM Do YY"),
            moment(followUp.follow_up_date).fromNow(),
            followUp.lead_id.center_id.center_name,
            followUp.lead_id.parent_name,
            followUp.lead_id.child_first_name,
            followUp.lead_id.lead_category,
            followUp.follow_status,
            followUp.follow_sub_status,
            `<a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${followUp.lead_id._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/followup/edit/${followUp._id}"><i class="fa fa-edit"></i></a>`,
          ]);
        });
        Promise.all(newArr).then(() => {
          return res.status(200).json({
            msg: "success",
            code: 200,
            data: {
              newArr,
            },
          });
        });
      } else {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      }
    } else if (req.body.type == "tomorrow") {
      followups = await Followup.find({
        follow_up_date: {
          $gte: new Date(
            `${moment().add(1, "days").format("YYYY")}-${moment()
              .add(1, "days")
              .format("MM")}-${moment()
              .add(1, "days")
              .format("DD")} 00:00:00.000`
          ),
          $lte: new Date(
            `${moment().add(1, "days").format("YYYY")}-${moment()
              .add(1, "days")
              .format("MM")}-${moment()
              .add(1, "days")
              .format("DD")} 00:00:00.000`
          ),
        },
      })
        .populate({
          path: "lead_id",
          select: {
            lead_no: 1,
            center_id: 1,
            parent_name: 1,
            child_first_name: 1,
            child_last_name: 1,
            lead_category: 1,
          },
          populate: {
            path: "center_id",
            model: "Center",
            select: {
              center_name: 1,
            },
          },
        })
        .sort({
          follow_up_date: -1,
        });

      if (followups.length) {
        followups.map((followUp) => {
          newArr.push([
            `<a href="/admin/lead/view/detail/${followUp.lead_id._id}">${followUp.lead_id.lead_no}</a>`,
            moment(followUp.follow_up_date).format("MMM Do YY"),
            moment(followUp.follow_up_date).fromNow(),
            followUp.lead_id.center_id.center_name,
            followUp.lead_id.parent_name,
            followUp.lead_id.child_first_name,
            followUp.lead_id.lead_category,
            followUp.follow_status,
            followUp.follow_sub_status,
            `<a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${followUp.lead_id._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/followup/edit/${followUp._id}"><i class="fa fa-edit"></i></a>`,
          ]);
        });
        Promise.all(newArr).then(() => {
          return res.status(200).json({
            msg: "success",
            code: 200,
            data: {
              newArr,
            },
          });
        });
      } else {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      }
    } else if (req.body.type == "today") {
      followups = await Followup.find({
        follow_up_date: {
          $gte: new Date(
            `${moment().format("YYYY")}-${moment().format(
              "MM"
            )}-${moment().format("DD")} 00:00:00.000`
          ),
          $lte: new Date(
            `${moment().format("YYYY")}-${moment().format(
              "MM"
            )}-${moment().format("DD")} 00:00:00.000`
          ),
        },
      })
        .populate({
          path: "lead_id",
          select: {
            lead_no: 1,
            center_id: 1,
            parent_name: 1,
            child_first_name: 1,
            child_last_name: 1,
            lead_category: 1,
          },
          populate: {
            path: "center_id",
            model: "Center",
            select: {
              center_name: 1,
            },
          },
        })
        .sort({
          follow_up_date: -1,
        });

      if (followups.length) {
        followups.map((followUp) => {
          newArr.push([
            `<a href="/admin/lead/view/detail/${followUp.lead_id._id}">${followUp.lead_id.lead_no}</a>`,
            moment(followUp.follow_up_date).format("MMM Do YY"),
            moment(followUp.follow_up_date).fromNow(),
            followUp.lead_id.center_id.center_name,
            followUp.lead_id.parent_name,
            followUp.lead_id.child_first_name,
            followUp.lead_id.lead_category,
            followUp.follow_status,
            followUp.follow_sub_status,
            `<a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${followUp.lead_id._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/followup/edit/${followUp._id}"><i class="fa fa-edit"></i></a>`,
          ]);
        });
        Promise.all(newArr).then(() => {
          return res.status(200).json({
            msg: "success",
            code: 200,
            data: {
              newArr,
            },
          });
        });
      } else {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      }
    } else if (req.body.type == "7days") {
      followups = await Followup.find({
        follow_up_date: {
          $gte: new Date(
            `${moment().subtract(7, "days").format("YYYY")}-${moment()
              .subtract(7, "days")
              .format("MM")}-${moment()
              .subtract(7, "days")
              .format("DD")} 00:00:00.000`
          ),
          $lte: new Date(
            `${moment().format("YYYY")}-${moment().format(
              "MM"
            )}-${moment().format("DD")} 00:00:00.000`
          ),
        },
      })
        .populate({
          path: "lead_id",
          select: {
            lead_no: 1,
            center_id: 1,
            parent_name: 1,
            child_first_name: 1,
            child_last_name: 1,
            lead_category: 1,
          },
          populate: {
            path: "center_id",
            model: "Center",
            select: {
              center_name: 1,
            },
          },
        })
        .sort({
          follow_up_date: -1,
        });

      if (followups.length) {
        followups.map((followUp) => {
          newArr.push([
            `<a href="/admin/lead/view/detail/${followUp.lead_id._id}">${followUp.lead_id.lead_no}</a>`,
            moment(followUp.follow_up_date).format("MMM Do YY"),
            moment(followUp.follow_up_date).fromNow(),
            followUp.lead_id.center_id.center_name,
            followUp.lead_id.parent_name,
            followUp.lead_id.child_first_name,
            followUp.lead_id.lead_category,
            followUp.follow_status,
            followUp.follow_sub_status,
            `<a class="btn btn-link btn-primary" href="/admin/lead/add/followup/${followUp.lead_id._id}"><i class="fa fa-plus"></i></a><a class="btn btn-link btn-primary" href="/admin/lead/followup/edit/${followUp._id}"><i class="fa fa-edit"></i></a>`,
          ]);
        });
        Promise.all(newArr).then(() => {
          return res.status(200).json({
            msg: "success",
            code: 200,
            data: {
              newArr,
            },
          });
        });
      } else {
        return res.status(200).json({
          msg: "success",
          code: 200,
          data: {
            newArr,
          },
        });
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postLeadFollowDate not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

// exports.getEditLead = async (req, res, next) => {
//   try {
//     const LeadCategoryCollection = mongoose.connection.db.collection('leadcategories');
//     const StatesCollection = mongoose.connection.db.collection('states');

//     const centersPromise = Center.find();
//     const coursesPromise = Course.find({ status: 'active'});
//     const leadCategoriesPromise = LeadCategoryCollection.find({status: 'active'}).toArray();
//     const statesPromise = StatesCollection.find().toArray();

//     const leadPromise = Lead.findOne({
//       _id: req.params.lead_id
//     })
//       .populate({
//         path: 'center_id'
//       })
//       .populate({
//         path: 'child_course_id'
//       });

//     const [lead, centers, courses, leadCategories, states] = await Promise.all([leadPromise, centersPromise, coursesPromise, leadCategoriesPromise, statesPromise])
//     return res.render('admin/edit-lead', {
//       title: 'Edit Lead',
//       lead,
//       centers,
//       courses,
//       leadCategories,
//       states
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getEditLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

exports.getEditLead = async (req, res, next) => {
  try {
    // console.log(req.body.adminCheck, "req.body");
    if (req.session.user.main && req.session.user.main == "super_admin") {
      const nextlead = await Lead.findOne({_id: {$gt: ObjectId(req.params.lead_id) }}).limit(1);
      const prevlead = await Lead.findOne({ _id: { $lt: ObjectId(req.params.lead_id) } }).sort({ _id: -1 }).limit(1);
      // console.log("welcome admin");
      const lead = await Lead.findOne({ _id: req.params.lead_id });
      // console.log("lead")
      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      // const StatusCollection = mongoose.connection.db.collection('statuses');
      const SubstatusCollection =
        mongoose.connection.db.collection("substatuses");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();
      const programcategorysPromise = Programcategory.find({
        status: req.responseAdmin.ACTIVE,
      });
      const programsPromise = Program.find({
        status: req.responseAdmin.ACTIVE,
      });
      // const statusesPromise =  StatusCollection.find().toArray();
      const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).toArray();
      const ActionCollection =
        mongoose.connection.db.collection("actionplanneds");
      const actionPromise = ActionCollection.find({
        status: "active",
      }).toArray();
      const centersPromise = Center.find({ status: req.responseAdmin.ACTIVE });

      // const employees = await Employee.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectId(req.session.user._id),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "viewoptions",
      //       localField: "view_option",
      //       foreignField: "_id",
      //       // 'pipeline': [{'$sort': {"order": -1}}],
      //       as: "viewoption",
      //     },
      //   },
      //   {
      //     $unwind: "$viewoption",
      //   },
      //   {
      //     $lookup: {
      //       from: "countries",
      //       localField: "viewoption.countries",
      //       foreignField: "_id",
      //       // 'pipeline': [{'$sort': {"order": -1}}],
      //       as: "countries",
      //     },
      //   },
      //   {
      //     $unwind: "$countries",
      //   },
      //   {
      //     $project: {
      //       _id: "$countries._id",
      //       country_name: "$countries.country_name",
      //       country_id:"$countries.country_id"
      //     },
      //   },
      // ]);
      // console.log(employees,"employee")
      const employees = await Country.find({ status: 'Active' });
      // let country_ids
      // employees.forEach((ele) => {
      //   country_ids = ele.country_id
      // })
      const country_ids = await Country.findOne({ _id: lead.parent_country });
      // console.log(country_ids, "country_id");
      const states = await State.aggregate([
        {
          $match: {
            country_id: country_ids
              ? country_ids.country_id
              : { $exists: false },
          },
        },
      ]);

      // console.log(states, "states");
      const citys = await City.aggregate([
        {
          $match: {
            country_id: country_ids
              ? country_ids.country_id
              : { $exists: false },
          },
        },
      ]);
      // console.log(citys,citys)
      const [
        knowuss1,
        substatuses,
        actions,
        centers,
        programs,
        programcategorys,
      ] = await Promise.all([
        knowussPromises,
        substatusesPromise,
        actionPromise,
        centersPromise,
        programsPromise,
        programcategorysPromise,
      ]);
      // console.log(lead)
      // console.log(citys,"citys")
      var knowussVr = knowuss1;
      var temp = (lead.parent_know_aboutus).reverse();
      knowussVr.sort(function (a, b) {
        return (temp).indexOf(b.name) - (temp).indexOf(a.name);
      });
      const knowuss = [...knowussVr];
      if (lead.type === "lead") {
        const StatusCollections = mongoose.connection.db.collection("statuses");
        const statuses = await StatusCollections.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
          order: 1
        }).toArray();
        // console.log(centers);
        res.render("admin/edit-lead", {
          nextlead,
          prevlead,
          title: "Edit Lead",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          employees,
          states,
          citys,
        });
        return;
      } else {
        const StatusCollections = mongoose.connection.db.collection("statuses");
        const statuses = await StatusCollections.find({
          name: {
            $in: [
              "Walked-in",
              "Walked in - Need to follow up",
              "Walked in, will not enroll",
              "Walked in - Lost to Competitor",
              "Enrolled",
            ],
          },
        }).toArray();
        res.render("admin/edit-lead", {
          title: "Edit Lead",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          employees,
          states,
          citys,
          nextlead,
          prevlead,
        });
        return;
      }
    } else {
      // console.log("no no admin");
      const leadPromise = Lead.findOne({ _id: req.params.lead_id });
      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      // const StatusCollection = mongoose.connection.db.collection('statuses');
      const SubstatusCollection =
        mongoose.connection.db.collection("substatuses");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();
      const programcategorysPromise = Programcategory.find({
        status: req.responseAdmin.ACTIVE,
      });
      const programsPromise = Program.find({
        status: req.responseAdmin.ACTIVE,
      });
      // const statusesPromise =  StatusCollection.find().toArray();
      const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9") ]} }).toArray();
      const ActionCollection =
        mongoose.connection.db.collection("actionplanneds");
      const actionPromise = ActionCollection.find({
        status: "active",
      }).toArray();
      // const centersPromise =  Center.find({ status: req.responseAdmin.ACTIVE });

      const employees = await Employee.aggregate([
        {
          $match: {
            _id: ObjectId(req.session.user._id),
          },
        },
        {
          $lookup: {
            from: "viewoptions",
            localField: "view_option",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "viewoption",
          },
        },
        {
          $unwind: "$viewoption",
        },
        {
          $lookup: {
            from: "countries",
            localField: "viewoption.countries",
            foreignField: "_id",
            // 'pipeline': [{'$sort': {"order": -1}}],
            as: "countries",
          },
        },
        {
          $unwind: "$countries",
        },
        {
          $project: {
            _id: "$countries._id",
            country_name: "$countries.country_name",
            country_id: "$countries.country_id",
          },
        },
      ]);
      // console.log(employees,"employee")
      let country_ids;
      employees.forEach((ele) => {
        country_ids = ele.country_id;
      });
      // console.log(country_ids,"country_id")
      const states = await State.aggregate([
        {
          $match: {
            country_id: country_ids,
          },
        },
      ]);
      // console.log(states,states)
      const citys = await City.aggregate([
        {
          $match: {
            country_id: country_ids,
          },
        },
      ]);
      const viewOption = await ViewOption.findOne({
        _id: req.session.user.view_option,
      });
      // console.log(viewOption.centers, "viewoption");

      const centers = await Center.find({ _id: { $in: viewOption.centers } });
      // console.log(centers, "centers");
      // console.log(citys,citys)
      const [knowuss1, substatuses, actions, programs, lead, programcategorys] =
        await Promise.all([
          knowussPromises,
          substatusesPromise,
          actionPromise,
          programsPromise,
          leadPromise,
          programcategorysPromise,
        ]);
      // console.log(lead)
      // console.log(citys,"citys")
      var knowussVr = knowuss1;
      var temp = (lead.parent_know_aboutus).reverse();
      knowussVr.sort(function (a, b) {
        return (temp).indexOf(b.name) - (temp).indexOf(a.name);
      });
      const knowuss = [...knowussVr];
      if (lead.type === "lead") {
        const StatusCollections = mongoose.connection.db.collection("statuses");
        const statuses = await StatusCollections.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
          order: 1
        }).toArray();
        // console.log(centers);
        res.render("admin/edit-lead", {
          title: "Edit Lead",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          employees,
          states,
          citys,
        });
        return;
      } else {
        const StatusCollections = mongoose.connection.db.collection("statuses");
        const statuses = await StatusCollections.find({
          name: {
            $in: [
              "Walked-in",
              "Walked in - Need to follow up",
              "Walked in, will not enroll",
              "Walked in - Lost to Competitor",
              "Enrolled",
            ],
          },
        }).toArray();
        res.render("admin/edit-lead", {
          title: "Edit Lead",
          lead,
          programcategorys,
          programs,
          knowuss,
          statuses,
          substatuses,
          moment,
          actions,
          centers,
          employees,
          states,
          citys,
        });
        return;
      }
    }
    // res.render('admin/edit-lead', {
    //   title: 'Edit Lead',
    //   lead,
    //   programcategorys,
    //   programs,
    //   knowuss,
    //   statuses,
    //   substatuses,
    //   moment,
    //   actions
    // });
    // return;
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getEditLead not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.markLeadUnread = async (req, res, next) => {
  try {
    const { id } = req.body;

    const oldLead = await Lead.findOne({ _id: id });

    if (oldLead) {
      const newIsExternalValue = oldLead.is_external === 1 ? 0 : 1;

      const updateLead = await Lead.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            is_external: newIsExternalValue,
            is_dup: 0,
          },
        }
      ).exec();

      return res.status(200).json({
        msg: "markLeadUnread",
        data: updateLead,
        code: 200,
      });
    } else {
      return res.status(404).json({
        msg: "Lead not found",
        code: 404,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
      code: 500,
    });
  }
};


exports.postEditLead = async (req, res, next) => {
  try {
    const oldlead = await Lead.findOne({ _id: req.params.lead_id });

    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    if (req.body.lead_type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;

      if (req.body.secondary_first_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_Second_contact == "on") {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    let whatsapp_number;
    let parent_second_whatsapp;
    let parent_first_whatsapp;
    if (req.body.whatsapp_first == "on") {
      whatsapp_number = req.body.parent_first_contact;
      parent_second_whatsapp = 0;
      parent_first_whatsapp = 1;
    } else if (req.body.whatsapp_second == "on") {
      whatsapp_number = req.body.parent_second_contact;
      parent_second_whatsapp = 1;
      parent_first_whatsapp = 0;
    }

    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

    let parent_country = req.body.parent_country
      ? req.body.parent_country.split("|")[1]
      : oldlead.parent_country;
    let parent_state = req.body.parent_state
      ? req.body.parent_state.split("|")[1]
      : oldlead.parent_state;
    let parent_city = req.body.parent_city
      ? req.body.parent_city.split("|")[1]
      : oldlead.parent_city;

    // console.log(req.body);
    // return;

    const updateLead = Lead.updateOne(
      {
        _id: req.params.lead_id,
      },
      {
        $set: {
          school_id: req.body.school_id,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: req.body.child_pre_school,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: req.body.secondary_parent_name || "",
          secondary_parent_type: req.body.secondary_parent_type,
          secondary_first_contact: req.body.secondary_first_contact,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          secondary_Second_contact: req.body.secondary_Second_contact,
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_address: req.body.parent_address || "",
          parent_street: req.body.parent_street || "",
          parent_house: req.body.parent_house || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_country: parent_country || null,
          parent_state: parent_state|| null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: parent_city|| null,
          parent_know_aboutus: req.body.parent_know_aboutus || [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          type: req.body.lead_type,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          updatedAt: dateByTimeZone,
          do_followup: 1
        },
      },
      { new: true }
    ).exec(async (err, result) => {
      if (err) {
        console.log(err, "err");
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/lead/all");
        return;
      }
      const updateFollowUps = await Followup.updateMany(
        { lead_id: mongoose.Types.ObjectId(req.params.lead_id) },
        {
          $set: {
            source_category: req.body.source_category || "",
            lead_name: req.body.parent_name || "",
            child_name: req.body.child_first_name ? `${req.body.child_first_name} ${req.body.child_last_name}` : ""
          }
        },
        { multi: true }
      ).exec();
      // req.flash("success", "Lead updated Successfully!");
      // res.redirect("/admin/lead/all");
      // return;
      if (req.query.redi) {
        res.redirect(`/admin/lead/add/followup/${req.params.lead_id}`);
        return;
      } else {
        req.flash("success", "Lead updated Successfully!");
        res.redirect("/admin/lead/all");
        return;
      }
    });
  } catch (err) {
    console.log(err);
    helper.errorDetailsForControllers(
      err,
      "postEditLead not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.getEditLeadFollow = async (req, res, next) => {
  try {
    const StatusCollection = mongoose.connection.db.collection("statuses");
    const SubStatusCollection = mongoose.connection.db.collection("substatus");
    const ActionCollection = mongoose.connection.db.collection("actiontaken");

    const statusesPromise = StatusCollection.find({
      status: "active",_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e")] }
    }).sort({
      order: 1
    }).toArray();
    const subStatusesPromise = SubStatusCollection.find({
      status: "active",
    }).toArray();
    const followUpPromise = Followup.findOne({ _id: req.params.followup_id });
    const actionTakensPromise = ActionCollection.find({
      status: "active",
    }).toArray();

    const [statuses, subStatuses, followUp, actionTakens] = await Promise.all([
      statusesPromise,
      subStatusesPromise,
      followUpPromise,
      actionTakensPromise,
    ]);

    res.render("admin/edit-followup", {
      title: "Edit FollowUp",
      followUp,
      statuses,
      subStatuses,
      actionTakens,
      currentUser: req.session.user.name,
      moment,
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "getEditLeadFollow not working - get request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.postEditLeadFollow = async (req, res, next) => {
  try {
    const followup = Followup.updateOne(
      { _id: req.params.followup_id },
      {
        $set: {
          follow_status: req.body.follow_status.split("|")[1],
          follow_sub_status: req.body.follow_sub_status,
          action_taken: req.body.action_taken,
          enq_stage: req.body.enq_stage,
          notes: req.body.notes,
          follow_up_date: new Date(
            `${req.body.follow_up_date.split("/")[0]}-${
              req.body.follow_up_date.split("/")[1]
            }-${req.body.follow_up_date.split("/")[2]} 00:00:00.000`
          ),
          follow_up_time: req.body.follow_up_time,
          remark: req.body.remark || "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
        },
      }
    ).exec((err, result) => {
      if (err) {
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/lead/follow/all");
        return;
      }
      req.flash("success", "Updated Successfully!");
      res.redirect("/admin/lead/follow/all");
      return;
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "postEditLeadFollow not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.dropdownFilter = async (req, res, next) => {
  try {
    // console.log(req.body.type,"iddd")
    const Programs = await Program.find({
      programcategory_id: req.body.type,
      status: "active",
    }).sort({ order: 1 });
    return res.status(200).json({
      msg: "Programs",
      data: Programs || [],
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "dropdownFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};
exports.statusFilter = async (req, res, next) => {
  try {
    // console.log(req.body.type,"iddd")
    const StatusCollection = mongoose.connection.db.collection("substatuses");
    const Substatus = await StatusCollection.find({
      status_id: ObjectId(req.body.type),
      _id: {
        $nin: [
          ObjectId("63b40852f1f372a8e4fdb11a"),
          ObjectId("63b40865f1f372a8e4fdb11b"),
          ObjectId("63b40879f1f372a8e4fdb11c"),
          ObjectId("63b40a85f1f372a8e4fdb12a"),
          ObjectId("63b40abef1f372a8e4fdb12c"),
          ObjectId("63b40ad5f1f372a8e4fdb12d"),
          ObjectId("63b40d48f1f372a8e4fdb13f"),
          ObjectId("63b40d5bf1f372a8e4fdb140"),
          ObjectId("63b40d73f1f372a8e4fdb141"),
          ObjectId("63b40d92f1f372a8e4fdb142"),
          ObjectId("63b40da8f1f372a8e4fdb143"),
          ObjectId("63b40dbcf1f372a8e4fdb144")
        ]
      }
    }).sort({
      order: 1
    }).toArray();
    // console.log(Substatus,"substatus")
    return res.status(200).json({
      msg: "Substatus",
      data: Substatus,
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "dropdownFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.stateFilter = async (req, res, next) => {
  try {
    // console.log(parseInt(req.body.type),"statefilter")

    const stateId = parseInt(req.body.type);

    // let id = req.body.type
    // return;
    const States = await State.aggregate([
      {
        $match: {
          country_id: stateId,
        },
      },
    ]);
    // console.log(States,"states")
    return res.status(200).json({
      msg: "States",
      data: States,
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "stateFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};
exports.cityFilter = async (req, res, next) => {
  try {
    // console.log(parseInt(req.body.type),"cityfilter")

    const cityId = parseInt(req.body.type);

    // let id = req.body.type
    // return;
    const Citys = await City.aggregate([
      {
        $match: {
          state_id: cityId,
        },
      },
    ]);
    // console.log(Citys,"states")
    return res.status(200).json({
      msg: "Citys",
      data: Citys,
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "stateFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.centerFilter = async (req, res, next) => {
  try {
    // console.log(req.body.type, "centerfilter");
    // return;
    // const cityId = parseInt(req.body.type)
    const centers = await Center.findOne({ _id: req.body.type }).populate(
      "programcategory_id"
    );
    // console.log(centers.programcategory_id, "centers");

    return res.status(200).json({
      msg: "centers.programcategory_id",
      data: centers && centers.programcategory_id ? centers.programcategory_id : [],
      code: 200,
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "stateFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

// exports.datatableFilterr = async (req, res, next) => {
//   try {
//     let newArr = [];
//     // console.log(req.body.adminCheck, "req.body");
//     // console.log(req.query, "req.queryquery");
//     // console.log(req.session.user.main,"req.session.user.main")

//     if(req.session.user.main && req.session.user.main == "super_admin"){
//       console.log("super_admin")
//       if(req.query.sSearch_2){
//         // console.log("search2");
//         let startdate = req.query.sSearch_2.split("-")[0]
//         let enddate = req.query.sSearch_2.split("-")[1]
//         const leads = await Lead.find({
//           $and:[
//             {
//               lead_date:{
//                 $lte: enddate
//               }
//             },
//             {
//               lead_date:{
//                 $gte: startdate
//               }
//             }
//           ]

//         })
//           .sort({ createdAt: req.responseAdmin.DESC })
//           .populate("school_id")
//           .populate("program_id")
//           .skip(parseInt(req.query.iDisplayStart))
//           .limit(parseInt(req.query.iDisplayLength));
//         // console.log(leads,"lead")
//         let totalCountDoc = await Lead.countDocuments();
//         let finObj = {
//           sEcho: req.query.sEcho,
//           iTotalRecords: totalCountDoc,
//           iTotalDisplayRecords: totalCountDoc,
//         };
//         // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
//         // console.log(finObj);
//         if (leads.length) {
//           leads.map((lead) => {
//             newArr.push([
//               `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                 lead.lead_no ? lead.lead_no : "Not Provided"
//               }</a>`,
//               `${
//                 lead.createdAt
//                   ? moment(lead.createdAt).format("L")
//                   : "Not Provided"
//               }`,
//               `${
//                 lead.updatedAt
//                   ? moment(lead.updatedAt).format("L")
//                   : "Not Provided"
//               }`,
//               `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//               `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//               `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//               `${lead.stage ? lead.stage : "Not Provided"}`,
//               `${
//                 lead.school_id && lead.school_id.school_name
//                   ? lead.school_id.school_name
//                   : "Not Provided"
//               }`,
//               `${lead.source_category ? lead.source_category : "Not Provided"}`,
//               `${
//                 lead.program_id && lead.program_id.program_name
//                   ? lead.program_id.program_name
//                   : "Not Provided"
//               }`,
//               `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//             ]);
//           });
//           finObj.data = newArr;
//           res.json(finObj);
//         } else {
//           finObj.data = newArr;
//           res.json(finObj);
//         }
//       }else{
//         const leads = await Lead.find()
//           .sort({ createdAt: req.responseAdmin.DESC })
//           .populate("school_id")
//           .populate("program_id")
//           .skip(parseInt(req.query.iDisplayStart))
//           .limit(parseInt(req.query.iDisplayLength));
//         let totalCountDoc = await Lead.countDocuments();
//         let finObj = {
//           sEcho: req.query.sEcho,
//           iTotalRecords: totalCountDoc,
//           iTotalDisplayRecords: totalCountDoc,
//         };

//         if (leads.length) {
//           leads.map((lead) => {
//             newArr.push([
//               `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                 lead.lead_no ? lead.lead_no : "Not Provided"
//               }</a>`,
//               `${
//                 lead.createdAt
//                   ? moment(lead.createdAt).format("L")
//                   : "Not Provided"
//               }`,
//               `${
//                 lead.updatedAt
//                   ? moment(lead.updatedAt).format("L")
//                   : "Not Provided"
//               }`,
//               `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//               `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//               `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//               `${lead.stage ? lead.stage : "Not Provided"}`,
//               `${
//                 lead.school_id && lead.school_id.school_name
//                   ? lead.school_id.school_name
//                   : "Not Provided"
//               }`,
//               `${lead.source_category ? lead.source_category : "Not Provided"}`,
//               `${
//                 lead.program_id && lead.program_id.program_name
//                   ? lead.program_id.program_name
//                   : "Not Provided"
//               }`,
//               `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//             ]);
//           });

//           finObj.data = newArr;
//           res.json(finObj);
//         } else {
//           finObj.data = newArr;
//           res.json(finObj);
//         }
//       }
//     }else{
//       console.log('normal admin');
//       if (req.body.adminCheck == 1) {
//         if(req.query.sSearch_2){
//           // console.log("search2");
//           let startdate = req.query.sSearch_2.split("-")[0]
//           let enddate = req.query.sSearch_2.split("-")[1]
//           const leads = await Lead.find({
//             viewoption: req.session.user.view_option,
//             $and:[
//               {
//                 lead_date:{
//                   $lte: enddate
//                 }
//               },
//               {
//                 lead_date:{
//                   $gte: startdate
//                 }
//               }
//             ]

//           })
//             .sort({ createdAt: req.responseAdmin.DESC })
//             .populate("school_id")
//             .populate("program_id")
//             .skip(parseInt(req.query.iDisplayStart))
//             .limit(parseInt(req.query.iDisplayLength));
//           // console.log(leads,"lead")
//           let totalCountDoc = await Lead.countDocuments();
//           let finObj = {
//             sEcho: req.query.sEcho,
//             iTotalRecords: totalCountDoc,
//             iTotalDisplayRecords: totalCountDoc,
//           };
//           // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
//           // console.log(finObj);
//           if (leads.length) {
//             leads.map((lead) => {
//               newArr.push([
//                 `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                   lead.lead_no ? lead.lead_no : "Not Provided"
//                 }</a>`,
//                 `${
//                   lead.createdAt
//                     ? moment(lead.createdAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${
//                   lead.updatedAt
//                     ? moment(lead.updatedAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//                 `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//                 `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//                 `${lead.stage ? lead.stage : "Not Provided"}`,
//                 `${
//                   lead.school_id && lead.school_id.school_name
//                     ? lead.school_id.school_name
//                     : "Not Provided"
//                 }`,
//                 `${lead.source_category ? lead.source_category : "Not Provided"}`,
//                 `${
//                   lead.program_id && lead.program_id.program_name
//                     ? lead.program_id.program_name
//                     : "Not Provided"
//                 }`,
//                 `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//               ]);
//             });
//             finObj.data = newArr;
//             res.json(finObj);
//           } else {
//             finObj.data = newArr;
//             res.json(finObj);
//           }
//         }else{
//           // console.log("admin");
//           const leads = await Lead.find({viewoption: req.session.user.view_option,})
//             .sort({ createdAt: req.responseAdmin.DESC })
//             .populate("school_id")
//             .populate("program_id")
//             .skip(parseInt(req.query.iDisplayStart))
//             .limit(parseInt(req.query.iDisplayLength));
//           // console.log(leads,"lead")
//           let totalCountDoc = await Lead.countDocuments();
//           let finObj = {
//             sEcho: req.query.sEcho,
//             iTotalRecords: totalCountDoc,
//             iTotalDisplayRecords: totalCountDoc,
//           };
//           // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
//           // console.log(finObj);
//           if (leads.length) {
//             leads.map((lead) => {
//               newArr.push([
//                 `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                   lead.lead_no ? lead.lead_no : "Not Provided"
//                 }</a>`,
//                 `${
//                   lead.createdAt
//                     ? moment(lead.createdAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${
//                   lead.updatedAt
//                     ? moment(lead.updatedAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//                 `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//                 `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//                 `${lead.stage ? lead.stage : "Not Provided"}`,
//                 `${
//                   lead.school_id && lead.school_id.school_name
//                     ? lead.school_id.school_name
//                     : "Not Provided"
//                 }`,
//                 `${lead.source_category ? lead.source_category : "Not Provided"}`,
//                 `${
//                   lead.program_id && lead.program_id.program_name
//                     ? lead.program_id.program_name
//                     : "Not Provided"
//                 }`,
//                 `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//               ]);
//             });
//             finObj.data = newArr;
//             res.json(finObj);
//           } else {
//             finObj.data = newArr;
//             res.json(finObj);
//           }
//         }
//       } else {
//         // console.log("no admin");
//         if(req.query.sSearch_2){
//           // console.log("search2");
//           let startdate = req.query.sSearch_2.split("-")[0]
//           let enddate = req.query.sSearch_2.split("-")[1]
//           const leads = await Lead.find({
//             viewoption: req.session.user.view_option,
//             $and:[
//               {
//                 lead_date:{
//                   $lte: enddate
//                 }
//               },
//               {
//                 lead_date:{
//                   $gte: startdate
//                 }
//               }
//             ]

//           })
//             .sort({ createdAt: req.responseAdmin.DESC })
//             .populate("school_id")
//             .populate("program_id")
//             .skip(parseInt(req.query.iDisplayStart))
//             .limit(parseInt(req.query.iDisplayLength));
//           // console.log(leads,"lead")
//           let totalCountDoc = await Lead.countDocuments();
//           let finObj = {
//             sEcho: req.query.sEcho,
//             iTotalRecords: totalCountDoc,
//             iTotalDisplayRecords: totalCountDoc,
//           };
//           // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
//           // console.log(finObj);
//           if (leads.length) {
//             leads.map((lead) => {
//               newArr.push([
//                 `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                   lead.lead_no ? lead.lead_no : "Not Provided"
//                 }</a>`,
//                 `${
//                   lead.createdAt
//                     ? moment(lead.createdAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${
//                   lead.updatedAt
//                     ? moment(lead.updatedAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//                 `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//                 `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//                 `${lead.stage ? lead.stage : "Not Provided"}`,
//                 `${
//                   lead.school_id && lead.school_id.school_name
//                     ? lead.school_id.school_name
//                     : "Not Provided"
//                 }`,
//                 `${lead.source_category ? lead.source_category : "Not Provided"}`,
//                 `${
//                   lead.program_id && lead.program_id.program_name
//                     ? lead.program_id.program_name
//                     : "Not Provided"
//                 }`,
//                 `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//               ]);
//             });
//             finObj.data = newArr;
//             res.json(finObj);
//           } else {
//             finObj.data = newArr;
//             res.json(finObj);
//           }
//         }else{
//           // const view_id = ViewOption.find ({_id:req.session.user.view_option});
//           // console.log(view_id,"view_id")
//           const leads = await Lead.find({
//             viewoption: req.session.user.view_option,
//           })
//             .sort({ createdAt: req.responseAdmin.DESC })
//             .populate("school_id")
//             .populate("program_id")
//             .skip(parseInt(req.query.iDisplayStart))
//             .limit(parseInt(req.query.iDisplayLength));
//           let totalCountDoc = await Lead.countDocuments({
//             viewoption: req.session.user.view_option,
//           });
//           // console.log(lead,"lead")
//           let finObj = {
//             sEcho: req.query.sEcho,
//             iTotalRecords: totalCountDoc,
//             iTotalDisplayRecords: totalCountDoc,
//           };
//           if (leads.length) {
//             leads.map((lead) => {
//               newArr.push([
//                 `<a href="#" onclick="redirectToEditleed('${lead._id}')">${
//                   lead.lead_no ? lead.lead_no : "Not Provided"
//                 }</a>`,
//                 `${
//                   lead.createdAt
//                     ? moment(lead.createdAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${
//                   lead.updatedAt
//                     ? moment(lead.updatedAt).format("L")
//                     : "Not Provided"
//                 }`,
//                 `${lead.parent_name ? lead.parent_name : "Not Provided"}`,
//                 `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`,
//                 `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`,
//                 `${lead.stage ? lead.stage : "Not Provided"}`,
//                 `${
//                   lead.school_id && lead.school_id.school_name
//                     ? lead.school_id.school_name
//                     : "Not Provided"
//                 }`,
//                 `${lead.source_category ? lead.source_category : "Not Provided"}`,
//                 `${
//                   lead.program_id && lead.program_id.program_name
//                     ? lead.program_id.program_name
//                     : "Not Provided"
//                 }`,
//                 `<button type="button" class="btn btn-link btn-primary" data-toggle="tooltip" title="followup" data-original-title="Edit timesheet" onclick="redirectToEditleed2('${lead._id}')"><i class="fa fa-plus"></i></button>`,
//               ]);
//             });
//             finObj.data = newArr;
//             res.json(finObj);
//           } else {
//             finObj.data = newArr;
//             res.json(finObj);
//           }
//         }
//       }
//     }
//   } catch (err) {
//     helper.errorDetailsForControllers(
//       err,
//       "datatableFilter not working - post request",
//       req.originalUrl,
//       req.body,
//       {},
//       "redirect",
//       __filename
//     );
//     next(err);
//     return;
//   }
// };

exports.datatableFilter = async (req, res, next) => {
  try {

    // ----------------------------LEAD PAGE datatable-----------------;
    // console.log('AAAAAAAAAAA');

    const timeZone = momentZone.tz.guess();

    const currentDate = moment().tz("Asia/Kolkata");
    const startOfWeek = currentDate.clone().startOf('isoWeek');
    const endOfWeek = currentDate.clone().endOf('isoWeek');

    // console.log('Start of the week:', startOfWeek.format('YYYY-MM-DD'));
    // console.log('End of the week:', endOfWeek.format('YYYY-MM-DD'));
    const startDate = startOfWeek.toDate();
    const endDate = endOfWeek.toDate();
    // console.log("startDate-------", startDate);
    // console.log("endDate-------", endDate);
    // console.log("req.body", req.body);
    const sortingArr = [" ","lead_no_val", "lead_date", "updatedAt", "parent_name", "child_first_name", "child_last_name", "stage", "type", `${req.session.user.main && req.session.user.main == req.config.admin.main ? 'school_id.school_display_name' : 'child_first_name'}`, "source_category", "parent_know_aboutus",  "program_id.program_name",  "status_id.name","substatus_id.name", "programcategory_id.title",  "lead_no"];
    // const sortingArr = ["","lead_no","lead_date", "updatedAt", "parent_name","","","stage","","source_category","parent_know_aboutus","","","","source_category","" ,"type", `${req.session.user.main && req.session.user.main == req.config.admin.main ? 'school_id.school_display_name' : 'child_first_name'}`, "parent_know_aboutus", "programcategory_id.title", "program_id.program_name", "status_id.name","substatus_id.name"];
    let zoneCount = 0;
    let newArr = [];
    let findQue = {};
    let aggregateQue = [
      // {
      //   '$match': {
      //     'lead_date': {
      //       '$gte': startDate,
      //       '$lte': endDate
      //     }
      //   }
      // },
      {
        '$lookup': {
          'from': 'statuses',
          'localField': 'status_id',
          'foreignField': '_id',
          'as': 'status_id'
        }
      }, {
        '$unwind': {
          'path': '$status_id',
          // 'includeArrayIndex': 'string',
          // 'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'substatuses',
          'localField': 'substatus_id',
          'foreignField': '_id',
          'as': 'substatus_id'
        }
      },
      {
        '$unwind': {
          'path': '$substatus_id',
          // 'includeArrayIndex': 'string',
          // 'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'centers',
          'localField': 'school_id',
          'foreignField': '_id',
          'as': 'school_id'
        }
      }, {
        '$unwind': {
          'path': '$school_id'
        }
      }, {
        '$lookup': {
          'from': 'programcategories',
          'localField': 'programcategory_id',
          'foreignField': '_id',
          'as': 'programcategory_id'
        }
      }, {
        '$unwind': {
          'path': '$programcategory_id',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'programs',
          'localField': 'program_id',
          'foreignField': '_id',
          'as': 'program_id'
        }
      }, {
        '$addFields': {
          'lead_no_val': {
            '$toInt': {
              '$substr': ["$lead_no", 2, -1]
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$program_id',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'lead_no': 1,
          'lead_date': 1,
          'createdAt': 1,
          'updatedAt': 1,
          'parent_name': 1,
          'child_first_name': 1,
          'child_last_name': 1,
          'stage': 1,
          'type': 1,
          'school_id._id': 1,
          'school_id.school_display_name': 1,
          'school_id.zone_id': 1,
          'zone_id': 1,
          'source_category': 1,
          'parent_know_aboutus': 1,
          'programcategory_id.title': 1,
          'program_id.program_name': 1,
          'status_id.name': 1,
          'substatus_id.name': 1,
          'is_external': 1,
          'is_dup': 1,
          'dup_no': 1,
          'lead_no_val': 1
        }
      }, {
        '$sort': {
          [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
        }
      }, {
        '$skip': parseInt(req.query.iDisplayStart)
      }, {
        '$limit': parseInt(req.query.iDisplayLength)
      }
    ];

    // console.log(aggregateQue, "aggregateQue")
    // const currentDateByTimeZone = momentZone.tz(Date.now(), timeZone);

    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // ADMIN
      // console.log('ADMINNNNNN___')
      let centers = await Center.find({status: "active"}).distinct('_id');
      findQue = {
        school_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {"$in": centers}
        }
      });
    } else {
      // NON ADMIN
      // console.log('NON ADMINNNNNN___')
      // console.log(req.session.user.center_id,'req.session.user.center_id')
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      // console.log(centers,"------------objectIdArray")
      findQue = {
        school_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {"$in": centers}
        }
      });
      // console.log(JSON.stringify(aggregateQue),"------------aggregateQue")
    }

    if (req.query.zone) {
      // console.log(req.query.sSearch_1,"req.query.sSearch_1")
      let zone = req.query.zone.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        zone_id: {$in:zone}
      };
      aggregateQue.unshift({
        '$match': {
          'zone_id': {$in:zone}
        }
      });
    }

    if (req.query.program) {
      // console.log(req.query.program,"req.program.program")
      let program = req.query.program.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        program_id: {$in:program}
      };
      aggregateQue.unshift({
        '$match': {
          'program_id': {$in:program}
        }
      });
      // console.log(JSON.stringify(aggregateQue));
    }
    // console.log(aggregateQue,"aggregateQue")
    if (req.query.know_us) {
      // console.log(req.query.know_us,"req.know_us.know_us")
      let know_us = req.query.know_us
      findQue = {
        parent_know_aboutus: {$in:know_us}
      };
      aggregateQue.unshift({
        '$match': {
          'parent_know_aboutus': {$in:know_us}
        }
      });
    }

    if (req.query.sSearch_4) {
      // console.log('DATE GIVEN---');
      // console.log('DATE GIVEN---');
      // let start = momentZone.tz(`${req.query.sSearch_4}`,"Asia/Kolkata").startOf('day').toDate();
      // let end = momentZone.tz(`${req.query.sSearch_5}`, "Asia/Kolkata").endOf('day').toDate();
      let start = moment(req.query.sSearch_4, 'DD/MM/YYYY').toDate();
      let end = moment(req.query.sSearch_5, 'DD/MM/YYYY').endOf('day').toDate();
      // let start = req.query.sSearch_4;
      // let end = req.query.sSearch_5;
      // console.log("start---", req.query.sSearch_4);
      // console.log("end---", req.query.sSearch_5);
      findQue = {
        lead_date: {
          '$gte': start,
          '$lte': end
        }
      }
      // _.remove(aggregateQue, '$match.lead_date');
      // console.log(aggregateQue)
      // aggregateQue.unshift({
      //   '$match': {
      //     'lead_date': {
      //       '$gte': start,
      //       '$lte': end
      //     }
      //   }
      // });
      aggregateQue.unshift({
        "$match": {
        "lead_date": {
          '$gte': start,
          '$lte': end
          }
        }
      });
      // _.reject(aggregateQue, '$match.lead_date');
      // console.log("DATATATTAATATAAT")
      // console.log(JSON.stringify(aggregateQue))
    }

    if (req.query.country) {
      // console.log(req.query.sSearch_0,"req.query.sSearch_0")
      // console.log(req.query.country,"req.query.country")
      // return;
      let country = req.query.country.map(s => mongoose.Types.ObjectId(s));
      // console.log(country,"country")

      findQue = {
        country_id: {$in: country}
      };
      aggregateQue.unshift({
        '$match': {
          'country_id': {$in: country}
        }
      });
    }
    if (req.query.substatus) {
      // console.log(center,"center")
      findQue = {
        substatus_id:  mongoose.Types.ObjectId(req.query.substatus)
      };
      aggregateQue.unshift({
        '$match': {
          'substatus_id': mongoose.Types.ObjectId(req.query.substatus)
        }
      });
    }

    if (req.query.center) {
      let center = req.query.center.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        school_id: {$in:center}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {$in:center}
        }
      });
    }
    if (req.query.status) {
      let status = req.query.status.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        status_id: {$in:status}
      };
      aggregateQue.unshift({
        '$match': {
          'status_id': {$in:status}
        }
      });
    }

    if (req.query.sSearch_3) {
      findQue = {
        source_category: req.query.sSearch_3
      };
      aggregateQue.unshift({
        '$match': {
          'source_category': req.query.sSearch_3
        }
      });
    }
    if (req.query.sSearch_6) {
      // console.log(req.query.sSearch_6,"req.query.sSearch_6req.query.sSearch_6")
      findQue = {
        stage: req.query.sSearch_6
      };
      aggregateQue.unshift({
        '$match': {
          'stage': req.query.sSearch_6
        }
      });
    }

    if (req.query.sSearch) { // parent_name, // child_first_name, // lead_no
      // findQue = {
      //   source_category: req.query.sSearch_4
      // };
      // console.log(req.query.sSearch,"sSearcfg")
      aggregateQue.unshift({
        '$match': {
          $or: [
            {
              parent_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              child_first_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              parent_first_contact: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              parent_email: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            }
          ]
        }
      });
    }

    // duplicate lead filter
    if (req.query.dup_leads == "true") {
      findQue = {
        is_dup: 1
      };
      aggregateQue.unshift({
        '$match': {
          'is_dup': 1
        }
      });
    }

    const leads = await Lead.aggregate(aggregateQue);

    aggregateQue.splice(aggregateQue.length - 2, 2);

    const totalCount = await Lead.aggregate(aggregateQue);
    var newLds = 0;
    totalCount.forEach((ele) => {
      (ele.is_external == 1) ? newLds++ : false;
    })

    let finObj = {
      sEcho: req.query.sEcho,
      iTotalRecords: totalCount.length,
      iTotalDisplayRecords: totalCount.length,
      newLds: newLds
    };

    delete aggregateQue;

    if (leads.length) {
      finObj.data = leads;
      return res.json(finObj);
    } else {
      finObj.data = newArr;
      return res.json(finObj);
    }
  } catch (err) {
    // console.log(err,"err")
    helper.errorDetailsForControllers(
      err,
      "datatableFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.datatableFollowupFilterr = async (req,res,next) => {
  try{
    let newArr = [];
    // console.log(req.session.user._id,"user_id")
    // console.log(req.query,"req,query followup")
    // console.log(req.query.sSearch_2,"req,query date")
    if(req.session.user.main == "super_admin"){
      if(req.query.sSearch_2){
        let startdate = req.query.sSearch_2.split("-")[0]
        let enddate = req.query.sSearch_2.split("-")[1]
        let startdate2 = new Date(startdate).toISOString();
        let endddate2 = new Date(enddate).toISOString()

        // console.log(new Date(startdate).toISOString(),"startdate")
        // console.log(new Date(enddate).toISOString(),"enddate")
        let followups = await Followup.find({
          $and:[
            {
              follow_up_date:{
                $lte: enddate
              }
            },
            {
              follow_up_date:{
                $gte: startdate
              }
            }
          ]
        })
        .sort({ follow_up_date: req.responseAdmin.DESC })
        .populate("lead_id")
        .skip(parseInt(req.query.iDisplayStart))
        .limit(parseInt(req.query.iDisplayLength));
        let totalCountDoc = await Followup.countDocuments();
        // console.log(followups,"followup datat")
          let finObj = {
            sEcho: req.query.sEcho,
            iTotalRecords: totalCountDoc,
            iTotalDisplayRecords: totalCountDoc,
          };

          if (followups.length) {
            followups.map((followup) => {
              newArr.push([
                `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                  followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                }</a>`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).format("L")
                    : "Not Provided"
                }`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).fromNow()
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.parent_name
                    ? followup.lead_id.parent_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.child_first_name
                    ? followup.lead_id.child_first_name
                    : "Not Provided"
                }`,
                `${
                  followup.follow_status
                    ? followup.follow_status
                    : "Not Provided"
                }`,
                `${
                  followup.follow_sub_status
                    ? followup.follow_sub_status
                    : "Not Provided"
                }`,
              ]);
            });
            finObj.data = newArr;
            res.json(finObj);
          } else {
            finObj.data = newArr;
            res.json(finObj);
          }
      }else{

        const followups = await Followup.find()
          .sort({ follow_up_date: req.responseAdmin.DESC })
          .populate("lead_id")
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
          let totalCountDoc = await Followup.countDocuments();
          // console.log(followups,"followups")
          let finObj = {
            sEcho: req.query.sEcho,
            iTotalRecords: totalCountDoc,
            iTotalDisplayRecords: totalCountDoc,
          };
          // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
          // console.log(finObj);
          if (followups.length) {
            followups.map((followup) => {
              newArr.push([
                `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                  followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                }</a>`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).format("L")
                    : "Not Provided"
                }`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).fromNow()
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.parent_name
                    ? followup.lead_id.parent_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.child_first_name
                    ? followup.lead_id.child_first_name
                    : "Not Provided"
                }`,
                `${
                  followup.follow_status
                    ? followup.follow_status
                    : "Not Provided"
                }`,
                `${
                  followup.follow_sub_status
                    ? followup.follow_sub_status
                    : "Not Provided"
                }`,
              ]);
            });
            finObj.data = newArr;
            res.json(finObj);
          } else {
            finObj.data = newArr;
            res.json(finObj);
          }
      }
    }else{

      if (req.body.adminCheck == 1) {
        if(req.query.sSearch_2){
          let startdate = req.query.sSearch_2.split("-")[0]
          let enddate = req.query.sSearch_2.split("-")[1]
          let startdate2 = new Date(startdate).toISOString();
          let endddate2 = new Date(enddate).toISOString()

          // console.log(new Date(startdate).toISOString(),"startdate")
          // console.log(new Date(enddate).toISOString(),"enddate")
          const follow_id = await Followup.find({updatedBy:req.session.user._id})

          let followarray = []
          for(let i=0; i<follow_id.length; i++){
            // console.log(follow_id[i].lead_id)
              followarray.push(follow_id[i].lead_id)
          }
          let followups = await Followup.find({
            lead_id:{$in:followarray},
            $and:[
              {
                follow_up_date:{
                  $lte: enddate
                }
              },
              {
                follow_up_date:{
                  $gte: startdate
                }
              }
            ]
          })
          .sort({ follow_up_date: req.responseAdmin.DESC })
          .populate("lead_id")
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
          let totalCountDoc = await Followup.countDocuments();
          // console.log(followups,"followup datat")
            let finObj = {
              sEcho: req.query.sEcho,
              iTotalRecords: totalCountDoc,
              iTotalDisplayRecords: totalCountDoc,
            };

            if (followups.length) {
              followups.map((followup) => {
                newArr.push([
                  `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                    followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                  }</a>`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).format("L")
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).fromNow()
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.parent_name
                      ? followup.lead_id.parent_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.child_first_name
                      ? followup.lead_id.child_first_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_status
                      ? followup.follow_status
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_sub_status
                      ? followup.follow_sub_status
                      : "Not Provided"
                  }`,
                ]);
              });
              finObj.data = newArr;
              res.json(finObj);
            } else {
              finObj.data = newArr;
              res.json(finObj);
            }
        }else{
          const follow_id = await Followup.find({updatedBy:req.session.user._id})

          let followarray = []
          for(let i=0; i<follow_id.length; i++){
            // console.log(follow_id[i].lead_id)
              followarray.push(follow_id[i].lead_id)
          }
          // console.log(followarray,"followarray")


          const followups = await Followup.find({lead_id:{$in:followarray}})
            .sort({ follow_up_date: req.responseAdmin.DESC })
            .populate("lead_id")
            .skip(parseInt(req.query.iDisplayStart))
            .limit(parseInt(req.query.iDisplayLength));
            let totalCountDoc = await Followup.countDocuments();
            // console.log(followups,"followups")
            let finObj = {
              sEcho: req.query.sEcho,
              iTotalRecords: totalCountDoc,
              iTotalDisplayRecords: totalCountDoc,
            };
            // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
            // console.log(finObj);
            if (followups.length) {
              followups.map((followup) => {
                newArr.push([
                  `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                    followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                  }</a>`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).format("L")
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).fromNow()
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.parent_name
                      ? followup.lead_id.parent_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.child_first_name
                      ? followup.lead_id.child_first_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_status
                      ? followup.follow_status
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_sub_status
                      ? followup.follow_sub_status
                      : "Not Provided"
                  }`,
                ]);
              });
              finObj.data = newArr;
              res.json(finObj);
            } else {
              finObj.data = newArr;
              res.json(finObj);
            }
        }
      }else{
        if(req.query.sSearch_2){
          let startdate = req.query.sSearch_2.split("-")[0]
          let enddate = req.query.sSearch_2.split("-")[1]
          let startdate2 = new Date(startdate).toISOString();
          let endddate2 = new Date(enddate).toISOString()

          // console.log(new Date(startdate).toISOString(),"startdate")
          // console.log(new Date(enddate).toISOString(),"enddate")
          const follow_id = await Followup.find({updatedBy:req.session.user._id})

          let followarray = []
          for(let i=0; i<follow_id.length; i++){
            // console.log(follow_id[i].lead_id)
              followarray.push(follow_id[i].lead_id)
          }
          let followups = await Followup.find({
            lead_id:{$in:followarray},
            $and:[
              {
                follow_up_date:{
                  $lte: enddate
                }
              },
              {
                follow_up_date:{
                  $gte: startdate
                }
              }
            ]
          })
          .sort({ follow_up_date: req.responseAdmin.DESC })
          .populate("lead_id")
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
          let totalCountDoc = await Followup.countDocuments();
          // console.log(followups,"followup datat")
            let finObj = {
              sEcho: req.query.sEcho,
              iTotalRecords: totalCountDoc,
              iTotalDisplayRecords: totalCountDoc,
            };

            if (followups.length) {
              followups.map((followup) => {
                newArr.push([
                  `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                    followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                  }</a>`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).format("L")
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).fromNow()
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.parent_name
                      ? followup.lead_id.parent_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.child_first_name
                      ? followup.lead_id.child_first_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_status
                      ? followup.follow_status
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_sub_status
                      ? followup.follow_sub_status
                      : "Not Provided"
                  }`,
                ]);
              });
              finObj.data = newArr;
              res.json(finObj);
            } else {
              finObj.data = newArr;
              res.json(finObj);
            }
        }else{

          const follow_id = await Followup.find({updatedBy:req.session.user._id})

          let followarray = []
          for(let i=0; i<follow_id.length; i++){
            // console.log(follow_id[i].lead_id)
              followarray.push(follow_id[i].lead_id)
          }
          // console.log(followarray,"followarray")


          const followups = await Followup.find({lead_id:{$in:followarray}})
            .sort({ follow_up_date: req.responseAdmin.DESC })
            .populate("lead_id")
            .skip(parseInt(req.query.iDisplayStart))
            .limit(parseInt(req.query.iDisplayLength));
            let totalCountDoc = await Followup.countDocuments();
            // console.log(followups,"followups")
            let finObj = {
              sEcho: req.query.sEcho,
              iTotalRecords: totalCountDoc,
              iTotalDisplayRecords: totalCountDoc,
            };
            // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
            // console.log(finObj);
            if (followups.length) {
              followups.map((followup) => {
                newArr.push([
                  `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                    followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                  }</a>`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).format("L")
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_up_date
                      ? moment(followup.follow_up_date).fromNow()
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.parent_name
                      ? followup.lead_id.parent_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.lead_id && followup.lead_id.child_first_name
                      ? followup.lead_id.child_first_name
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_status
                      ? followup.follow_status
                      : "Not Provided"
                  }`,
                  `${
                    followup.follow_sub_status
                      ? followup.follow_sub_status
                      : "Not Provided"
                  }`,
                ]);
              });
              finObj.data = newArr;
              res.json(finObj);
            } else {
              finObj.data = newArr;
              res.json(finObj);
            }
        }
      }
    }

  } catch (err){
      helper.errorDetailsForControllers(
        err,
        "datatableFollowupFilter not working - post request",
        req.originalUrl,
        req.body,
        {},
        "redirect",
        __filename
      );
      next(err);
      return;

  }
};

exports.datatableFollowupFilter29May2023 = async (req,res,next) => {
  try{
    // console.log("req.query.sSearch_7------",req.query.sSearch_7);
    // if (req.query.next && req.query.sSearch_6 == "true") {
    //   req.query.sSearch_6 = "true";
    // } else if (req.query.sSearch_6 == "true") {

    // }
    // return;
    let zoneCount = 0;
    let newArr = [];
    let findQue = {};

    const timeZone = momentZone.tz.guess();
    // console.log(timeZone);
    // const dateByTimeZone = momentZone.tz(Date.now(), timeZone);

    // let nextOneYear = moment().add(365, 'days').calendar();

    // const startDate = momentZone.tz(Date.now(), timeZone);
    const startDate = momentZone.tz(moment().valueOf(),"Asia/Kolkata").isoWeekday(1).toDate();
    const endDate = momentZone.tz(moment().day(7).valueOf(), "Asia/Kolkata").isoWeekday(7).toDate();
    const sortingArr = ["lead_no", "createdAt", "follow_up_date" , "lead_name", "source_category", "program_id.program_name", `${req.session.user.main && req.session.user.main == req.config.admin.main ? 'center.school_display_name' : 'child_name'}`,"enq_stage","follow_status", "lead_no"];
    let aggregateQue = [
      {
        '$match': {
          'not_to_show': {
            '$ne': 1
          }
        }
      },
      {
        '$match': {
          'follow_up_date': {
            '$gte': startDate,
            '$lte': endDate
          }
        },
      },
      {
        '$lookup': {
          'from': 'leads',
          'localField': 'lead_id',
          'foreignField': '_id',
          'as': 'lead_id'
        }
      }, {
        '$unwind': {
          'path': '$lead_id',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'centers',
          'localField': 'center_id',
          'foreignField': '_id',
          'as': 'center'
        }
      }, {
        '$unwind': {
          'path': '$center',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'programs',
          'localField': 'lead_id.program_id',
          'foreignField': '_id',
          'as': 'program_id'
        }
      }, {
        '$unwind': {
          'path': '$program_id',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'follow_status': 1,
          'follow_sub_status': 1,
          'enq_stage': 1,
          'type': 1,
          'follow_up_date': 1,
          'follow_up_time': 1,
          'someday': 1,
          'no_followup': 1,
          'country_id': 1,
          'zone_id': 1,
          'center.school_name': 1,
          'center.school_display_name': 1,
          'source_category': 1,
          'lead_no': 1,
          'lead_name': 1,
          'child_name': 1,
          'lead_id._id': 1,
          'lead_id.program_id': 1,
          'program_id.program_name': 1,
          'center_id': 1,
          'createdAt': 1,
          'updatedAt': 1
        }
      },{
        '$sort': {
          [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
        }
      },
       {
        '$skip': parseInt(req.query.iDisplayStart)
      }, {
        '$limit': parseInt(req.query.iDisplayLength)
      }
    ];

    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // ADMIN
      // console.log('ADMINNNNNN___')
      let centers = await Center.find({status: "active"}).distinct('_id');
      findQue = {
        center_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'center_id': {$in: centers}
        }
      });
    } else {
      // NON ADMIN
      // console.log('NON ADMINNNNNN___')
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      // console.log(objectIdArray,"objectIdArray")

      findQue = {
        center_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'center_id': {$in: centers}
        }
      });
    }
    // console.log(req.query,"req.queryryryryyr")
    if (req.query.sSearch_4) {
      // console.log('DATE GIVEN---');
      // let start = momentZone.tz(`${req.query.sSearch_4}`,"Asia/Kolkata").startOf('day').toDate();
      // let end = momentZone.tz(`${req.query.sSearch_5}`, "Asia/Kolkata").endOf('day').toDate();
      let start = moment(req.query.sSearch_4, 'DD/MM/YYYY').toDate();
      let end = moment(req.query.sSearch_5, 'DD/MM/YYYY').endOf('day').toDate();
      // console.log("start---", req.query.sSearch_4);
      // console.log("end---", req.query.sSearch_5);

      aggregateQue = [
        {
          '$match': {
            'not_to_show': {
              '$ne': 1
            }
          }
        },
        {
          '$match': {
            'follow_up_date': {
              '$gte': start,
              '$lte': end
            }
          },
        },
        {
          '$lookup': {
            'from': 'leads',
            'localField': 'lead_id',
            'foreignField': '_id',
            'as': 'lead_id'
          }
        }, {
          '$unwind': {
            'path': '$lead_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'centers',
            'localField': 'center_id',
            'foreignField': '_id',
            'as': 'center'
          }
        }, {
          '$unwind': {
            'path': '$center',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'programs',
            'localField': 'lead_id.program_id',
            'foreignField': '_id',
            'as': 'program_id'
          }
        }, {
          '$unwind': {
            'path': '$program_id',
            'includeArrayIndex': 'string',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'follow_status': 1,
            'follow_sub_status': 1,
            'enq_stage': 1,
            'type': 1,
            'follow_up_date': 1,
            'follow_up_time': 1,
            'someday': 1,
            'no_followup': 1,
            'country_id': 1,
            'zone_id': 1,
            'center.school_name': 1,
            'center.school_display_name': 1,
            'source_category': 1,
            'lead_no': 1,
            'lead_name': 1,
            'child_name': 1,
            'lead_id._id': 1,
            'lead_id.program_id': 1,
            'program_id.program_name': 1,
            'center_id': 1,
            'createdAt': 1,
            'updatedAt': 1
          }
        }, {
          '$skip': parseInt(req.query.iDisplayStart)
        }, {
          '$limit': parseInt(req.query.iDisplayLength)
        }
      ];
      if (req.session.user.main && req.session.user.main == req.config.admin.main) {
        // ADMIN
        // console.log('ADMINNNNNN___')
        let centers = await Center.find({status: "active"}).distinct('_id');
        findQue = {
          center_id: {$in: centers}
        };
        aggregateQue.unshift({
          '$match': {
            'center_id': {$in: centers}
          }
        });
      } else {
        // NON ADMIN
        // console.log('NON ADMINNNNNN___')
        // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
        let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
        // console.log(objectIdArray,"objectIdArray")

        findQue = {
          center_id: {$in: centers},
        };
        aggregateQue.unshift({
          '$match': {
            'center_id': {$in: centers}
          }
        });
      }
    }
    if (req.query.status) {
      let status = req.query.status.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        status_id: {$in:status}
      };
      aggregateQue.unshift({
        '$match': {
          'status_id': {$in:status}
        }
      });
    }
    if (req.query.program) {
      // console.log(req.query.program,"req.program.program")
      let program = req.query.program.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        program_id: {$in:program}
      };
      aggregateQue.unshift({
        '$match': {
          'program_id': {$in:program}
        }
      });
    }
    if (req.query.know_us) {
      // console.log(req.query.know_us,"req.know_us.know_us")
      let know_us = req.query.know_us
      findQue = {
        parent_know_aboutus: {$in:know_us}
      };
      aggregateQue.unshift({
        '$match': {
          'parent_know_aboutus': {$in:know_us}
        }
      });
    }
    if (req.query.stage) {
      findQue = {
        enq_stage: req.query.stage
      };
      aggregateQue.unshift({
        '$match': {
          'enq_stage': req.query.stage
        }
      });
    }
    if (req.query.country) {
      // console.log(req.query.country,"followup.countryt");
      let country = req.query.country.map(s => mongoose.Types.ObjectId(s));
      // console.log(country,"country")
      findQue = {
        country_id: {$in: country}
      };
      aggregateQue.unshift({
        '$match': {
          'country_id': {$in: country}
        }
      });
    }

    if (req.query.zone) {
      let zone = req.query.zone.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        zone_id: {$in:zone}
      };
      aggregateQue.unshift({
        '$match': {
          'zone_id': {$in:zone}
        }
      });
    }

    if (req.query.center) {
      let center = req.query.center.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        center_id: {$in: center}
      };
      aggregateQue.unshift({
        '$match': {
          'center_id': {$in: center}
        }
      });
    }

    if (req.query.sSearch_3) {
      findQue = {
        source_category: req.query.sSearch_3
      };
      aggregateQue.unshift({
        '$match': {
          'source_category': req.query.sSearch_3
        }
      });
    }

    if (req.query.sSearch_7 == 'true') { // no followup
      findQue = {
        no_followup: 1
      };
      aggregateQue.unshift({
        '$match': {
          'no_followup': 1
        }
      });
    }

    if (req.query.sSearch) { // parent_name, // child_first_name, // lead_no
      aggregateQue.unshift({
        '$match': {
          $or: [
            {
              lead_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              child_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            }
          ]
        }
      });
    }

    // console.log(aggregateQue);

    const followUps = await Followup.aggregate(aggregateQue);
    aggregateQue.splice(aggregateQue.length - 2, 2);
    const totalCount = await Followup.aggregate(aggregateQue);
    // console.log(followUps,"followUps")
    var newLds = 0;
    totalCount.forEach((ele) => {
      (ele.is_external == 1) ? newLds++ : false;
    })
    let finObj = {
      sEcho: req.query.sEcho,
      iTotalRecords: totalCount.length,
      iTotalDisplayRecords: totalCount.length,
      newLds: newLds
    };

    // console.log(followUps);
    // console.log({
    //   '$gte': startDate,
    //   '$lte': endDate
    // });

    delete aggregateQue;
    // console.log(followUps,"follou")
    if (followUps.length) {
      finObj.data = followUps;
      return res.json(finObj);
    } else {
      finObj.data = newArr;
      return res.json(finObj);
    }
  } catch (err){
    // console.log(err)
      helper.errorDetailsForControllers(
        err,
        "datatableFollowupFilter not working - post request",
        req.originalUrl,
        req.body,
        {},
        "redirect",
        __filename
      );
      next(err);
      return;

  }
}

exports.datatableFollowupFilter = async (req, res, next) => {
  try {

    // -------------------------FOLLOWUP PAGE ----------------------------;
    // console.log('AAAAAAAAAAA');
    const timeZone = momentZone.tz.guess();

    const currentDate = moment().tz("Asia/Kolkata");
    const startOfWeek = currentDate.clone().startOf('isoWeek');
    const endOfWeek = currentDate.clone().endOf('isoWeek');

    // console.log('Start of the week:', startOfWeek.format('YYYY-MM-DD'));
    // console.log('End of the week:', endOfWeek.format('YYYY-MM-DD'));
    const startDate = startOfWeek.toDate();
    const endDate = endOfWeek.toDate();
    const dtBgin = new Date("2023-01-01");
    // console.log("startDate-------", startDate);
    // console.log("endDate-------", endDate);
    // console.log("req.body", req.body);
    const sortingArr = [" ", "lead_no_val", "lead_date", "updatedAt", "parent_name", "child_first_name", "child_last_name", "stage", "type", `${req.session.user.main && req.session.user.main == req.config.admin.main ? 'school_id.school_display_name' : 'child_first_name'}`, "parent_know_aboutus", "source_category", "programcategory_id.title", "program_id.program_name", "status_id.name","substatus_id.name","lead_no"];
    let zoneCount = 0;
    let newArr = [];
    let findQue = {};
    let aggregateQue = [
      {
        '$match': {
          'do_followup': 1
        }
      },
      {
        '$match': {
          'follow_due_date': {
            '$gte': dtBgin,
            '$lte': endDate
          }
        }
      },
      {
        '$lookup': {
          'from': 'statuses',
          'localField': 'status_id',
          'foreignField': '_id',
          'as': 'status_id'
        }
      }, 
      {
        '$lookup': {
          'from': 'substatuses',
          'localField': 'substatus_id',
          'foreignField': '_id',
          'as': 'substatus_id'
        }
      },
      {
        '$unwind': {
          'path': '$substatus_id',
          // 'includeArrayIndex': 'string',
          // 'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
          'path': '$status_id',
          // 'includeArrayIndex': 'string',
          // 'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'centers',
          'localField': 'school_id',
          'foreignField': '_id',
          'as': 'school_id'
        }
      }, {
        '$unwind': {
          'path': '$school_id'
        }
      }, {
        '$lookup': {
          'from': 'programcategories',
          'localField': 'programcategory_id',
          'foreignField': '_id',
          'as': 'programcategory_id'
        }
      }, {
        '$unwind': {
          'path': '$programcategory_id'
        }
      }, {
        '$lookup': {
          'from': 'programs',
          'localField': 'program_id',
          'foreignField': '_id',
          'as': 'program_id'
        }
      }, {
        '$unwind': {
          'path': '$program_id',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$addFields': {
          'lead_no_val': {
            '$toInt': {
              '$substr': ["$lead_no", 2, -1]
            }
          }
        }
      }, {
        '$project': {
          'lead_no': 1,
          'lead_date': 1,
          'createdAt': 1,
          'updatedAt': 1,
          'parent_name': 1,
          'child_first_name': 1,
          'child_last_name': 1,
          'stage': 1,
          'type': 1,
          'school_id._id': 1,
          'school_id.school_display_name': 1,
          'school_id.zone_id': 1,
          'zone_id': 1,
          'source_category': 1,
          'parent_know_aboutus': 1,
          'programcategory_id.title': 1,
          'program_id.program_name': 1,
          'status_id.name': 1,
          'substatus_id.name':1,
          'follow_due_date': 1,
          'follow_due_time': 1,
          'is_external': 1,
          'is_dup': 1,
          'dup_no': 1,
          'lead_no_val': 1
        }
      }, {
        '$sort': {
          [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
        }
      }, {
        '$skip': parseInt(req.query.iDisplayStart)
      }, {
        '$limit': parseInt(req.query.iDisplayLength)
      }
    ];

    // console.log(aggregateQue, "aggregateQue")
    // const currentDateByTimeZone = momentZone.tz(Date.now(), timeZone);

    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // ADMIN
      // console.log('ADMINNNNNN___')
      let centers = await Center.find({status: "active"}).distinct('_id');
      findQue = {
        school_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {"$in": centers}
        }
      });
    } else {
      // NON ADMIN
      // console.log('NON ADMINNNNNN___')
      // console.log(req.session.user.center_id,'req.session.user.center_id')
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      // console.log(centers,"------------objectIdArray")
      findQue = {
        school_id: {$in: centers}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {"$in": centers}
        }
      });
    }
    // console.log(req.query,"req.queryryryryyr")
    if (req.query.zone) {
      // console.log(req.query.sSearch_1,"req.query.sSearch_1")
      let zone = req.query.zone.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        zone_id: {$in:zone}
      };
      aggregateQue.unshift({
        '$match': {
          'zone_id': {$in:zone}
        }
      });
    }

    if (req.query.program) {
      // console.log(req.query.program,"req.program.program")
      let program = req.query.program.map(s => mongoose.Types.ObjectId(s));
      // console.log(zone,"zone")
      findQue = {
        program_id: {$in:program}
      };
      aggregateQue.unshift({
        '$match': {
          'program_id': {$in:program}
        }
      });
      // console.log(JSON.stringify(aggregateQue));
    }
    // console.log(aggregateQue,"aggregateQue")
    if (req.query.know_us) {
      // console.log(req.query.know_us,"req.know_us.know_us")
      let know_us = req.query.know_us
      findQue = {
        parent_know_aboutus: {$in:know_us}
      };
      aggregateQue.unshift({
        '$match': {
          'parent_know_aboutus': {$in:know_us}
        }
      });
    }

    if (req.query.sSearch_4) {
      // console.log('DATE GIVEN---');
      // console.log('DATE GIVEN---');
      // let start = momentZone.tz(`${req.query.sSearch_4}`,"Asia/Kolkata").startOf('day').toDate();
      // let end = momentZone.tz(`${req.query.sSearch_5}`, "Asia/Kolkata").endOf('day').toDate();
      let start = moment(req.query.sSearch_4, 'YYYY/MM/DD').toDate();
      let end = moment(req.query.sSearch_5, 'YYYY/MM/DD').endOf('day').toDate();
      // console.log("start---", req.query.sSearch_4);
      // console.log("end---", req.query.sSearch_5);
      findQue = {
        follow_due_date: {
          '$gte': start,
          '$lte': end
        }
      }
      _.remove(aggregateQue, '$match.follow_due_date');
      // console.log(aggregateQue)
      aggregateQue.unshift({
        '$match': {
          'follow_due_date': {
            '$gte': start,
            '$lte': end
          }
        }
      });
      // _.reject(aggregateQue, '$match.lead_date');
      // console.log("DATATATTAATATAAT")
      // console.log(JSON.stringify(aggregateQue))
    }

    if (req.query.Searchkey_0 == 'true') { // no followup
      findQue = {
        do_followup: 0
      };
      // console.log(aggregateQue)
      _.remove(aggregateQue, '$match.do_followup');
      _.remove(aggregateQue, '$match.follow_due_date');
      aggregateQue.unshift({
        '$match': {
          'do_followup': 0
        }
      });
    }

    if (req.query.Searchkey_1 == "true") {
      findQue = {
        someday_follow: 0
      };
      // console.log(aggregateQue)
      _.remove(aggregateQue, '$match.do_followup');
      _.remove(aggregateQue, '$match.follow_due_date');
      aggregateQue.unshift({
        '$match': {
          'someday_follow': 0
        }
      });
    }

    if (req.query.country) {
      // console.log(req.query.sSearch_0,"req.query.sSearch_0")
      // console.log(req.query.country,"req.query.country")
      // return;
      let country = req.query.country.map(s => mongoose.Types.ObjectId(s));
      // console.log(country,"country")

      findQue = {
        country_id: {$in: country}
      };
      aggregateQue.unshift({
        '$match': {
          'country_id': {$in: country}
        }
      });
    }

    if (req.query.center) {
      let center = req.query.center.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        school_id: {$in:center}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {$in:center}
        }
      });
    }
    if (req.query.status) {
      let status = req.query.status.map(s => mongoose.Types.ObjectId(s));
      // console.log(center,"center")
      findQue = {
        status_id: {$in:status}
      };
      aggregateQue.unshift({
        '$match': {
          'status_id': {$in:status}
        }
      });
    }
    if (req.query.substatus) {
      // console.log(center,"center")
      findQue = {
        substatus_id:  mongoose.Types.ObjectId(req.query.substatus)
      };
      aggregateQue.unshift({
        '$match': {
          'substatus_id': mongoose.Types.ObjectId(req.query.substatus)
        }
      });
    }
    if (req.query.sSearch_3) {
      findQue = {
        source_category: req.query.sSearch_3
      };
      aggregateQue.unshift({
        '$match': {
          'source_category': req.query.sSearch_3
        }
      });
    }
    if (req.query.sSearch_6) {
      // console.log(req.query.sSearch_6,"req.query.sSearch_6req.query.sSearch_6")
      findQue = {
        stage: req.query.sSearch_6
      };
      aggregateQue.unshift({
        '$match': {
          'stage': req.query.sSearch_6
        }
      });
    }

    if (req.query.sSearch) { // parent_name, // child_first_name, // lead_no
      // findQue = {
      //   source_category: req.query.sSearch_4
      // };
      // console.log(req.query.sSearch,"sSearcfg")
      aggregateQue.unshift({
        '$match': {
          $or: [
            {
              parent_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              child_first_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              parent_first_contact: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            },
            {
              parent_email: {
                $regex: req.query.sSearch,
                $options: 'i'
              }
            }
          ]
        }
      });
    }

    // console.log(aggregateQue,"aggregateQue");

    const leads = await Lead.aggregate(aggregateQue);

    aggregateQue.splice(aggregateQue.length - 2, 2);

    const totalCount = await Lead.aggregate(aggregateQue);

    var newLds = 0;
    totalCount.forEach((ele) => {
      (ele.is_external == 1) ? newLds++ : false;
    })
    let finObj = {
      sEcho: req.query.sEcho,
      iTotalRecords: totalCount.length,
      iTotalDisplayRecords: totalCount.length,
      newLds: newLds
    };

    delete aggregateQue;

    if (leads.length) {
      finObj.data = leads;
      return res.json(finObj);
    } else {
      finObj.data = newArr;
      return res.json(finObj);
    }
  } catch (err) {
    // console.log(err,"err")
    helper.errorDetailsForControllers(
      err,
      "datatableFilter not working - post request",
      req.originalUrl,
      req.body,
      {},
      "redirect",
      __filename
    );
    next(err);
    return;
  }
};

exports.datatableFollowupFilterBK = async (req,res,next) => {
  try{
    let newArr = [];
    const timeZone = momentZone.tz.guess();
    // console.log(timeZone);
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

    let nextOneYear = moment().add(365, 'days').calendar();

    const startDate = momentZone.tz(Date.now(), "Asia/Kolkata");
    const endDate = momentZone.tz(new Date(nextOneYear), "Asia/Kolkata");

    // console.log("startDate---", startDate);
    // console.log("endDate---", endDate);
    // return;

    // console.log(req.session.user._id,"user_id")
    // console.log(req.query,"req,query followup")
    // console.log(req.query.sSearch_2,"req,query date")
    if(req.session.user && req.session.user.main == req.config.admin.main){
      const followups = await Followup.find({
        follow_up_date: {
          $gte: startDate,
          $lte: endDate
        }
      })
          .populate({
            path: "lead_id",
            select: {
              lead_no: 1,
              parent_name: 1,
              school_id: 1,
              program_id: 1,
              source_category: 1
            },
            populate: {
              path: "school_id",
              select: {
                school_display_name: 1
              }
            }
          })
          .populate({
            path: "lead_id",
            select: {
              lead_no: 1,
              parent_name: 1,
              school_id: 1,
              program_id: 1,
              source_category: 1
            },
            populate: {
              path: "program_id",
              select: {
                program_name: 1
              }
            }
          })
          .sort({ follow_up_date: req.responseAdmin.DESC })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
          let totalCountDoc = await Followup.countDocuments({
            follow_up_date: {
              $gte: startDate,
              $lte: endDate
            }
          });
          // console.log(followups,"followups");
          // return;
          let finObj = {
            sEcho: req.query.sEcho,
            iTotalRecords: totalCountDoc,
            iTotalDisplayRecords: totalCountDoc,
          };
          // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
          // console.log(finObj);
          if (followups.length) {
            followups.map((followup) => {
              newArr.push([
                `<a href="#" onclick="redirectToEditfollowup('${followup._id}')">${
                  followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                }</a>`,
                `${
                  followup.createdAt
                    ? moment(followup.createdAt).format("L")
                    : "Not Provided"
                }`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).fromNow()
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.parent_name
                    ? followup.lead_id.parent_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.source_category
                    ? followup.lead_id.source_category
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.program_id
                    ? followup.lead_id.program_id.program_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.school_id
                    ? followup.lead_id.school_id.school_display_name
                    : "Not Provided"
                }`,
                `${
                  followup.enq_stage
                    ? followup.enq_stage
                    : "Not Provided"
                }`,
                `${
                  followup.follow_status
                    ? followup.follow_status
                    : "Not Provided"
                }`,
              ]);
            });
            finObj.data = newArr;
            res.json(finObj);
          } else {
            finObj.data = newArr;
            res.json(finObj);
          }
    } else {
      const followups = await Followup.find({
        center_id: req.session.user.center_id,
        follow_up_date: {
          $gte: startDate,
          $lte: endDate
        }
      })
          .sort({ follow_up_date: req.responseAdmin.DESC })
          .populate({
            path: "lead_id",
            select: {
              lead_no: 1,
              parent_name: 1,
              school_id: 1,
              program_id: 1,
              source_category: 1,
              child_first_name: 1,
              child_last_name: 1,
            },
            populate: {
              path: "school_id",
              select: {
                school_display_name: 1
              }
            }
          })
          .populate({
            path: "lead_id",
            select: {
              lead_no: 1,
              parent_name: 1,
              school_id: 1,
              program_id: 1,
              source_category: 1
            },
            populate: {
              path: "program_id",
              select: {
                program_name: 1
              }
            }
          })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));

          const permissionEditFollowUp = handlers.checkPermission(req.session.user, req.permissionCacheData, "FollowUpEdit");

          let totalCountDoc = await Followup.countDocuments({
            center_id: req.session.user.center_id,
            follow_up_date: {
              $gte: startDate,
              $lte: endDate
            }
          });
          // console.log(followups,"followups");
          // return;
          let finObj = {
            sEcho: req.query.sEcho,
            iTotalRecords: totalCountDoc,
            iTotalDisplayRecords: totalCountDoc,
          };
          // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
          // console.log(finObj);
          if (followups.length) {
            followups.map((followup) => {
              newArr.push([
                `<a href="#" onclick="${permissionEditFollowUp ? `redirectToEditfollowup('${followup._id}')` : 'javascript:void(0);'}">${
                  followup.lead_id ? followup.lead_id.lead_no : "Not Provided"
                }</a>`,
                `${
                  followup.createdAt
                    ? moment(followup.createdAt).format("L")
                    : "Not Provided"
                }`,
                `${
                  followup.follow_up_date
                    ? moment(followup.follow_up_date).fromNow()
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.parent_name
                    ? followup.lead_id.parent_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.source_category
                    ? followup.lead_id.source_category
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.program_id
                    ? followup.lead_id.program_id.program_name
                    : "Not Provided"
                }`,
                `${
                  followup.lead_id && followup.lead_id.child_first_name
                    ? `${followup.lead_id.child_first_name} ${followup.lead_id.child_last_name}`
                    : "Not Provided"
                }`,
                `${
                  followup.enq_stage
                    ? followup.enq_stage
                    : "Not Provided"
                }`,
                `${
                  followup.follow_status
                    ? followup.follow_status
                    : "Not Provided"
                }`,
              ]);
            });
            finObj.data = newArr;
            res.json(finObj);
          } else {
            finObj.data = newArr;
            res.json(finObj);
          }

    }

  } catch (err){
      helper.errorDetailsForControllers(
        err,
        "datatableFollowupFilter not working - post request",
        req.originalUrl,
        req.body,
        {},
        "redirect",
        __filename
      );
      next(err);
      return;

  }
};

exports.filterDropdown = async (req, res, next) => {
  try {
    // console.log('HAHAHAHAHAHHA----------------');
    // console.log(req.session.user);
    if (req.body.adminCheck) {
      // Admin hai
      // console.log('admin hai');
      return;
    } else {
      // Admin nahi hai
      const datas = await ViewOption.findOne({
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

      return res.status(200).json({
        message: "All countries according to user",
        data: datas,
        code: 200
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "filterDropdown not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};
exports.allMessage = async (req,res,next) => {
  try{
    // console.log(req.params,"111111111")
    // return;
    let lead_id = req.params.id.split("|")[0]
    let check  = req.params.id.split("|")[1]
    let num_email  = req.params.id.split("|")[2]
    let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      // console.log(objectIdArray,"objectIdArray")

    // console.log(num_email,"num_email")
    // return;
    if (req.session.user.main && req.session.user.main == req.config.admin.main){
      let messages = await Message.find({});
      // console.log(messages,"messages")
      return res.render("admin/all-direct-message", {
        title: "All Message",
        user_type: req.session.user && req.session.user.main ? 1 : 0,
        messages,
        lead_id,
        check,
        num_email,
        admin_check : "super_admin"
      });
    }else{
      let messages = await Message.find({$or:[{center_id: {$in: objectIdArray}},{added_by:1}]});
      // console.log(messages,"messages not admin")
      return res.render("admin/all-direct-message", {
        title: "All Message",
        user_type: req.session.user && req.session.user.main ? 1 : 0,
        messages,
        lead_id,
        check,
        num_email,
        admin_check : "non_admin"
      });
    }
  }catch (err){
    helper.errorDetailsForControllers(err, "allmessage not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.messageDatatable = async (req,res,next) => {
  try {
    // console.log("params-----------------------------")
    let newArr = [];
    // console.log(req.body.adminCheck, "req.body");
    // console.log(req.query, "req.queryquery");
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      const sortingArr = ["title", "createdAt", "employee"];
      // console.log("admin");

      if (req.query.sSearch) {
        const messages = await Message.aggregate([
          {
            $match: {
              status: "active",
            },
          },
          {
            $lookup: {
              from: "employees",
              localField: "createdBy",
              foreignField: "_id",
              as: "employee",
            }
          },
          {
            $match: {
              $or:[
                {
                  title: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                },
                {
                  employee: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                }
              ]
            }
          },
          // {
          //   $lookup: {
          //     from: "responses",
          //     localField: "_id",
          //     foreignField: "msg_id",
          //     as: "total",
          //   },
          // },
          // {
          //   $unwind: {
          //     path: "$total",
          //     preserveNullAndEmptyArrays: true,
          //   },
          // },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          },
        ])
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));

        let totalCountDoc = await Message.countDocuments();
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            // newArr.push([
            //   `<a href="#" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
            //   }</a>   <br> ${message.msg ? short : "Not Provided"}`,
            // ]);
            if(message.attachment && message.attachment.length){
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> <span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span> `, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }else{
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> `, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }

      } else {
        const messages = await Message.aggregate([
          {
            $match: {
              status: "active",
            },
          },
          {
            $lookup: {
              from: "employees",
              localField: "createdBy",
              foreignField: "_id",
              as: "employee",
            }
          },
          // {
          //   $lookup: {
          //     from: "responses",
          //     localField: "_id",
          //     foreignField: "msg_id",
          //     as: "total",
          //   },
          // },
          // {
          //   $unwind: {
          //     path: "$total",
          //     preserveNullAndEmptyArrays: true,
          //   },
          // },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          },
        ])
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
        // console.log(messages,"messages")
        let totalCountDoc = await Message.countDocuments();
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            // newArr.push([
            //   `<a href="#" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
            //   }</a>   <br> ${message.msg ? short : "Not Provided"}`,
            // ]);
            if(message.attachment && message.attachment.length){
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> <span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span> `, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }else{
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> `, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }

    } else {
      const sortingArr = ["title", "createdAt", "employee"];
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');

      if (req.query.sSearch) {
        const messages = await Message.aggregate([
          {
            $match: {
              status: "active",
              $or:[
                {center_id:  {$in: centers}},
                {added_by:1}
              ]
            },
          },
          {
            $match: {
              $or:[
                {
                  title: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                },
                {
                  employee: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                }
              ]
            }
          },
          {
            $lookup: {
              from: "employees",
              localField: "createdBy",
              foreignField: "_id",
              as: "employee",
            }
          },
          {
            $lookup: {
              from: "responses",
              // localField: "_id",
              // foreignField: "msg_id",
              let: { id: '$_id' },
                pipeline: [
                    // { $match: { condition: { $exists: true },code:{$exists: true},category: { $exists: true },percentage:{$exists: true} } },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$msg_id', '$$id'] },
                                    { $in: ['$center_id', centers] }
                                ]
                            }
                        }
                    }
                ],
              as: "total",
            },
          },
          {
            $unwind: {
              path: "$total",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          },
        ])
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));

        let totalCountDoc = await Message.countDocuments({$or:[{center_id: {$in: centers}},{added_by:1}]});
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            // newArr.push([
            //   `<a href="#" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
            //   }</a>  <i class="fa fa-paperclip" style="float:right;"></i>   ${message.total ? `(sent ${message.total.sent_count} times)` : "(Not yet sent)"}   <br> ${message.msg ? short : "Not Provided"}`,
            // ]);
            if(message.attachment && message.attachment.length){
              // newArr.push([
              //   `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
              //   }</a><span onclick="redirectTodownload('${message.attachment}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `,`${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              // ]);
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a><span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }else{
              // newArr.push([
              //   `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
              //   }</a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `, `${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              // ]);
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      } else {
        const messages = await Message.aggregate([
          {
            $match: {
              status: "active",
              $or:[
                {center_id:  {$in: centers}},
                {added_by:1}
              ]
            },
          },
          {
            $lookup: {
              from: "employees",
              localField: "createdBy",
              foreignField: "_id",
              as: "employee",
            }
          },
          {
            $lookup: {
              from: "responses",
              // localField: "_id",
              // foreignField: "msg_id",
              let: { id: '$_id' },
                pipeline: [
                    // { $match: { condition: { $exists: true },code:{$exists: true},category: { $exists: true },percentage:{$exists: true} } },
                    {

                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$msg_id', '$$id'] },
                                    { $in: ['$center_id', centers] }
                                ]
                            }
                        }
                    }
                ],
              as: "total",
            },
          },
          {
            $unwind: {
              path: "$total",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          },
        ])
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));

        let totalCountDoc = await Message.countDocuments({$or:[{center_id: {$in: centers}},{added_by:1}]});
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="#" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            // newArr.push([
            //   `<a href="#" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
            //   }</a>  <i class="fa fa-paperclip" style="float:right;"></i>   ${message.total ? `(sent ${message.total.sent_count} times)` : "(Not yet sent)"}   <br> ${message.msg ? short : "Not Provided"}`,
            // ]);
            if(message.attachment && message.attachment.length){
              // newArr.push([
              //   `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
              //   }</a><span onclick="redirectTodownload('${message.attachment}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `,`${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              // ]);
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a><span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }else{
              // newArr.push([
              //   `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
              //   }</a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `, `${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              // ]);
              newArr.push([
                `<a href="javascript:void(0);" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY ") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`
              ]);
            }
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allmessagedatatable not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.messageDeatil = async (req,res,next) => {
  try{
    // console.log(req.params.id.split("|")[2],"paramoyy");
    // return;
    let lead_id = req.params.id.split("|")[1];
    let message_id = req.params.id.split("|")[0];
    let check = req.params.id.split("|")[2];
    let num_email = req.params.id.split("|")[3];
    const message = await Message.findOne({_id:message_id})
    const lead = await Lead.findOne({_id:lead_id})

    // console.log(lead,"lead");
    // console.log(message,"message")
    return res.render("admin/direct-message", {
      title: "Send Message",
      user_type: req.session.user && req.session.user.main ? 1 : 0,
      message,
      lead,
      check,
      num_email
    });
  }catch (err){
    helper.errorDetailsForControllers(err, "messageDeatil not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}
exports.addMessage = async (req,res,next) => {
  try{
    // console.log(req.body,"req.body,addmessage")
    // console.log(req.params,"papapap")
    let lead_id = req.params.id.split("|")[0];
    let check = req.params.id.split("|")[1];
    const newMsg = new Message({
      title: req.body.msg_title,
      msg: req.body.msg_desc,
      type: req.body.mssg,
      status: req.body.status,
      viewoption: req.session.user.view_option,
      center_id: req.session.user.center_id,
      added_by: req.session.user.main && req.session.user.main == req.config.admin.main ? 1 : 0
    });
    await newMsg.save();
    let message = await Message.findOne({title:req.body.msg_title,msg:req.body.msg_desc,type: req.body.mssg})
    // console.log(message,"message7777777")
    res.redirect(`/admin/lead/send/${message._id}|${lead_id}|${check}`)

  }catch (err){
    helper.errorDetailsForControllers(err, "messageDeatil not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.readWelcomeEmail = async (req, res, next) => {
  try {
    const obj  = {
      user: "rahulgupta0992@gmail.com",
      subject: "Thank You Email",
      msg: {},
      filename: "email-welcome-lead",
      title: "Thank You Email",
    };
    res.render('admin/email-tour-booked-lead', {
      title: "Welcome Email"
    })
  } catch (err) {
    console.log('ERROR caused in read welcome email -----');
    console.log(err);
    return;
  }
};
exports.postEditZoneFilter = async (req,res,next) => {
    try{
      // console.log(req.body,"req.body,addmessage")

      let zones = await Zone.find({country_id:{$in:req.body.type}});
      let centers = await Center.find({country_id:{$in:req.body.type}, status: "active"}, { school_name: 1, school_display_name: 1 });
      // console.log(zones,"zones")
      return res.status(200).json({
        message: "Zones",
        data: zones,
        centers,
        code: 200
      });


    }catch (err){
      helper.errorDetailsForControllers(err, "messageDeatil not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
      next(err);
      return;
    }
  };
exports.postEditCenterFilter = async (req,res,next) => {
  try{
    // console.log(req.body,"req.body,center")

    let centers = await Center.find({zone_id:{$in:req.body.type}, status: "active"});
    // console.log(centers,"centers")
    return res.status(200).json({
      message: "centers",
      data: centers,
      code: 200
    });


  }catch (err){
    helper.errorDetailsForControllers(err, "messageDeatil not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};
exports.getViewLead = async (req,res,next) => {
  try{
    // console.log(req.params.lead_id , "req.paramsss")
    const lead = await Lead.findOne({ _id: req.params.lead_id })
    .populate("programcategory_id")
    .populate("program_id")
    .populate("parent_country")
    .populate("parent_state")
    .populate("parent_city")
    .populate("status_id")
    .populate("substatus_id")
    .populate("school_id")
    .populate("zone_id")
    .populate("country_id")

    // console.log(lead,"final_lead")
    res.render("admin/view-lead", {
      title: "View Lead Details",
      lead,
      moment
    });
    return;


  } catch (err){
    helper.errorDetailsForControllers(err, "getViewLead not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getCenterAccordingToUser = async (req, res, next) => {
  try {
    let centers = [];
    if (req.body.adminCheck) {
      // admin
      centers = await Center.find({ status: "active" }, { school_name: 1, school_display_name: 1 });
      return res.status(200).json({
        message: "Centers for admin",
        data: centers || [],
        code: 200
      });
    } else {
      // non-admin
      centers = await ViewOption.findOne({
        _id: req.session.user.view_option,
      }, { centers: 1 })
      .populate({
        path: 'centers',
        select: {
          school_name: 1,
          school_display_name: 1
        }
      });
      return res.status(200).json({
        message: "Centers for non-admin",
        data: centers.centers || [],
        code: 200
      });
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getCenterAccordingToUser not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postTransferLead = async (req, res, next) => {
  try {
    if (!req.body.center_id) {
      req.flash('error', 'Invalid center provided. Please try again.');
      res.redirect('back');
      return;
    }
    if (!req.body.pro_cat) {
      req.flash('error', 'Invalid program category provided. Please try again.');
      res.redirect('back');
      return;
    }
    const lead = await Lead.findOne({ _id: req.body.lead_id });
    const center = await Center.findOne({ _id: req.body.center_id });

    // 1. find view options & replace _id on existing lead
    // 2. update lead
    // 3. update many followup
    // 4. add new followup

    const viewOptions = await ViewOption.find({ centers: {
      $in: [req.body.center_id]
    } });

    lead.programcategory_id = req.body.pro_cat || null;
    lead.program_id = req.body.pro || null;
    lead.viewoption = viewOptions.length ? viewOptions[0]._id : null || null;
    lead.school_id = req.body.center_id || null;
    lead.zone_id = center.zone_id;
    lead.country_id = center.country_id;
    lead.comm_mode_latest = "";

    await lead.save(async (err, result) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('back');
        return;
      }
      const updateFollowUps = await Followup.updateMany(
        { lead_id: mongoose.Types.ObjectId(req.body.lead_id) },
        {
          $set: {
            center_id: mongoose.Types.ObjectId(req.body.center_id),
            program_id: mongoose.Types.ObjectId(req.body.pro),
            country_id: lead.country_id,
            zone_id: lead.zone_id
          }
        },
        { multi: true }
      ).exec(async (err, finalRes) => {
        if (err) {
          console.log(err);
          req.flash('error', 'Something went wrong. Please try again later.');
          res.redirect('back');
          return;
        }

        // const followups = await Followup
        //   .find({ lead_id: req.body.lead_id })
        //   .sort({ follow_up_date: -1 });

        // console.log(moment(followups[0].follow_up_date).add(1, 'days'))
        const followupsOrder = await Followup.countDocuments({ lead_id: req.params.lead_id });

        const newFollowUp = new Followup({
          status_id: "643d129984abb0ac02beacc6",
          follow_status: "Lead Transfered",
          follow_sub_status: "Lead Transfered",
          substatus_id: "643d131b84abb0ac02beacc9",
          action_taken: [],
          enq_stage: "-",
          program_id: null,
          parent_know_aboutus: [],
          type: "",
          notes: `Lead Transfered from ${req.body.old_center_name}`,
          // follow_up_date: moment(followups[0].follow_up_date).add(1, 'days').format(),
          follow_up_date: Date.now(),
          follow_up_time: "11:00 AM",
          date_sort: moment().format(),
          remark: req.body.remark || "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
          lead_id: req.body.lead_id,
          center_id: req.body.center_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id || null,
          zone_id: lead.zone_id || null,
          source_category: "",
          lead_no: lead.lead_no,
          lead_name: lead.parent_name || "",
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 0,
          not_to_show: 1,
          comm_mode: "",
          order: followupsOrder + 1
        });

        await newFollowUp.save();

        return res.status(200).json({
          message: "Lead transfered",
          data:[],
          code: 200
        })
      });
    })

  } catch (err) {
    helper.errorDetailsForControllers(err, "postTransferLead not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getLeadsAccordingToUser = async (req, res, next) => {
  try {
    // console.log(req.query);
    let leads = [];
    let totalRecords;
    const page = req.query.page || 1;
    const limit = 1;
    const skip = (page * limit) - limit;

    if (req.body.adminCheck) {
      // admin
      if (req.query.q) {
        leads = await Lead.find({
          $or: [
            {
              child_first_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              parent_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
          ]
        }, {
          parent_name: 1,
          child_first_name: 1,
          lead_no: 1,
          child_last_name: 1
        })
        // .skip(skip)
        // .limit(limit);

        totalRecords = await Lead.countDocuments({$or: [
          {
            child_first_name: {
              $regex: req.query.q,
              $options: 'i'
            }
          },
          {
            child_last_name: {
              $regex: req.query.q,
              $options: 'i'
            }
          },
          {
            parent_name: {
              $regex: req.query.q,
              $options: 'i'
            }
          },
          {
            lead_no: {
              $regex: req.query.q,
              $options: 'i'
            }
          },
        ]});
      } else {
        leads = await Lead
          .find({}, {
            parent_name: 1,
            child_first_name: 1,
            lead_no: 1,
            child_last_name: 1
          })
          // .skip(skip)
          // .limit(limit);

        totalRecords = await Lead.countDocuments();
      }
    } else {
      // console.log('ADMIN NON-LOGIN');
      // non-admin
      let objectIdArr = req.session.user.center_id.map(id => mongoose.Types.ObjectId(id));
      if (req.query.q) {
        leads = await Lead.find({
          school_id: {
            $in: objectIdArr
          },
          $or: [
            {
              child_first_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              parent_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
          ]
        }, {
          parent_name: 1,
          child_first_name: 1,
          lead_no: 1,
          child_last_name: 1
        });

        totalRecords = await Lead.countDocuments({
          school_id: {
            $in: objectIdArr
          },
          $or: [
            {
              child_first_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              parent_name: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.query.q,
                $options: 'i'
              }
            },
          ]});
      } else {
        leads = await Lead.find({
          school_id: {
            $in: objectIdArr
          }
        }, {
          parent_name: 1,
          child_first_name: 1,
          lead_no: 1,
          child_last_name: 1
        });

        totalRecords = await Lead.countDocuments({
          school_id: {
            $in: objectIdArr
          }});
      }
    }
    return res.status(200).json({
      total_count: totalRecords,
      items: leads.map(lead => ({ id: lead._id, name: `${lead.child_first_name ? `Child Name: ${lead.child_first_name} ${lead.child_last_name} / ` : ""}Lead No. ${lead.lead_no} / Parent Name: ${lead.parent_name}` })) || []
    })
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      message: "Something went wrong",
      data: null,
      code: 400
    })
  }
};

exports.getCreateExistingLeadWithOldLead = async (req, res, next) => {
  try {
    const oldLead = await Lead.findOne({ _id: req.params.old_lead });
    if (oldLead) {
      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      const StatusCollection = mongoose.connection.db.collection("statuses");
      const SubstatusCollection = mongoose.connection.db.collection("substatuses");
      const ActionCollection = mongoose.connection.db.collection("actionplanneds");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();
      const statusesPromise = StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e")]} }).sort({
        order: 1
      }).toArray();
      const substatusesPromise = SubstatusCollection.find({_id: {$nin :[ObjectId("64394c0cb858bfdf6844e973"), ObjectId("64394c1bb858bfdf6844e974"), ObjectId("643d131b84abb0ac02beacc9"), ObjectId("652654e9d072d7ac1a6f0231"), ObjectId("652654fed072d7ac1a6f0232") ]} }).toArray();
      const programs = await Program.find({ status: req.responseAdmin.ACTIVE });
      const programcategorys = await Programcategory.find({
        status: req.responseAdmin.ACTIVE,
      });
      const actionPromise = await ActionCollection.find({
        status: "active",
      }).sort({
        order: 1
      }).toArray();
      const [statuses, knowuss, actions, substatuses] = await Promise.all([
        statusesPromise,
        knowussPromises,
        actionPromise,
        substatusesPromise
      ]);

      if (req.session.user.main &&  req.session.user.main == req.config.admin.main) {
        // admin
        const employees = await Country.find({ status: 'Active' });
        const country_ids = await Country.findOne({ _id: oldLead.parent_country });
        const centers = await Center.find({ status: "active" });
        const states = await State.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        const citys = await City.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);

        return res.render('admin/add-existing-lead', {
          title: "Add Siblings lead",
          oldLead,
          programs,
          programcategorys,
          knowuss,
          statuses,
          substatuses,
          actions,
          centers,
          states,
          citys,
          employees,
          moment,
          type: "super_admin",
        });
      } else {
        // non-admin
        const employees = await Employee.getCountriesAccordingToViewOption(req.session.user._id);
        const viewOption = await ViewOption.findOne({
          _id: req.session.user.view_option,
        });
        const centers = await Center.find({ _id: { $in: viewOption.centers }, status: "active"});
        const country_ids = await Country.findOne({ _id: oldLead.parent_country });
        const states = await State.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        const citys = await City.aggregate([
          {
            $match: {
              country_id: country_ids
                ? country_ids.country_id
                : { $exists: false },
            },
          },
        ]);
        return res.render("admin/add-existing-lead", {
          title: "Add Lead",
          oldLead,
          programs,
          programcategorys,
          knowuss,
          statuses,
          substatuses,
          actions,
          centers,
          states,
          citys,
          employees,
          moment,
          type: "non_admin"
        });
      }
    } else {
      req.flash('error', 'Something went wrong! Try again later.');
      res.redirect('/');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getCreateExistingLeadWithOldLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postCreateExistingLeadWithOldLead = async (req, res, next) => {
  try {
    const oldLead = await Lead.findOne({  _id: req.params.old_lead });
    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");

    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    if (req.body.lead_type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;

      if (req.body.secondary_first_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_Second_contact == "on") {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    const zone = await Center.findOne({ _id: req.body.school_id });

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const leadWithLeadNumber = await Lead.findOne({
      lead_no: `LD${randomNumber}`
    });

    if (true) {
      if (req.session.user.main && req.session.user.main == req.config.admin.main) {
        // admin
        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          viewoption: req.session.user.view_option,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 1,
          is_related: oldLead._id,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        oldLead.sibling = 1;
        oldLead.is_related = newLead._id;
        await oldLead.save();
        if (req.body.lead_type == "lead") {
          // send mail for type lead
          await mail.send({
            user: req.body.parent_email,
            subject: `Welcome to Kido International Preschool & Daycare`,
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              activities: zone.activities_portal || "",
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-welcome-lead",
            title: `KIDO India`,
          });
        }
      if (req.body.stage == "Post Tour") {
        // if stage in Post Tour, then send mail
        // mail sent
        await mail.send({
          user: req.body.parent_email,
          subject: "Thank you for visiting Kido International Preschool & Daycare",
          msg: {
            lead_name: req.body.parent_name || "",
            center_name: zone.school_display_name || "",
            center_main_name: zone.school_name || "",
            center_area: zone.area || "",
            sal: zone.cor_sal || "",
            spoc: zone.cor_spoc || "",
            email: zone.email_id || "",
            whatsapp: zone.whatsapp_number,
            contact: zone.contact_number || "",
            video: zone.center_video_url || "",
            website: zone.website_url || "",
            designation: zone.designation || "",
            entity_name: zone.cor_entity_name || "",
            mon_fir_start: zone.mon_to_fri_start_time,
            mon_fir_end: zone.mon_to_fri_end_time,
            sat_start: zone.saturday_start_time,
            sat_end: zone.saturday_end_time,
            address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
          },
          filename: "email-post-tour-lead",
          title: "KIDO India",
        });
      }
      req.flash("success", "New lead recorded in our system.");
      res.redirect("/admin/lead/all");
      return;
      } else {
        // non-admin
        let whatsapp_number;
        let parent_second_whatsapp;
        let parent_first_whatsapp;
        if (req.body.whatsapp_first == "on") {
          whatsapp_number = req.body.parent_first_contact;
          parent_second_whatsapp = 0;
          parent_first_whatsapp = 1;
        } else if (req.body.whatsapp_second == "on") {
          whatsapp_number = req.body.parent_second_contact;
          parent_second_whatsapp = 1;
          parent_first_whatsapp = 0;
        }
        const latestLeadCount = await helper.leadCounter();
        const newLead = new Lead({
          lead_date: dateByTimeZone,
          lead_no: latestLeadCount,
          child_first_name: req.body.child_first_name,
          child_dob: req.body.child_dob,
          child_last_name: req.body.child_last_name,
          child_gender: req.body.child_gender,
          child_pre_school: childPre,
          programcategory_id: req.body.programcategory_id,
          program_id: req.body.program_id ? req.body.program_id : null,
          school_id: req.body.school_id,
          zone_id: zone.zone_id,
          country_id: zone.country_id,
          viewoption: req.session.user.view_option,
          primary_parent: req.body.primary_parent,
          updatedBy_name: req.session.user.name,
          createdBy_name:  req.session.user.name,
          parent_name: req.body.parent_name,
          parent_first_contact: req.body.parent_first_contact,
          parent_second_contact: req.body.parent_second_contact,
          parent_email: req.body.parent_email,
          parent_education: req.body.parent_education,
          parent_profession: req.body.parent_profession,
          parent_reference: req.body.parent_reference,
          secondary_parent_name: secParentName,
          secondary_parent_type: req.body.secondary_parent_type || "",
          secondary_first_contact: req.body.secondary_first_contact || "",
          secondary_Second_contact: req.body.secondary_Second_contact || "",
          secondary_second_whatsapp: sec_parent_second_whatsapp,
          secondary_first_whatsapp: sec_parent_first_whatsapp,
          secondary_whatsapp: sec_whatsapp_number,
          secondary_email: req.body.secondary_email || "",
          secondary_education: req.body.secondary_education || "",
          secondary_profession: req.body.secondary_profession || "",
          parent_landmark: req.body.parent_landmark || "",
          parent_house: req.body.parent_house || "",
          parent_street: req.body.parent_street || "",
          parent_address: req.body.parent_address || "",
          parent_country: req.body.parent_country.split("|")[1]
            ? req.body.parent_country.split("|")[1]
            : null,
          parent_state: req.body.parent_state.split("|")[1]
            ? req.body.parent_state.split("|")[1]
            : null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city.split("|")[1]
            ? req.body.parent_city.split("|")[1]
            : null,
          parent_know_aboutus: req.body.parent_know_aboutus
            ? req.body.parent_know_aboutus
            : [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: req.body.stage,
          remark: req.body.remark,
          viewoption: req.session.user.view_option,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: req.body.lead_type,
          initial_status: req.body.status_id,
          initial_sub_status: req.body.substatus_id,
          initial_action: req.body.action_taken ? req.body.action_taken : [],
          initial_notes: req.body.remark,
          initial_stage: req.body.stage,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          follow_due_date: dateByTimeZone,
          follow_due_time : "",
          is_external: 0,
          external_source: "",
          sibling: 1,
          is_related: oldLead._id,
          cor_parent: req.body.cor_parent,
          company_name_parent: req.body.company_name_parent,
          do_followup: 1
        });
        await newLead.save();
        oldLead.sibling = 1;
        oldLead.is_related = newLead._id;
        await oldLead.save();
        if (req.body.lead_type == "lead") {
          // send mail for type lead
          await mail.send({
            user: req.body.parent_email,
            subject: `Welcome to Kido International Preschool & Daycare`,
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              activities: zone.activities_portal || "",
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-welcome-lead",
            title: `KIDO India`,
          });
        }
        if (req.body.stage == "Post Tour") {
          // if stage in Post Tour, the send mail
          // mail sent
          await mail.send({
            user: req.body.parent_email,
            subject: "Thank you for visiting Kido International Preschool & Daycare",
            msg: {
              lead_name: req.body.parent_name || "",
              center_name: zone.school_display_name || "",
              center_main_name: zone.school_name || "",
              center_area: zone.area || "",
              sal: zone.cor_sal || "",
              spoc: zone.cor_spoc || "",
              email: zone.email_id || "",
              whatsapp: zone.whatsapp_number,
              contact: zone.contact_number || "",
              video: zone.center_video_url || "",
              website: zone.website_url || "",
              designation: zone.designation || "",
              entity_name: zone.cor_entity_name || "",
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time,
              address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
            },
            filename: "email-post-tour-lead",
            title: "KIDO India",
          });
        }
        req.flash("success", "New lead recorded in our system.");
        res.redirect("/admin/lead/all");
        return;
      }
    } else {
      req.flash('error', 'Please try again.');
      res.redirect('back');
      return;
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postCreateExistingLeadWithOldLead not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.postEmailValidation = async (req, res, next) => {
  try {
    // console.log(req.body);
    let lead;
    if (req.body.type == "primary") {
      lead = await Lead.findOne({ parent_email: req.body.emailId }, { lead_no: 1 });
      // console.log(lead);
    }
    if (req.body.type == "secondary") {
      lead = await Lead.findOne({ secondary_email: req.body.secondary_email }, { lead_no: 1 });
    }

    return res.status(200).json({
      message: "Lead",
      data: lead,
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "postEmailValidation not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.updateNewLead = async (req, res, next) => {
  try {
    const updateLead = await Lead.findOne({ _id: req.params.lead_id });
    updateLead.is_external = 0;
    await updateLead.save();
    next();
  } catch (err) {
    helper.errorDetailsForControllers(err, "updateNewLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.uploadExcel = async (req, res, next) => {
  try {
    res.render('admin/upload-excel', {
      title: "Upload Excel",
    });
  } catch (err) {
    console.log('ERROR: Could not upload------------------>');
    console.log(err);
  }
};

const upload = multer({ dest: 'public/excels/' });

exports.uploadFile = upload.single('file');

exports.uploadExcelPostt = async (req, res, next) => {
  try {
    // console.log('RUNNING This---')
    io.getIO().emit('message', 'Started.');
    // console.log(req.file);
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    const collection = db.collection('excels');
    let batchSize = 500;
    let batchCount = Math.ceil(data.length / batchSize);
    let batchIndex = 0;
    let processedCount = 0;
    let totalRecords = data.length;
    let percentComplete = 0;
    while (batchIndex < batchCount) {
      let batchData = data.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
      // console.log("batchData----->",batchData);
      const insertCol = await collection.insertMany(batchData);
      // console.log("insertCol---->", insertCol);
      processedCount += insertCol.insertedCount;
      // console.log("insertCol-->", insertCol);
      percentComplete = Math.floor((processedCount / totalRecords) * 100);
      // console.log("processedCount-->", processedCount);
      // console.log("percentComplete-->", percentComplete);
      // console.log("data.length-->", data.length);
      io.getIO().emit('progress', percentComplete);
      // console.log(processedCount == data.length);
      if (processedCount == data.length) {
        fs.unlinkSync(req.file.path);
        res.status(200).json({});
      }
      batchIndex++;
    }
  } catch (err) {
    console.log('uploadExcelPost: Could not upload------------------>');
    console.log(err);
  }
};

exports.uploadExcelPostOG = async (req, res, next) => {
  try {
    console.log('RUNNING This---')
    io.getIO().emit('message', 'Started.');
    // console.log(req.file);
    let newLead;
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    const collection = db.collection('lead');
    let batchSize = 1;
    let batchCount = Math.ceil(data.length / batchSize);
    let batchIndex = 0;
    let processedCount = 0;
    let totalRecords = data.length;
    let percentComplete = 0;
    while (batchIndex < batchCount) {
      let batchLead = [];
      let batchData = data.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
      let centerDisplayName = batchData.length && Object.keys(batchData[0])[0] == "center_display_name";
      let leadName = batchData.length && Object.keys(batchData[0])[1] == "lead_name";
      let contactOne = batchData.length && Object.keys(batchData[0])[2] == "contact_1";
      let email = batchData.length && Object.keys(batchData[0])[3] == "email";
      let proCat = batchData.length && Object.keys(batchData[0])[4] == "program_cat";
      let pro = batchData.length && Object.keys(batchData[0])[5] == "program";
      if (!centerDisplayName || !leadName || !contactOne || !email || !proCat || !pro) {
        // throw new Error("Heading dont match.");
        return res.status(400).send("Unable to upload. Heading does not match the template");
      }
      for (let lead of batchData) {
        let zone = await Center.find({
          $text: {
            $search: lead.center_display_name
          }
        });
        let proCategory = await Programcategory.find({
          $text: {
            $search: lead.program_cat
          }
        });
        let prog = await Program.find({
          $text: {
            $search: lead.program
          }
        });
        let leadCheck = await Lead.findOne({ email: lead.email });
        // console.log("zone------", zone);
        // console.log("leadCheck------", leadCheck);
        if (leadCheck == null) {
          if (zone && zone.length) {
            let dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
            let latestLeadCount = await helper.leadCounter();
            newLead = {
              lead_date: dateByTimeZone,
              lead_no: latestLeadCount,
              child_first_name: "",
              child_last_name: "",
              child_gender: "",
              child_pre_school: "",
              programcategory_id: proCategory && proCategory.length ? proCategory[0]._id : mongoose.Types.ObjectId("64a27694d081b651a5b83db4"),
              program_id: prog && prog.length ? prog[0]._id : mongoose.Types.ObjectId("64a276bdd081b651a5b83db8"),
              school_id: zone[0]._id,
              zone_id: zone[0].zone_id,
              country_id: zone[0].country_id,
              viewoption: req.session.user && req.session.user.main ? null : req.session.user.view_option,
              primary_parent: "Guardian",
              parent_name: lead.lead_name,
              parent_first_contact: lead.contact_1,
              parent_second_contact: "",
              parent_email: lead.email ? lead.email : lead.email.trim(),
              parent_education: "",
              parent_profession: "",
              parent_reference: "",
              secondary_parent_name: "",
              secondary_parent_type: "",
              secondary_first_contact: "",
              secondary_Second_contact: "",
              secondary_second_whatsapp: 0,
              secondary_first_whatsapp: 0,
              secondary_whatsapp: "",
              secondary_email: "",
              secondary_education: "",
              secondary_profession: "",
              parent_landmark: "",
              parent_house: "",
              parent_street: "",
              parent_address: "",
              parent_country: null,
              parent_state: null,
              parent_pincode: "",
              parent_area: "",
              parent_city: null,
              parent_know_aboutus: [],
              parent_whatsapp: lead.contact_1,
              parent_second_whatsapp: 0,
              parent_first_whatsapp: 1,
              source_category: "",
              status_id: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
              substatus_id: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
              updatedBy_name: req.session.user.name,
              createdBy_name:  req.session.user.name,
              stage: "New Lead",
              remark: "",
              action_taken: [],
              type: "lead",
              initial_status: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
              initial_sub_status: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
              initial_action: [],
              initial_notes: "",
              initial_stage: "New Lead",
              enrolled: 0,
              follow_due_date: dateByTimeZone,
              follow_due_time : "",
              is_external: 0,
              external_source: "",
              sibling: 0,
              is_related: null,
              cor_parent: "",
              company_name_parent: ""
            };
            batchLead.push(newLead);
            // console.log(batchLead);
          }
        }
      }
      await Promise.all([batchLead])
        .then(async (leadRes) => {
          const insertCol = await collection.insertMany(leadRes);
          processedCount += insertCol.insertedCount;
          // console.log("insertCol-->", insertCol);
          percentComplete = Math.floor((processedCount / totalRecords) * 100);
          // console.log("processedCount-->", processedCount);
          // console.log("percentComplete-->", percentComplete);
          // console.log("data.length-->", data.length);
          io.getIO().emit('progress', percentComplete);
          // console.log(processedCount == data.length);
          if (processedCount == data.length) {
            fs.unlinkSync(req.file.path);
            res.status(200).json({});
          }
          batchIndex++;
        })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "uploadExcelPost not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.uploadExcelPost = async (req, res, next) => {
  try {
    console.log('RUNNING This---');
    io.getIO().emit('message', 'Started.');
    // console.log(req.file);
    let newLead;
    let batchLead = [];
    let foundCenter;
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // console.log("sheet-----------", sheet);
    const data = XLSX.utils.sheet_to_json(sheet);
    // console.log("data-----------", data);
    const collection = db.collection('leads');
    let batchSize = 5;
    let batchCount = Math.ceil(data.length / batchSize);
    let batchIndex = 0;
    let processedCount = 0;
    let totalRecords = data.length;
    let percentComplete = 0;
    while (batchIndex < batchCount) {
      let batchData = data.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
      // console.log("batchData----->", batchData);
      let centerDisplayName = batchData.length && Object.keys(batchData[0])[0] == "center_display_name";
      let leadName = batchData.length && Object.keys(batchData[0])[1] == "lead_name";
      let contactOne = batchData.length && Object.keys(batchData[0])[2] == "contact_1";
      let email = batchData.length && Object.keys(batchData[0])[3] == "email";
      let proCat = batchData.length && Object.keys(batchData[0])[4] == "program_cat";
      let pro = batchData.length && Object.keys(batchData[0])[5] == "program";

      if (!centerDisplayName || !leadName || !contactOne || !email || !proCat || !pro) {
        return res.status(400).send("Unable to upload. Heading does not match the template");
      }

      for (let lead of batchData) {
        foundCenter = await Center.find({
          $text: {
            $search: lead.center_display_name
          }
        });
        let proCategory = await Programcategory.find({
          $text: {
            $search: lead.program_cat
          }
        });
        let prog = await Program.find({
          $text: {
            $search: lead.program
          }
        });
        let leadCheck = await Lead.findOne({ email: lead.email });
        if (leadCheck == null) {
          let dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata").toISOString();
          let latestLeadCount = await helper.leadCounter();
          if (foundCenter && foundCenter.length) {
            foundCenter = foundCenter[0]._id;
          } else {
            foundCenter = mongoose.Types.ObjectId("64a26f270754b33d31c62b79");
          }
          const zone = await Center.findOne({ _id: foundCenter });
          newLead = {
            lead_date: new Date(dateByTimeZone),
            lead_no: latestLeadCount,
            child_first_name: "",
            child_last_name: "",
            child_gender: "",
            child_pre_school: "",
            programcategory_id: proCategory && proCategory.length ? proCategory[0]._id : mongoose.Types.ObjectId("64a27694d081b651a5b83db4"),
            program_id: prog && prog.length ? prog[0]._id : mongoose.Types.ObjectId("64a276bdd081b651a5b83db8"),
            school_id: foundCenter,
            zone_id: zone ? zone.zone_id : null,
            country_id: zone ? zone.country_id : null,
            viewoption: req.session.user && req.session.user.main ? null : req.session.user.view_option,
            primary_parent: "Guardian",
            parent_name: lead.lead_name,
            parent_first_contact: lead.contact_1,
            parent_second_contact: "",
            parent_email: lead.email ? lead.email : lead.email.trim(),
            parent_education: "",
            parent_profession: "",
            parent_reference: "",
            secondary_parent_name: "",
            secondary_parent_type: "",
            secondary_first_contact: "",
            secondary_Second_contact: "",
            secondary_second_whatsapp: 0,
            secondary_first_whatsapp: 0,
            secondary_whatsapp: "",
            secondary_email: "",
            secondary_education: "",
            secondary_profession: "",
            parent_landmark: "",
            parent_house: "",
            parent_street: "",
            parent_address: "",
            parent_country: null,
            parent_state: null,
            parent_pincode: "",
            parent_area: "",
            parent_city: null,
            parent_know_aboutus: [],
            parent_whatsapp: lead.contact_1,
            parent_second_whatsapp: 0,
            parent_first_whatsapp: 1,
            source_category: "database/events",
            status_id: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
            substatus_id: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
            updatedBy_name: req.session.user.name,
            createdBy_name: req.session.user.name,
            stage: "New Lead",
            remark: "From excel import",
            action_taken: [],
            type: "lead",
            initial_status: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
            initial_sub_status: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
            initial_action: [],
            initial_notes: "From excel import",
            initial_stage: "New Lead",
            enrolled: 0,
            follow_due_date: new Date(dateByTimeZone),
            follow_due_time: "",
            is_external: 2,
            external_source: "",
            sibling: 0,
            is_related: null,
            cor_parent: "",
            company_name_parent: "",
            comm_mode_latest: "",
            createdAt: new Date(dateByTimeZone),
            updatedAt: new Date(dateByTimeZone),
            do_followup: 1
          };
          batchLead.push(newLead);
        }
      }

      if (batchLead.length) {
        await collection.insertMany(batchLead)
          .then(async (insertCol) => {
            // console.log(insertCol);
            processedCount += insertCol.insertedCount;
            percentComplete = Math.floor((processedCount / totalRecords) * 100);
            // console.log("processedCount-->", processedCount);
            // console.log("percentComplete-->", percentComplete);
            // console.log("data.length-->", data.length);
            io.getIO().emit('progress', percentComplete);
            // console.log(processedCount == data.length);
            if (processedCount == data.length) {
              fs.unlinkSync(req.file.path);
              res.status(200).json({});
            }
            batchIndex++;
          });
      }
      batchLead = []; // Reset the batchLead array
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "uploadExcelPost not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.uploadFileGet = async (req, res, next) => {
  try {
    return res.render('admin/upload-file', {
      title: "Upload Excel"
    })
  } catch (err) {
    console.log(err);
  }
};