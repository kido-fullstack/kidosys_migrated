const mongoose = require('mongoose');
const Center = mongoose.model('Center');
const Country = mongoose.model('Country');
const State = mongoose.model('State');
const City = mongoose.model('City');
const Zone = mongoose.model('Zone');
const Programcategory = mongoose.model('Programcategory');
const Program = mongoose.model('Program');
const helper = require('../../handlers/helper');
const dateTime = require('node-datetime');
const moment = require('moment');

// exports.allCenter = async (req, res, next) => {
//   try {
//     const centers = await Center.find({
//       status: 'active'
//     });
//     return res.render('admin/all-center', {
//       title: 'All Center',
//       centers
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "allCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };
exports.allCenter = async (req, res, next) => {
  try {
    const centers = await Center
      .find({}, {
        school_display_name: 1,
        zone_id: 1,
        contact_number: 1,
        email_id: 1,
        cor_spoc: 1,
        mon_to_fri_end_time: 1,
        mon_to_fri_start_time: 1,
        saturday_end_time: 1,
        saturday_start_time: 1,
        sunday_start_time: 1,
        status: 1
      })
      .populate({
        path: "zone_id",
        select: {
          name: 1
        }
      })
      .sort({ createdAt: req.responseAdmin.DESC });
    // console.log(centers)
    return res.render('admin/all-center', {
      title: 'All Center',
      centers
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "allCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

// exports.getAddCenter = (req, res, next) => {
//   try {
//     return res.render('admin/add-center', {
//       title: 'Add Center'
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getAddCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };
exports.getAddCenter = async (req, res, next) => {
  try {
    const countrys = await Country.find({ status: 'Active' });
    const states = await State.find({});
    const programcategorys = await Programcategory.find({ status: req.responseAdmin.ACTIVE });
    const zones = await Zone.find({ status: req.responseAdmin.ACTIVE });
    const ActionCollection = mongoose.connection.db.collection('actionplanneds');
    const actions = await ActionCollection
      .find({status: 'active'})
      .sort({
        order: 1
      }).toArray();
    // console.log(actions)
    return res.render('admin/add-center', {
      title: 'Add Center',
      countrys,
      programcategorys,
      zones,
      actions,
      states
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

// exports.postAddCenter = async (req, res, next) => {
//   try {
//     const center = await Center.findOne({ center_name: req.body.center_name });

//     if (center) {
//       req.flash('error', req.responseAdmin.SAME_CENTER_EXIST);
//       res.redirect('back');
//       return;
//     } else {
//       const newCenter = new Center({
//         center_name: req.body.center_name,
//         print_name: req.body.print_name,
//         center_code: req.body.center_code,
//         center_desc: req.body.center_desc,
//         center_add: req.body.center_add,
//         center_spoc: req.body.center_spoc,
//         center_contact: req.body.center_contact,
//         center_email: req.body.center_email,
//         status: req.body.status
//       });
//       await newCenter.save();
//       req.flash('success', req.responseAdmin.NEW_CENTER);
//       res.redirect(req.responseUrl.ALL_CENTER);
//       return;
//     }
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getAddCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

exports.postAddCenter = async(req,res,next) => {
  try {
    // console.log(req.body,"adding center");
    // console.log(req.session);
    // return;
    let uniqueID = dateTime.create().format('dHMS');
    let schoolCode = `#${uniqueID}`
    // let userUniqueID = `#${req.body.school_name.trim().toLowerCase()}_${uniqueID}`;
    // console.log(userUniqueID)
    // return;

    const newCenter = new Center({
      school_name:req.body.school_name,
      school_display_name:req.body.school_display_name,
      country_id:req.body.country_id || null,
      zone_id:req.body.zone || null,
      programcategory_id:req.body.programcategory_id || null,
      program_id:req.body.program_id || null,
      action_taken: [],
      setup_type:req.body.setup_type,
      agreement_term_start:req.body.agreement_term_start,
      agreement_term_end:req.body.agreement_term_end,
      no_of_room:req.body.no_of_room,
      school_code:schoolCode,
      size_of_school:req.body.size_of_school,
      school_description:req.body.school_description,
      house_no:req.body.house_no,
      landmark:req.body.landmark,
      city:req.body.city ? req.body.city.split("|")[1] : null,
      country:req.body.country,
      street:req.body.street,
      area:req.body.area,
      state: req.body.state ? req.body.state.split("|")[1] : null,
      pincode:req.body.pincode,
      contact_number:req.body.contact_number,
      email_id:req.body.email_id,
      designation: req.body.designation,
      whatsapp_number:req.body.whatsapp_number,
      cor_entity_name:req.body.cor_entity_name,
      cor_email_id:req.body.cor_email_id,
      cor_cor_number:req.body.cor_cor_number,
      cor_gst_number:req.body.cor_gst_number,
      cor_gst_address:req.body.cor_gst_address,
      cor_company_pan:req.body.cor_company_pan,
      cor_company_cin:req.body.cor_company_cin,
      cor_receipt:req.body.cor_receipt,
      cor_sal: req.body.cor_sal,
      cor_spoc:req.body.cor_spoc,
      cor_customer_email:req.body.cor_customer_email,
      cor_add: req.body.cor_add,
      cor_state: req.body.cor_state ? req.body.cor_state.split("|")[1] : null,
      cor_city: req.body.cor_city ? req.body.cor_city.split("|")[1] : null,
      cor_pincode: req.body.cor_pincode,
      cor_video_url_first: req.body.cor_video_url_first,
      cor_video_url_second: req.body.cor_video_url_second,
      mon_to_fri_start_time: req.body.mon_to_fri_start_time,
      mon_to_fri_end_time: req.body.mon_to_fri_end_time,
      saturday_start_time: req.body.saturday_start_time,
      saturday_end_time: req.body.saturday_end_time,
      sunday_start_time: req.body.sunday_start_time,
      sunday_end_time: req.body.sunday_end_time,
      saturday_end_time: req.body.saturday_end_time,
      activities_portal: req.body.activities_portal,
      center_video_url: req.body.center_video_url,
      website_url: req.body.website_url,
      sch_bank_name:req.body.sch_bank_name,
      sch_account_number:req.body.sch_account_number,
      sch_branch_name:req.body.sch_branch_name,
      sch_branch_address:req.body.sch_branch_address,
      sch_ifsc:req.body.sch_ifsc,
      sch_timetable_before:req.body.sch_timetable_before,
      sch_document_before:req.body.sch_document_before,
      sch_timetable_after:req.body.sch_timetable_after,
      sch_document_after:req.body.sch_document_after,
      updatedBy: req.session.user._id,
      status: req.body.status
    });
    await newCenter.save();
    req.flash('success', req.responseAdmin.NEW_CENTER);
    res.redirect(req.responseUrl.ALL_CENTER);
    return;
  }catch(err){
    helper.errorDetailsForControllers(err, "getAddCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.getViewCenter = async (req, res, next) => {
  try {
    const centerPromise = Center.findOne({ _id: req.params.center_id});
    const countrysPromise = Country.find({ status: 'Active' });
    const programcategorysPromise = Programcategory.find({ status: req.responseAdmin.ACTIVE });
    const programsPromise = Program.find({ status: req.responseAdmin.ACTIVE });
    const zonesPromise = Zone.find({ status: req.responseAdmin.ACTIVE });

    const [center, countrys, programcategorys, programs, zones] = await Promise.all([centerPromise, countrysPromise, programcategorysPromise, programsPromise, zonesPromise]);

    res.render('admin/view-center', {
      title: 'View Center',
      center,
      countrys,
      programcategorys,
      zones,
      programs,
      moment
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getViewCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};


// exports.getEditCenter = async (req, res, next) => {
//   try {
//     const center = await Center.findOne({ _id: req.params.center_id});
//     res.render('admin/edit-center', {
//       title: 'Edit Center',
//       center
//     });
//     return;
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getEditCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };
exports.getEditCenter = async (req, res, next) => {
  try {
    const centerPromise = Center.findOne({ _id: req.params.center_id});
    const statesPromise =  State.find({});
    const countrysPromise = Country.find({ status: 'Active' });
    const programcategorysPromise = Programcategory.find({ status: req.responseAdmin.ACTIVE });
    const programsPromise = Program.find({ status: req.responseAdmin.ACTIVE });
    const zonesPromise = Zone.find({ status: req.responseAdmin.ACTIVE });

    const [center, countrys, programcategorys, programs, zones,states] = await Promise.all([centerPromise, countrysPromise, programcategorysPromise, programsPromise, zonesPromise,statesPromise]);

    res.render('admin/edit-center', {
      title: 'Edit Center',
      center,
      countrys,
      programcategorys,
      zones,
      programs,
      moment,
      states
    });
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "getEditCenter not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

// exports.postEditCenter = async (req, res, next) => {
//   try {
//     const updateCenter = await Center.updateOne({
//       _id: req.params.center_id
//     }, {
//       $set: {
//         center_name: req.body.center_name,
//         print_name: req.body.print_name,
//         center_code: req.body.center_code,
//         center_desc: req.body.center_desc,
//         center_add: req.body.center_add,
//         center_spoc: req.body.center_spoc,
//         center_contact: req.body.center_contact,
//         center_email: req.body.center_email,
//         status: req.body.status
//       },
//     }, { new: true }
//     ).exec((err, result) => {
//       if (err) {
//         req.flash('error', req.responseAdmin.SOMETHING_ERR);
//         res.redirect(req.responseUrl.DASHBOARD_URL);
//         return;
//       }
//       req.flash('success', req.responseAdmin.UPDATED_CENTER);
//       res.redirect(req.responseUrl.ALL_CENTER);
//       return;
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "postEditCenter not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

exports.postEditCenter = async (req, res, next) => {
  try{
    // console.log(req.body.agreement_term_end, "------req.body.agreement_term_end")
    const updateCenter = await Center.updateOne({
        _id: req.params.center_id
      }, {
        $set: {
          school_name:req.body.school_name,
          school_display_name:req.body.school_display_name,
          country_id:req.body.country_id || null,
          zone_id:req.body.zone || null,
          programcategory_id:req.body.programcategory_id || null,
          program_id:req.body.program_id || null,
          //action_taken:req.body.action_taken,
          setup_type:req.body.setup_type,
          agreement_term_start:req.body.agreement_term_start,
          agreement_term_end:req.body.agreement_term_end,
          no_of_room:req.body.no_of_room,
          // school_code:uniqueID,
          size_of_school:req.body.size_of_school,
          school_description:req.body.school_description,
          house_no:req.body.house_no,
          landmark:req.body.landmark,
          city:req.body.city ? req.body.city.split("|")[1] : null,
          country:req.body.country,
          street:req.body.street,
          area:req.body.area,
          state: req.body.state ? req.body.state.split("|")[1] : null,
          pincode:req.body.pincode,
          contact_number:req.body.contact_number,
          email_id:req.body.email_id,
          designation: req.body.designation,
          whatsapp_number:req.body.whatsapp_number,
          cor_entity_name:req.body.cor_entity_name,
          cor_email_id:req.body.cor_email_id,
          cor_cor_number:req.body.cor_cor_number,
          cor_gst_number:req.body.cor_gst_number,
          cor_gst_address:req.body.cor_gst_address,
          cor_company_pan:req.body.cor_company_pan,
          cor_company_cin:req.body.cor_company_cin,
          cor_receipt:req.body.cor_receipt,
          cor_sal: req.body.cor_sal,
          cor_spoc:req.body.cor_spoc,
          cor_customer_email:req.body.cor_customer_email,
          cor_add: req.body.cor_add,
          cor_state: req.body.cor_state ? req.body.cor_state.split("|")[1] : null,
          cor_city: req.body.cor_city ? req.body.cor_city.split("|")[1] : null,
          cor_pincode: req.body.cor_pincode,
          cor_video_url_first: req.body.cor_video_url_first,
          cor_video_url_second: req.body.cor_video_url_second,
          mon_to_fri_start_time: req.body.mon_to_fri_start_time,
          mon_to_fri_end_time: req.body.mon_to_fri_end_time,
          saturday_start_time: req.body.saturday_start_time,
          saturday_end_time: req.body.saturday_end_time,
          sunday_start_time: req.body.sunday_start_time,
          sunday_end_time: req.body.sunday_end_time,
          saturday_end_time: req.body.saturday_end_time,
          activities_portal: req.body.activities_portal,
          center_video_url: req.body.center_video_url,
          website_url: req.body.website_url,
          sch_bank_name:req.body.sch_bank_name,
          sch_account_number:req.body.sch_account_number,
          sch_branch_name:req.body.sch_branch_name,
          sch_branch_address:req.body.sch_branch_address,
          sch_ifsc:req.body.sch_ifsc,
          sch_timetable_before:req.body.sch_timetable_before,
          sch_document_before:req.body.sch_document_before,
          sch_timetable_after:req.body.sch_timetable_after,
          sch_document_after:req.body.sch_document_after,
          status: req.body.status
        },
      }, { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err);
          req.flash('error', req.responseAdmin.SOMETHING_ERR);
          res.redirect(req.responseUrl.DASHBOARD_URL);
          return;
        }
        req.flash('success', req.responseAdmin.UPDATED_CENTER);
        res.redirect(req.responseUrl.ALL_CENTER);
        return;
      })
  }catch(err){
    helper.errorDetailsForControllers(err, "postEditCenter not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.dropdownFilter = async (req, res, next) => {
  try {
    // console.log(req.body.type,"iddd")
    const zones = await Zone.find({ country_id: req.body.type, status: 'active' }).sort({ order: 1 });
    return res.status(200).json({
      msg: 'zones',
      data: zones,
      code: 200
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
}

exports.programFilter = async (req,res,next) => {
  try{
    // console.log(req.body.type,"iddd")
    const programs = await Program.find({ programcategory_id:{"$in":req.body.type}, status: 'active' });
    // console.log(programs,"programsss")
    return res.status(200).json({
      msg: 'programs',
      data: programs,
    });
  }catch (err) {
    helper.errorDetailsForControllers(
      err,
      "programdropdownFilter not working - post request",
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

exports.filterDropdownOnEmp = async (req, res, next) => {
  try {
    // console.log(req.body.type,"req.body.tytyty")
    const centers = await Center.find({ zone_id: req.body.type, status: "active" }).sort({ order: 1 });
    return res.status(200).json({
      msg: 'centers',
      data: centers,
      code: 200
    });
  } catch (err) {
    helper.errorDetailsForControllers(err, "programdropdownFilter not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.cityFilter = async (req, res, next) => {
  try {
    // console.log(req.body.type,"cityfilter")
    let state = await State.findOne({state_name:req.body.type})
    const stateId = parseInt(state.id);
    const Citys = await City.aggregate([
      {
        $match: {
          state_id: stateId,
        },
      },
    ]);
    // console.log(stateId,"state")
    // console.log(Citys,"cities")
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

exports.getAllStates = async (req, res, next) => {
  try {
    const states = await State.find({ status: "1" });
    const totalRecords = await State.countDocuments({ status: "1" });
    return res.status(200).json({
      total_count: totalRecords,
      items: states.map(state => ({ _id: state._id, name: state.state_name, id: state.id })) || []
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllStates not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};