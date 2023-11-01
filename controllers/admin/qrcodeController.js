const mongoose = require('mongoose');
var QRCode = require('qrcode')

const helper = require('../../handlers/helper');


exports.generateQRCode = async (req, res, next) => {
  try {
    // console.log(req.session.user.view_option)
    const view_option = helper.encryptQr(req.session.user.view_option);
    // console.log(view_option,"encrypt")
    let str = `${req.config.siteHeader}://${req.headers.host}/create/lead/${view_option}`

    QRCode.toDataURL(str, function (err, url) {
      return res.status(200).json({
        msg: "url",
        data: url,
        main_url: str,
        code: 200,
      });
    })


  } catch (err) {
    helper.errorDetailsForControllers(err, "generateQRCode not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

// exports.addLead = async (req,res,next) => {
//   try {
//     const KnowUsCollection = mongoose.connection.db.collection("knowus");
//     const StatusCollection = mongoose.connection.db.collection("statuses");
//     const knowussPromises = KnowUsCollection.find({
//       status: "active",
//     }).toArray();
//     const programcategorysPromise =  Programcategory.find({
//       status: req.responseAdmin.ACTIVE,
//     });
//     const programsPromise =  Program.find({ status: req.responseAdmin.ACTIVE });
//     // const Employees = await Employee.find({_id:req.session.user._id  })
//     const employees = await Employee.aggregate([
//       {
//         $match: {
//           _id: ObjectId(req.session.user._id),
//         },
//       },
//       {
//         $lookup: {
//           from: "viewoptions",
//           localField: "view_option",
//           foreignField: "_id",
//           // 'pipeline': [{'$sort': {"order": -1}}],
//           as: "viewoption",
//         },
//       },
//       {
//         $unwind: "$viewoption",
//       },
//       {
//         $lookup: {
//           from: "countries",
//           localField: "viewoption.countries",
//           foreignField: "_id",
//           // 'pipeline': [{'$sort': {"order": -1}}],
//           as: "countries",
//         },
//       },
//       {
//         $unwind: "$countries",
//       },
//       {
//         $project: {
//           _id: "$countries._id",
//           country_name: "$countries.country_name",
//           country_id:"$countries.country_id"
//         },
//       },
//     ]);

//     const centersPrmoise =  Center.find({ status: req.responseAdmin.ACTIVE });
//     const statusesPromise = StatusCollection.find().toArray();
//     const ActionCollection =
//       mongoose.connection.db.collection("actionplanneds");
//     const actionPromise =  ActionCollection.find({
//       status: "active",
//     }).toArray();
//     console.log(employees, "Employees");
//     console.log(req.session.user._id, "req.session.user._id ");
//     const [statuses, knowuss, actions,centers,programcategorys,programs] = await Promise.all([
//       statusesPromise,
//       knowussPromises,
//       actionPromise,
//       centersPrmoise,
//       programcategorysPromise,
//       programsPromise
//     ]);
//     // console.log(centers,"stacenterstus")
//     return res.render("admin/add-qrcodelead", {
//       title: "Add Lead",
//       programcategorys,
//       programs,
//       knowuss,
//       statuses,
//       actions,
//       centers,
//       employees
//     });
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "addLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// }

// exports.postAddLead = async (req,res,next) => {
//   try{
//     console.log(req.body,"qrcodebody")
//     // return;
//     if(req.body.sibling == "on"){
//       console.log("onnnn")
//       const childFirstName = typeof req.body.child_first_name == 'string' ? [req.body.child_first_name] : req.body.child_first_name;
//       const childDob = typeof req.body.child_dob == 'string' ? [req.body.child_dob] : req.body.child_dob;
//       const childLastName = typeof req.body.child_last_name == 'string' ? [req.body.child_last_name] : req.body.child_last_name;
//       const childGender = typeof req.body.child_gender == 'string' ? [req.body.child_gender] : req.body.child_gender;
//       const programcategoryId = typeof req.body.programcategory_id == 'string' ? [req.body.programcategory_id] : req.body.programcategory_id;
//       const programId = typeof req.body.program_id == 'string' ? [req.body.program_id] : req.body.program_id;

//       const mainObject = childFirstName.map((childFirstName, i) => ({
//         child_first_name: childFirstName,
//         child_dob: childDob[i],
//         child_last_name: childLastName[i],
//         child_gender: childGender[i],
//         programcategory_id: programcategoryId[i],
//         program_id: programId[i],
//       }));
//       for(let i=0; i<mainObject.length; i++){
//         console.log(mainObject[i].child_first_name)

//         let type;
//           if (
//             req.body.stage === "New Lead" ||
//             req.body.stage === "Enquiry Received" ||
//             req.body.stage === "Tour Booked" ||
//             req.body.stage === "Closed- Lead Lost"
//           ) {
//             type = "lead";
//           } else {
//             type = "enquiry";
//           }
//           const randomNumber = Math.floor(100000 + Math.random() * 900000);
//           let whatsapp_number;
//           let parent_second_whatsapp;
//           let parent_first_whatsapp;
//           if (req.body.whatsapp_first == "on") {
//             whatsapp_number = req.body.parent_first_contact;
//             parent_second_whatsapp = 0;
//             parent_first_whatsapp = 1;
//           } else if (req.body.whatsapp_second == "on") {
//             whatsapp_number = req.body.parent_second_contact;
//             parent_second_whatsapp = 1;
//             parent_first_whatsapp = 0;
//           }

//           const newLead = new Lead({
//             lead_date: new Date(
//               `${moment().format("YYYY")}-${moment().format(
//                 "MM"
//               )}-${moment().format("DD")} 00:00:00.000`
//             ),
//             lead_no: `LD${randomNumber}`,
//             child_first_name: mainObject[i].child_first_name,
//             child_dob: mainObject[i].child_dob,
//             child_last_name: mainObject[i].child_last_name,
//             child_gender: mainObject[i].child_gender,
//             programcategory_id: mainObject[i].programcategory_id,
//             program_id: mainObject[i].program_id,
//             primary_parent: req.body.primary_parent,
//             parent_name: req.body.parent_name,
//             school_id: req.body.school_id,
//             viewoption:req.session.user.view_option,
//             parent_first_contact: req.body.parent_first_contact,
//             parent_second_contact: req.body.parent_second_contact,
//             parent_email: req.body.parent_email,
//             parent_country: req.body.parent_country.split("|")[1],
//             parent_state: req.body.parent_state.split("|")[1],
//             parent_pincode: req.body.parent_pincode,
//             parent_area: req.body.parent_area,
//             parent_city: req.body.parent_city.split("|")[1],
//             parent_know_aboutus: req.body.parent_know_aboutus,
//             parent_whatsapp: whatsapp_number,
//             parent_second_whatsapp: parent_second_whatsapp,
//             parent_first_whatsapp: parent_first_whatsapp,
//             source_category: req.body.source_category,
//             status_id: req.body.status_id,
//             substatus_id: req.body.substatus_id,
//             stage: req.body.stage,
//             remark: req.body.remark,
//             action_taken: req.body.action_taken,
//             type: type,
//           });
//           await newLead.save();
//           // req.flash("success", "new lead added ");
//           // res.redirect("/admin/account/login");
//           // // return;
//       }
//       req.flash("success", "new lead added ");
//       res.redirect("/admin/account/login");

//     }else{
//       req.body.child_first_name = req.body.child_first_name.filter(item => item)
//       req.body.child_dob = req.body.child_dob.filter(item => item)
//       req.body.child_last_name = req.body.child_last_name.filter(item => item)
//       req.body.child_gender = req.body.child_gender.filter(item => item)
//       req.body.programcategory_id = req.body.programcategory_id.filter(item => item)
//       // req.body.program_id = req.body.program_id.filter(item => item)
//       // return;
//       const childFirstName = typeof req.body.child_first_name == 'string' ? [req.body.child_first_name] : req.body.child_first_name;
//       const childDob = typeof req.body.child_dob == 'string' ? [req.body.child_dob] : req.body.child_dob;
//       const childLastName = typeof req.body.child_last_name == 'string' ? [req.body.child_last_name] : req.body.child_last_name;
//       const childGender = typeof req.body.child_gender == 'string' ? [req.body.child_gender] : req.body.child_gender;
//       const programcategoryId = typeof req.body.programcategory_id == 'string' ? [req.body.programcategory_id] : req.body.programcategory_id;
//       const programId = typeof req.body.program_id == 'string' ? [req.body.program_id] : req.body.program_id;

//       const mainObject = childFirstName.map((childFirstName, i) => ({
//         child_first_name: childFirstName,
//         child_dob: childDob[i],
//         child_last_name: childLastName[i],
//         child_gender: childGender[i],
//         programcategory_id: programcategoryId[i],
//         program_id: programId[i],
//       }));
//       for(let i=0; i<mainObject.length; i++){
//         console.log(mainObject[i].child_first_name)

//         let type;
//           if (
//             req.body.stage === "New Lead" ||
//             req.body.stage === "Enquiry Received" ||
//             req.body.stage === "Tour Booked" ||
//             req.body.stage === "Closed- Lead Lost"
//           ) {
//             type = "lead";
//           } else {
//             type = "enquiry";
//           }
//           const randomNumber = Math.floor(100000 + Math.random() * 900000);
//           let whatsapp_number;
//           let parent_second_whatsapp;
//           let parent_first_whatsapp;
//           if (req.body.whatsapp_first == "on") {
//             whatsapp_number = req.body.parent_first_contact;
//             parent_second_whatsapp = 0;
//             parent_first_whatsapp = 1;
//           } else if (req.body.whatsapp_second == "on") {
//             whatsapp_number = req.body.parent_second_contact;
//             parent_second_whatsapp = 1;
//             parent_first_whatsapp = 0;
//           }

//           const newLead = new Lead({
//             lead_date: new Date(
//               `${moment().format("YYYY")}-${moment().format(
//                 "MM"
//               )}-${moment().format("DD")} 00:00:00.000`
//             ),
//             lead_no: `LD${randomNumber}`,
//             child_first_name: mainObject[i].child_first_name,
//             child_dob: mainObject[i].child_dob,
//             child_last_name: mainObject[i].child_last_name,
//             child_gender: mainObject[i].child_gender,
//             programcategory_id: mainObject[i].programcategory_id,
//             program_id: mainObject[i].program_id,
//             primary_parent: req.body.primary_parent,
//             parent_name: req.body.parent_name,
//             school_id: req.body.school_id,
//             viewoption:req.session.user.view_option,
//             parent_first_contact: req.body.parent_first_contact,
//             parent_second_contact: req.body.parent_second_contact,
//             parent_email: req.body.parent_email,
//             parent_country: req.body.parent_country.split("|")[1],
//             parent_state: req.body.parent_state.split("|")[1],
//             parent_pincode: req.body.parent_pincode,
//             parent_area: req.body.parent_area,
//             parent_city: req.body.parent_city.split("|")[1],
//             parent_know_aboutus: req.body.parent_know_aboutus,
//             parent_whatsapp: whatsapp_number,
//             parent_second_whatsapp: parent_second_whatsapp,
//             parent_first_whatsapp: parent_first_whatsapp,
//             source_category: req.body.source_category,
//             status_id: req.body.status_id,
//             substatus_id: req.body.substatus_id,
//             stage: req.body.stage,
//             remark: req.body.remark,
//             action_taken: req.body.action_taken,
//             type: type,
//           });
//           await newLead.save();
//           // req.flash("success", "new lead added ");
//           // res.redirect("/admin/account/login");
//           // // return;
//       }
//       req.flash("success", "new lead added ");
//       res.redirect("/admin/account/login");
//     }
//   }catch(err){
//     console.log(err);
//     return;
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
// }