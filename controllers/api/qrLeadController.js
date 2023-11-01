const mongoose = require('mongoose');
const momentZone = require('moment-timezone');
const Lead = mongoose.model("Lead");
const Followup = mongoose.model("Followup");
const Center = mongoose.model("Center");
const Programcategory = mongoose.model("Programcategory");
const ViewOption = mongoose.model("ViewOption");
const Program = mongoose.model("Program");
const State = mongoose.model('State');
const City = mongoose.model('City');
const Employee = mongoose.model("Employee");
const helper = require('../../handlers/helper');
const mail = require("../../handlers/mail");
// var ObjectIds = require('mongoose').Types.ObjectId;
const ObjectId = require("mongodb").ObjectId;
const moment = require("moment");

exports.test= async (req,res,next) => {
    console.log("testing")
}

exports.checkValid = async (req,res,next) => {
  try{
    // console.log(req.params,"req.body")
    let viewOptionId = helper.decryptQr(req.params.view_option);
    // console.log(viewOptionId,"viewOptionId")
    if(viewOptionId){

      var str = String.fromCharCode.apply(null, viewOptionId);
      // console.log(str,"str")
      if(mongoose.Types.ObjectId.isValid(str)){

        let views = await ViewOption.findOne({_id:str})
        // console.log(views,"views")
        if(views){
          // console.log(views,"views")
          req.body.viewId = views._id;
          req.body.school_id = views.centers[0];
          // console.log('CENTER------', req.body.school_id);
          next();
        }else{
          res.render('admin/blank-page');
        return;
        }
      }else{
        res.render('admin/blank-page');
        return;
      }
    }else{
      res.render('admin/blank-page');
        return;
    }
  }catch(err){
    console.log(err,"errr")
  }
}

exports.addLead = async (req,res,next) => {
  try {
    // console.log(req.body.viewId,"viewId")
      const KnowUsCollection = mongoose.connection.db.collection("knowus");
      const StatusCollection = mongoose.connection.db.collection("statuses");
      const knowussPromises = KnowUsCollection.find({
        status: "active",
      }).toArray();
      const programcategorysPromise =  Programcategory.find({
        status: req.responseAdmin.ACTIVE,
      });
      const programsPromise =  Program.find({ status: req.responseAdmin.ACTIVE });
      // const Employees = await Employee.find({_id:req.session.user._id  })
      const viewpotions = await ViewOption.aggregate([
        {
          '$match':{
            _id:ObjectId(req.body.viewId)
          }
        },

        {
          '$lookup':{
            'from': 'countries',
            'localField': 'countries',
            'foreignField': '_id',
            // 'pipeline': [{'$sort': {"order": -1}}],
            'as': 'result'
          }
        },
        {
          '$unwind':'$result'
        },
        {
          '$project':{
            'result._id':1,
            'result.country_id':1,
            "result.country_name":1,
            "_id":0
          }
        }

      ])
      const viewOption = await ViewOption.findOne({_id:req.body.viewId})
      // console.log(viewOption.centers,"viewoption")
      const centers = await Center.find({_id:{$in:viewOption.centers}, status: "active"});
      // console.log('centers',centers)
      // const centersPrmoise =  Center.find({ status: req.responseAdmin.ACTIVE });
      const statusesPromise = StatusCollection.find().toArray();
      const ActionCollection =
        mongoose.connection.db.collection("actionplanneds");
      const actionPromise =  ActionCollection.find({
        status: "active",
      }).toArray();
      // console.log(employees, "Employees");
      let employees = viewpotions.map(a => a.result)
      // console.log(employees,"resul")
      // console.log(req.session.user._id, "req.session.user._id ");
      const [statuses, knowuss, actions,programcategorys,programs] = await Promise.all([
        statusesPromise,
        knowussPromises,
        actionPromise,
        programcategorysPromise,
        programsPromise
      ]);
      // console.log(employees,"stacenterstus")
      // return
      return res.render("admin/add-qrcodelead", {
        title: "Add Lead",
        programcategorys,
        programs,
        knowuss,
        statuses,
        actions,
        centers,
        center: req.body.school_id,
        employees,
        view_option:req.body.viewId,
      });
  } catch (err) {
    helper.errorDetailsForControllers(err, "addLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
}

exports.postAddLead = async (req,res,next) => {
  try{
    // console.log('HEYHEYHEYHEYHEYHEYHEY')
    // console.log(req.body.school_id);
    const zone = await Center.findOne({ _id: req.body.school_id });
    // console.log(zone);
    let secParentName = "";
    secParentName = req.body.secondary_parent_name;

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

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

    if (req.body.secondary_first_whatsapp == "on") {
      sec_whatsapp_number = req.body.parent_first_contact;
      sec_parent_second_whatsapp = 0;
      sec_parent_first_whatsapp = 1;
    } else if (req.body.secondary_Second_contact == "on") {
      sec_whatsapp_number = req.body.parent_second_contact;
      sec_parent_second_whatsapp = 1;
      sec_parent_first_whatsapp = 0;
    }

    if(req.body.sibling == "on"){
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      // console.log('siblings hai');

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
        child_pre_school: "no",
        programcategory_id: req.body.programcategory_id,
        program_id: req.body.program_id ? req.body.program_id : null,
        school_id: req.body.school_id,
        zone_id: zone.zone_id,
        country_id: zone.country_id,
        viewoption: req.body.view_option,
        primary_parent: req.body.primary_parent,
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: req.body.parent_second_contact,
        secondary_parent_name: req.body.secondary_parent_name,
        secondary_parent_type: req.body.secondary_parent_type || "",
        secondary_first_contact: req.body.secondary_first_contact || "",
        secondary_Second_contact: req.body.secondary_Second_contact || "",
        secondary_second_whatsapp: sec_parent_second_whatsapp,
        secondary_first_whatsapp: sec_parent_first_whatsapp,
        secondary_whatsapp: sec_whatsapp_number,
        secondary_email: req.body.secondary_email || "",
        secondary_education: req.body.secondary_education || "",
        secondary_profession: req.body.secondary_profession || "",
        parent_email: req.body.parent_email,
        parent_education: req.body.parent_education,
        parent_profession: req.body.parent_profession,
        parent_country: req.body.parent_country.split("|")[1] ? req.body.parent_country.split("|")[1] : null,
        parent_state: req.body.parent_state.split("|")[1] ? req.body.parent_state.split("|")[1] : null,
        parent_pincode: req.body.parent_pincode,
        parent_area: req.body.parent_area,
        parent_city: req.body.parent_city.split("|")[1] ? req.body.parent_city.split("|")[1] : null,
        parent_know_aboutus: req.body.parent_know_aboutus ? req.body.parent_know_aboutus : [],
        parent_whatsapp: whatsapp_number,
        parent_second_whatsapp: parent_second_whatsapp,
        parent_first_whatsapp: parent_first_whatsapp,
        source_category: "direct-walk-in",
        status_id: "63b40661f1f372a8e4fdb102",
        substatus_id: "63b40b1cf1f372a8e4fdb12f",
        stage: "Post Tour",
        // remark: req.body.remark,
        // action_taken: req.body.action_taken ? req.body.action_taken : [],
        type: "enquiry",
        initial_status: "63b40661f1f372a8e4fdb102",
        initial_sub_status: "63b40b1cf1f372a8e4fdb12f",
        initial_action: [],
        initial_notes: "",
        enrolled: 0,
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

      const latestLeadCount2 = await helper.leadCounter();
      const randomNumber2 = Math.floor(100000 + Math.random() * 900000);
      const newLead2 = new Lead({
        lead_date: dateByTimeZone,
        lead_no: latestLeadCount2,
        child_first_name: req.body.child_first_name_1,
        child_dob: req.body.child_dob_2,
        child_last_name: req.body.child_last_name_2,
        child_gender: req.body.child_gender_2,
        child_pre_school: "no",
        programcategory_id: req.body.programcategory_id_2,
        program_id: req.body.program_id_2 ? req.body.program_id_2 : null,
        school_id: req.body.school_id,
        zone_id: zone.zone_id,
        country_id: zone.country_id,
        viewoption: req.body.view_option,
        primary_parent: req.body.primary_parent,
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: req.body.parent_second_contact,
        secondary_parent_name: req.body.secondary_parent_name,
        secondary_parent_type: req.body.secondary_parent_type || "",
        secondary_first_contact: req.body.secondary_first_contact || "",
        secondary_Second_contact: req.body.secondary_Second_contact || "",
        secondary_second_whatsapp: sec_parent_second_whatsapp,
        secondary_first_whatsapp: sec_parent_first_whatsapp,
        secondary_whatsapp: sec_whatsapp_number,
        secondary_email: req.body.secondary_email || "",
        secondary_education: req.body.secondary_education || "",
        secondary_profession: req.body.secondary_profession || "",
        parent_email: req.body.parent_email,
        parent_education: req.body.parent_education,
        parent_profession: req.body.parent_profession,
        parent_country: req.body.parent_country.split("|")[1] ? req.body.parent_country.split("|")[1] : null,
        parent_state: req.body.parent_state.split("|")[1] ? req.body.parent_state.split("|")[1] : null,
        parent_pincode: req.body.parent_pincode,
        parent_area: req.body.parent_area,
        parent_city: req.body.parent_city.split("|")[1] ? req.body.parent_city.split("|")[1] : null,
        parent_know_aboutus: req.body.parent_know_aboutus ? req.body.parent_know_aboutus : [],
        parent_whatsapp: whatsapp_number,
        parent_second_whatsapp: parent_second_whatsapp,
        parent_first_whatsapp: parent_first_whatsapp,
        source_category: "direct-walk-in",
        status_id: "63b40661f1f372a8e4fdb102",
        substatus_id: "63b40b1cf1f372a8e4fdb12f",
        stage: "Post Tour",
        // remark: req.body.remark,
        // action_taken: req.body.action_taken ? req.body.action_taken : [],
        type: "enquiry",
        initial_status: "63b40661f1f372a8e4fdb102",
        initial_sub_status: "63b40b1cf1f372a8e4fdb12f",
        initial_action: [],
        initial_notes: "",
        enrolled: 0,
        follow_due_date: dateByTimeZone,
        follow_due_time : "",
        is_external: 0,
        external_source: "",
        sibling: 1,
        is_related: newLead._id,
        do_followup: 1
      });
      await newLead2.save();
      newLead.is_related = newLead2._id;
      await newLead.save();
      await mail.send({
        user: req.body.parent_email,
        subject: `Welcome - ${zone.school_display_name}`,
        msg: {
          lead_name: req.body.parent_name || "",
          center_name: zone.school_display_name || "",
          center_area: zone.area || "",
          sal: zone.cor_sal || "",
          spoc: zone.cor_spoc || "",
          email: zone.email_id || "",
          whatsapp: zone.whatsapp_number,
          contact: zone.contact_number || "",
          video: zone.center_video_url || "",
          website: zone.website_url || "",
          designation: zone.designation || "",
          mon_fir_start: zone.mon_to_fri_start_time,
          mon_fir_end: zone.mon_to_fri_end_time,
          sat_start: zone.saturday_start_time,
          sat_end: zone.saturday_end_time,
          activities: zone.activities_portal || "",
          address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
        },
        filename: "email-welcome-lead",
        title: `Welcome - ${zone.school_display_name}`,
      });
      // now bys default this lead will be POST TOUR
      // mail sent
      // await mail.send({
      //   user: req.body.parent_email,
      //   subject: "Thank You",
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
      //   filename: "email-post-tour-lead",
      //   title: "Thank You",
      // });
      req.flash('success', 'Form Submitted!');
      res.redirect("back");
      return;
    } else {

      const randomNumber = Math.floor(100000 + Math.random() * 900000);
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
      if (req.body.secondary_first_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_second_whatsapp == "on") {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
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
        child_pre_school: "no",
        programcategory_id: req.body.programcategory_id,
        program_id: req.body.program_id ? req.body.program_id : null,
        school_id: req.body.school_id,
        zone_id: zone.zone_id,
        country_id: zone.country_id,
        viewoption: req.body.view_option,
        primary_parent: req.body.primary_parent,
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: req.body.parent_second_contact,
        secondary_parent_name: req.body.secondary_parent_name,
        secondary_parent_type: req.body.secondary_parent_type || "",
        secondary_first_contact: req.body.secondary_first_contact || "",
        secondary_Second_contact: req.body.secondary_Second_contact || "",
        secondary_second_whatsapp: sec_parent_second_whatsapp,
        secondary_first_whatsapp: sec_parent_first_whatsapp,
        secondary_whatsapp: sec_whatsapp_number,
        secondary_email: req.body.secondary_email || "",
        secondary_education: req.body.secondary_education || "",
        secondary_profession: req.body.secondary_profession || "",
        parent_email: req.body.parent_email,
        parent_education: req.body.parent_education,
        parent_profession: req.body.parent_profession,
        parent_country: req.body.parent_country.split("|")[1] ? req.body.parent_country.split("|")[1] : null,
        parent_state: req.body.parent_state.split("|")[1] ? req.body.parent_state.split("|")[1] : null,
        parent_pincode: req.body.parent_pincode,
        parent_area: req.body.parent_area,
        parent_city: req.body.parent_city.split("|")[1] ? req.body.parent_city.split("|")[1] : null,
        parent_know_aboutus: req.body.parent_know_aboutus ? req.body.parent_know_aboutus : [],
        parent_whatsapp: whatsapp_number,
        parent_second_whatsapp: parent_second_whatsapp,
        parent_first_whatsapp: parent_first_whatsapp,
        source_category: "direct-walk-in",
        status_id: "63b40661f1f372a8e4fdb102",
        substatus_id: "63b40b1cf1f372a8e4fdb12f",
        stage: "Post Tour",
        // remark: req.body.remark,
        // action_taken: req.body.action_taken ? req.body.action_taken : [],
        type: "enquiry",
        initial_status: "63b40661f1f372a8e4fdb102",
        initial_sub_status: "63b40b1cf1f372a8e4fdb12f",
        initial_action: [],
        initial_notes: "",
        enrolled: 0,
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
      await mail.send({
        user: req.body.parent_email,
        subject: `Welcome - ${zone.school_display_name}`,
        msg: {
          lead_name: req.body.parent_name || "",
          center_name: zone.school_display_name || "",
          center_area: zone.area || "",
          sal: zone.cor_sal || "",
          spoc: zone.cor_spoc || "",
          email: zone.email_id || "",
          whatsapp: zone.whatsapp_number,
          contact: zone.contact_number || "",
          video: zone.center_video_url || "",
          website: zone.website_url || "",
          designation: zone.designation || "",
          activities: zone.activities_portal || "",
          address: { house: zone.house_no, street: zone.street, landmark: zone.landmark, area: zone.area, city: zone.city, state: zone.state, pincode: zone.pincode }
        },
        filename: "email-welcome-lead",
        title: `Welcome - ${zone.school_display_name}`,
      });
      req.flash('success', 'Form Submitted!');
      res.redirect("back");
      return;
    }
  }catch(err){
    console.log(err);
    // return;
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
}

exports.thankYou = (req, res, next) => {
  try {
    return res.render('admin/thank-you');
  } catch (err) {
    console.log(err);
    console.log('THANK YOU ERROR');
    return;
  }
};
