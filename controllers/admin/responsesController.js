const mongoose = require("mongoose");
const _ = require('lodash');
const Feed = mongoose.model("Feed");
const Message = mongoose.model("Message");
const Response = mongoose.model("Response");
const Followup = mongoose.model("Followup");
const Center = mongoose.model("Center");
const Acknowledgment = mongoose.model("Acknowledgment");
const Lead = mongoose.model("Lead");
const helper = require("../../handlers/helper");
const mail = require("../../handlers/mail");
const moment = require("moment");
const momentZone = require("moment-timezone");
const path = require('path');
const ObjectId = require("mongodb").ObjectId;
const Program = mongoose.model("Program");
const Programcategory = mongoose.model("Programcategory");

exports.test = (req, res) => {
  res.send("hey");
};

exports.allResponses = async (req, res, next) => {
  try {
    let messages;
    let admin_check;
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      messages = await Message.aggregate([
        {
          $match: {
            status: "active",
          },
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
        // {
        //   $sort: {
        //     "total.sent_count": -1,
        //   },
        // },
      ]);
      admin_check = "super_admin"
    } else {
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      messages = await Message.aggregate([
        {
          $match: {
            $or:[
              {center_id: {$in:centers}},
              {added_by: 1}
            ]
          },
        },
        {
          $match: {
            status: "active",
          },
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
        // {
        //   $sort: {
        //     "total.sent_count": -1,
        //   },
        // },
      ]);
      admin_check = "non_admin"
    }

    // console.log("messages--", messages);

    return res.render("admin/all-quick-response-msgs", {
      title: "Quick Response",
      messages,
      admin_check
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "allResponses not working - get request",
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

exports.deatilResponse = async (req, res, next) => {
  try {
    let leads;
    let programs;
    let centersObj = [];
    let message = await Message.findOne({ _id: req.params.message_id });
    const StatusCollection = mongoose.connection.db.collection("statuses")
    const statusess = await StatusCollection.find({_id: {$nin :[ObjectId("64394ba0b858bfdf6844e96e"), ObjectId("64394baeb858bfdf6844e96f"), ObjectId("643d129984abb0ac02beacc6"), ObjectId("65265448d072d7ac1a6f022d"), ObjectId("65265479d072d7ac1a6f022e") ]} }).sort({
      order: 1
    }).toArray();

    if (req.session.user && req.session.user.main && req.session.user.main == req.config.admin.main) {
      leads = await Lead.find({});
      programs = await Program.find({ status: "active" }, { program_name: 1 });
    } else {
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      centersObj = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      leads = await Lead.find({ school_id: {$in:centersObj} });
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

    }

    return res.render("admin/quick-response-msgs", {
      title: "Quick Response",
      message,
      leads,
      statusess,
      programs,
      moment,
      super_admin: req.session.user && req.session.user.main ? 1 : 0
    });
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "detailResponses not working - get request",
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

exports.whatsappResponse = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    // console.log(req.params,"sending whatsapp");
    // return;
    // console.log(req.body.type,"bodyy")
    // console.log(req.body.type.msg,"msg")
    // console.log(req.body.type.attachment,"attachment")
    // return
    let msg = req.body.type.msg;
    let subject = req.body.type.subject;
    let string = "@client_name";
    // const StatusCollection = mongoose.connection.db.collection("statuses");
    // const subStatusCollection = mongoose.connection.db.collection("substatuses");
    // console.log(msg.includes(string),"ischecking");
    let lead = await Lead.findOne({_id:req.params.id.split("|")[0]});

    // let statusID = await StatusCollection.find({ _id: mongoose.Types.ObjectId(lead.status_id.toString()) }).toArray();
    // let subStatusID = await subStatusCollection.find({ _id: mongoose.Types.ObjectId(lead.substatus_id.toString()) }).toArray();
    let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));

    // return;
    // console.log(req.params.id.split("|")[3],"checking")
    // return;
    // var dateByTimeZone = momentZone.tz(Date.now(), timeZone);
    let newMsg;
    let message_id = req.params.id.split("|")[1];
    // let whatsapp_no = lead.parent_whatsapp
    // let email_id = lead.parent_email
    let whatsapp_no = req.params.id.split("|")[3]
    let email_id = req.params.id.split("|")[3]
    if(msg.includes(string)){
      newMsg = msg.replace("@client_name",`${lead.parent_name}`);
    } else {
      newMsg = req.body.type.msg
    }
    // console.log('new hai-----', newMsg);
    // console.log("encoded hai---",encodeURIComponent(newMsg));
    // let finMsg = encodeURIComponent(newMsg);
    // let finMsg = newMsg
    // console.log(finMsg,"finMsg")
    // console.log(newMsg,"newMsg")
    // return;
    let checkwhastapp = req.params.id.split("|")[2];
    // Save feed module
    let feed;
    let centeridForFeed = [];
    let userType;
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // admin
      userType = "admin";
      feed = await Feed.countDocuments({});
    } else {
      // non-admin
      userType = "nonadmin";
      centeridForFeed = objectIdArray
      feed = await Feed.countDocuments({
        center_id: {
          $in: objectIdArray
        }
      });
    }
    const saveFeed = new Feed({
      parent_name: lead.parent_name,
      msg: newMsg,
      msg_id: message_id,
      center_id: centeridForFeed,
      user_type: userType,
      'last_sent.last_date': moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY"),
      'last_sent.last_time': moment.utc().tz("Asia/Kolkata").format("hh:mm A"),
      medium: checkwhastapp == "whatsapp" ? "Whatsapp" : "E-mail",
      count: feed + 1,
      updatedBy_name: req.session.user.name
    });
    await saveFeed.save();
    // console.log('HEEEEEEEEEEEEEEEEEEEE')
    if (checkwhastapp == "whatsapp") {
      // console.log("whatshapp")
      let finMsg = encodeURIComponent(newMsg);
      const timeZone = momentZone.tz.guess();
      // console.log(timeZone);
      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY")
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm A")
      // console.log(last_time,"last_time")
      // return;
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a")
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
      // console.log(last_date_time)
      let lead_id = req.params.id.split("|")[0];
      let message = await Message.findById({ _id: message_id })
      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in: objectIdArray}}]})
      // console.log(response, "response");
      if (response) {
        // console.log("11")
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394ba0b858bfdf6844e96e",
          substatus_id: "64394c0cb858bfdf6844e973",
          follow_status: "Quick Response (Whatsapp)",
          follow_sub_status: "WhatsApp",
          // action_taken: lead.action_taken && lead.action_taken.length && !lead.action_taken.includes("WhatsApp message sent") ? lead.action_taken.push("WhatsApp message sent") : lead.action_taken,
          action_taken: "",
          enq_stage: lead.stage,
          type: lead.type,
          notes: newMsg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "whatsapp",
          order: followupsOrder + 1
        });
        // console.log(newFollowUp);
        // return
        await newFollowUp.save();
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]})
        // console.log(acknowledgmentData,"acknowledgmentData--->")
        if(acknowledgmentData){
          // console.log("data find Updated->>>>>>>>")
          const updaeacknowledgmewnt = Acknowledgment.updateOne({
            _id:acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.session.user.view_option,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              req.flash('error', req.responseAdmin.SOMETHING_ERR);
              res.redirect(req.responseUrl.DASHBOARD_URL);
              return;
            }
          })
        } else {
          // console.log("data not find ->>>>>>>")
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.session.user.view_option,
            updatedBy_name: req.session.user.name,
            updatedBy: req.session.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact

          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id, center_id: {$in:objectIdArray}
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              center_id: req.session.user.center_id,
              // center_id: lead.school_id,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("back");
            return;
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(req.params.id.split("|")[0]) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          // req.flash("success", "Response updated Successfully!");
          // res.redirect(`https://api.whatsapp.com/send/?phone=${whatsapp_no}&text=${newMsg}`);
          res.status(200).json({
            msg: "whstappmesseag",
            data: `https://wa.me/${whatsapp_no}?text=${finMsg}`,
            code: 200
          })
          return;
        });
      } else {
        // console.log("222")
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.session.user.center_id,
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
        });
        await newResponse.save();
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]})
        // console.log(acknowledgmentData,"acknowledgmentData--->")
        if(acknowledgmentData){
          // console.log("data find Updated->>>>>>>>")
          const updaeacknowledgmewnt = Acknowledgment.updateOne({
            _id:acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.session.user.view_option,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              req.flash('error', req.responseAdmin.SOMETHING_ERR);
              res.redirect(req.responseUrl.DASHBOARD_URL);
              return;
            }
          })
        }else{
          // console.log("data not find ->>>>>>>")
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.session.user.view_option,
            updatedBy_name: req.session.user.name,
            updatedBy: req.session.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        // await newAcknowledgment.save();
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        // console.log(lead_id, "-----------------lead_id");
        // console.log(followupsOrder, "----------followupsOrder");
        const newFollowUp = new Followup({
          status_id: "64394ba0b858bfdf6844e96e",
          substatus_id: "64394c0cb858bfdf6844e973",
          follow_status: "Quick Response (Whatsapp)",
          follow_sub_status: "WhatsApp",
          action_taken: "",
          // action_taken: lead.action_taken && lead.action_taken.length && !lead.action_taken.includes("WhatsApp message sent") ? lead.action_taken.push("WhatsApp message sent") : lead.action_taken,
          enq_stage: lead.stage,
          type: lead.type,
          notes: msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 1,
          is_email: 0,
          comm_mode: "whatsapp",
          order: followupsOrder + 1
        });
        await newFollowUp.save();
        // req.flash("success", "Response updated Successfully! ");
        // res.redirect("/admin/lead/all");
        // res.redirect(`https://api.whatsapp.com/send/?phone=${whatsapp_no}&text=${newMsg}`);
        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(req.params.id.split("|")[0]) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        res.status(200).json({
          msg: "whstappmesseag",
          data: `https://wa.me/${whatsapp_no}?text=${finMsg}`,
          code: 200
        })
        return;
      }
    } else {
      // let finMsg = newMsg;
      let finMsg = newMsg.replace(/\n/g,"<br>");
      // console.log(JSON.stringify(finMsg));
      // return;
      //  console.log("email")
      // console.log(req.params);
      // console.log("email");
      const timeZone = momentZone.tz.guess();
      // console.log(timeZone);
      const last_date = moment.utc().tz("Asia/Kolkata").format("DD-MM-YYYY")
      const last_time = moment.utc().tz("Asia/Kolkata").format("hh:mm a")
      const last_date_time = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm a")
      const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
      // console.log(last_date_time)
      let lead_id = req.params.id.split("|")[0];
      let message_id = req.params.id.split("|")[1];
      let message = await Message.findById({ _id: message_id })
      let response = await Response.findOne({$and:[{msg_id: message_id},{center_id: {$in:objectIdArray}}]})
      // console.log(response, "MESSAGE");
      if (response) {
        // console.log("11")
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          // action_taken: lead.action_taken && lead.action_taken.length && !lead.action_taken.includes("WhatsApp message sent") ? lead.action_taken.push("WhatsApp message sent") : lead.action_taken,
          enq_stage: lead.stage,
          type: lead.type,
          notes: msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]})
        // console.log(acknowledgmentData,"acknowledgmentData--->")
        if(acknowledgmentData){
          // console.log("data find Updated->>>>>>>>")
          const updaeacknowledgmewnt = Acknowledgment.updateOne({
            _id:acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.session.user.view_option,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
              last_sent: dateByTimeZone,
              center_id: objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              req.flash('error', req.responseAdmin.SOMETHING_ERR);
              res.redirect(req.responseUrl.DASHBOARD_URL);
              return;
            }
          })
        }else{
          // console.log("data not find ->>>>>>>")
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.session.user.view_option,
            updatedBy_name: req.session.user.name,
            updatedBy: req.session.user._id,
            last_sent: dateByTimeZone,
            center_id: objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const updateFollowup = await Response.updateOne(
          {
            msg_id: message_id,center_id: {$in:objectIdArray}
          },
          {
            $set: {
              lead_id: lead_id,
              msg_id: message_id,
              last_sent: dateByTimeZone,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              // center_id: lead.school_id,
              center_id: req.session.user.center_id,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
            },
            $inc: {
              sent_count: 1
            }
          },
          { new: true }
        ).exec(async (err, result) => {
          if (err) {
            console.log(err,"err")
            req.flash("error", "Something went wrong!");
            res.redirect("back");
            return;
          }
          await Lead.updateOne(
            { _id: mongoose.Types.ObjectId(req.params.id.split("|")[0]) },
            {
              updatedAt: dateByTimeZone
            }
          ).exec();
          // console.log(updateFollowup,"updateFollowupupdateFollowup")
          // req.flash("success", "Response updated Successfully!");
          // res.redirect(`/admin/lead/all`);
          // return;
          // console.log("mailend")
          await mail.send2({
            user: email_id,
            subject: subject,
            // msg: finMsg,
            msg: {msg :finMsg, attachment: req.body.type.attachment || []},
            filename: "email-message-send",
            title: "KIDO India",
          });
          res.status(200).json({
            msg: "email",
            email: email_id,
            newmsg: finMsg,
            // data: `https://api.whatsapp.com/send/?phone=${whatsapp_no}&text=${newMsg}`,
            // data: `https://mail.google.com/mail/u/0/?fs=1&to=${email_id}&tf=cm&su="Kido"&body=${newMsg}`,
            code: 200
          })
          return;
        });
      } else {
        // console.log("222")
        const newResponse = new Response({
          lead_id: lead_id,
          msg_id: message_id,
          file_id: "",
          type: "msg",
          sent_count: 1,
          last_sent: dateByTimeZone,
          'last_sent_moment.last_date': last_date,
          'last_sent_moment.last_time': last_time,
          'last_sent_moment.last_date_time': last_date_time,
          // center_id: lead.school_id,
          center_id: req.session.user.center_id,
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
        });
        await newResponse.save();
        let acknowledgmentData = await Acknowledgment.findOne({$and:[{msg_id:message_id},{lead_id:lead_id}]})
        // console.log(acknowledgmentData,"acknowledgmentData--->")
        if(acknowledgmentData){
          // console.log("data find Updated->>>>>>>>")
          const updaeacknowledgmewnt = Acknowledgment.updateOne({
            _id:acknowledgmentData._id
          }, {
            $set: {
              title: message.title,
              msg: newMsg,
              msg_id: message_id,
              lead_id: lead_id,
              viewoption: req.session.user.view_option,
              updatedBy_name: req.session.user.name,
              updatedBy: req.session.user._id,
              last_sent: dateByTimeZone,
              center_id:objectIdArray,
              'last_sent_moment.last_date': last_date,
              'last_sent_moment.last_time': last_time,
              "last_sent_moment.last_date_time": last_date_time,
              lead_no:lead.lead_no,
              lead_date:lead.lead_date,
              child_first_name:lead.child_first_name,
              child_last_name:lead.child_last_name,
              parent_name:lead.parent_name,
              parent_email:lead.parent_email,
              parent_whatsapp:lead.parent_whatsapp,
              parent_first_contact: lead.parent_first_contact
            },
          }, { new: true }
          ).exec((err, result) => {
            if (err) {
              req.flash('error', req.responseAdmin.SOMETHING_ERR);
              res.redirect(req.responseUrl.DASHBOARD_URL);
              return;
            }
          })
        }else{
          // console.log("data not find ->>>>>>>")
          const newAcknowledgment = new Acknowledgment({
            title: message.title,
            msg: newMsg,
            msg_id: message_id,
            lead_id: lead_id,
            viewoption: req.session.user.view_option,
            updatedBy_name: req.session.user.name,
            updatedBy: req.session.user._id,
            last_sent: dateByTimeZone,
            center_id:objectIdArray,
            'last_sent_moment.last_date': last_date,
            'last_sent_moment.last_time': last_time,
            "last_sent_moment.last_date_time": last_date_time,
            lead_no:lead.lead_no,
            lead_date:lead.lead_date,
            child_first_name:lead.child_first_name,
            child_last_name:lead.child_last_name,
            parent_name:lead.parent_name,
            parent_email:lead.parent_email,
            parent_whatsapp:lead.parent_whatsapp,
            parent_first_contact: lead.parent_first_contact
          });
          await newAcknowledgment.save();
        }
        const followupsOrder = await Followup.countDocuments({ lead_id: lead_id });
        const newFollowUp = new Followup({
          status_id: "64394baeb858bfdf6844e96f",
          substatus_id: "64394c1bb858bfdf6844e974",
          follow_status: "Quick Response (Email)",
          follow_sub_status: "Email",
          action_taken: "",
          // action_taken: lead.action_taken && lead.action_taken.length && !lead.action_taken.includes("WhatsApp message sent") ? lead.action_taken.push("WhatsApp message sent") : lead.action_taken,
          enq_stage: lead.stage,
          type: lead.type,
          notes: msg,
          follow_up_date: dateByTimeZone,
          follow_up_time: last_time,
          date_sort: moment().toISOString(),
          remark: "",
          updatedBy_name: req.session.user.name,
          updatedBy: req.session.user._id,
          lead_id: lead_id,
          center_id: lead.school_id,
          someday: 0,
          no_followup: 0,
          country_id: lead.country_id,
          zone_id: lead.zone_id,
          source_category: lead.source_category,
          lead_no: lead.lead_no,
          lead_name: lead.parent_name,
          child_name: lead.child_first_name ? `${lead.child_first_name} ${lead.child_last_name}` : "",
          is_whatsapp: 0,
          is_email: 1,
          comm_mode: "email",
          order: followupsOrder + 1
        });
        await newFollowUp.save();
        // req.flash("success", "Response updated Successfully! ");
        // res.redirect("/admin/lead/all");
        // return;
        await Lead.updateOne(
          { _id: mongoose.Types.ObjectId(req.params.id.split("|")[0]) },
          {
            updatedAt: dateByTimeZone
          }
        ).exec();
        await mail.send2({
          user: email_id,
          subject: subject,
          msg: {msg :finMsg, attachment: req.body.type.attachment},
          filename: "email-message-send",
          title: "KIDO India",
        });
        res.status(200).json({
          msg: "email",
          email: email_id,
          newmsg: finMsg,
          // data: `https://api.whatsapp.com/send/?phone=${whatsapp_no}&text=${newMsg}`,
          // data: `https://mail.google.com/mail/u/0/?fs=1&to=${email_id}&tf=cm&su="Kido"&body=${newMsg}`,
          code: 200
        })
        return;
      }
    }

  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "whastappResponses not working - get request",
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
// exports.emailResponse = async (req, res, next) => {
//   try {
//     console.log(req.params);
//     console.log("email");
//     const timeZone = momentZone.tz.guess();
//     // console.log(timeZone);
//     const last_date = moment(new Date()).format("DD-MM-YYYY")
//     const last_time = moment(new Date()).format("HH:mm:ss")
//     const last_date_time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
//     const dateByTimeZone = momentZone.tz(Date.now(), timeZone);
//     console.log(last_date_time)
//     let lead_id = req.params.id.split("|")[0];
//     let message_id = req.params.id.split("|")[1];
//     let message = await Message.findById({_id:message_id})
//     let response = await Response.findOne({msg_id:message_id})
//     // console.log(response, "MESSAGE");
//     if(response){
//       console.log("11")
//       const newFollowUp = new Followup({
//         follow_status: "new lead",
//         follow_sub_status: "YTC/No Response",
//         action_taken: "WhatsApp message sent",
//         enq_stage: "lead",
//         notes: message.msg,
//         follow_up_date: dateByTimeZone,
//         follow_up_time: last_time,
//         remark: req.body.remark || "",
//         updatedBy_name: req.session.user.name,
//         updatedBy: req.session.user._id,
//         lead_id: lead_id,
//       });
//       await newFollowUp.save();
//       const newAcknowledgment = new Acknowledgment({
//         title:message.title,
//         msg:message.msg,
//         msg_id:message_id,
//         lead_id:lead_id,
//         viewoption:req.session.user.view_option,
//         updatedBy_name: req.session.user.name,
//         updatedBy: req.session.user._id,
//         last_sent:dateByTimeZone,
//         'last_sent_moment.last_date':last_date,
//         'last_sent_moment.last_time':last_time,
//         "last_sent_moment.last_date_time":last_date_time,

//       });
//       await newAcknowledgment.save();
//       const updateFollowup = await Response.updateOne(
//       {
//         msg_id: message_id,
//       },
//       {
//         $set: {
//           lead_id:lead_id,
//           msg_id:message_id,
//           last_sent:dateByTimeZone,
//           'last_sent_moment.last_date':last_date,
//           'last_sent_moment.last_time':last_time,
//           "last_sent_moment.last_date_time":last_date_time,
//         },
//         $inc:{
//           sent_count : 1
//         }
//       },
//       { new: true }
//     ).exec((err, result) => {
//       if (err) {
//         req.flash("error", "Something went wrong!");
//         res.redirect("back");
//         return;
//       }
//       req.flash("success", "Response updated Successfully!");
//       res.redirect(`/admin/responses/all`);
//       return;
//     });
//     }else{
//       console.log("222")
//       const newResponse = new Response({
//         lead_id:lead_id,
//         msg_id:message_id,
//         file_id:"",
//         type:"msg",
//         sent_count: 1,
//         last_sent:dateByTimeZone,
//         'last_sent_moment.last_date':last_date,
//         'last_sent_moment.last_time':last_time,
//         'last_sent_moment.last_date_time':last_date_time,
//       });
//       await newResponse.save();
//       const newAcknowledgment = new Acknowledgment({
//         title:message.title,
//         msg:message.msg,
//         msg_id:message_id,
//         lead_id:lead_id,
//         viewoption:req.session.user.view_option,
//         updatedBy_name: req.session.user.name,
//         updatedBy: req.session.user._id,
//         last_sent:dateByTimeZone,
//         'last_sent_moment.last_date':last_date,
//         'last_sent_moment.last_time':last_time,
//         "last_sent_moment.last_date_time":last_date_time,

//       });
//       await newAcknowledgment.save();
//       const newFollowUp = new Followup({
//         follow_status: "new lead",
//         follow_sub_status: "YTC/No Response",
//         action_taken: "WhatsApp message sent",
//         enq_stage: "lead",
//         notes: "msg",
//         follow_up_date: dateByTimeZone,
//         follow_up_time: last_time,
//         remark: req.body.remark || "",
//         updatedBy_name: req.session.user.name,
//         updatedBy: req.session.user._id,
//         lead_id: lead_id,
//       });
//       await newFollowUp.save();
//       req.flash("success", "Response updated Successfully! ");
//       res.redirect("/admin/responses/all");
//       return;
//     }

//   } catch (err) {
//     helper.errorDetailsForControllers(
//       err,
//       "whastappResponses not working - get request",
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
    // console.log("AAAAAAAAAAA");
    let newArr = [];
    let aggregateQue = [];
    // console.log(req.body.adminCheck, "req.body");
    // console.log(req.query, "req.queryquery");
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {

      const sortingArr = ["title", "createdAt", "employee", "result"];

      // console.log("admin");
      if(req.query.sSearch){
        aggregateQue = [
          {
            $match: {
              status: "active",
            },
          },
          {
            '$match': {
              $or: [
                {
                  title: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                },
                {
                  msg: {
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
              localField: "_id",
              foreignField: "msg_id",
              as: "result",
            },
          },
          {
            $project:{
              "_id":1,
              "title":1,
              "msg":1,
              "when_to_use":1,
              "attachment":1,
              "type":1,
              "employee": 1,
              "result":{
                $sum:"$result.sent_count"
              },
              "createdAt": 1
            }
          },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
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
          // {
          //   $sort: {
          //     "total.sent_count": -1,
          //   },
          // },
          {
            '$skip': parseInt(req.query.iDisplayStart)
          }, {
            '$limit': parseInt(req.query.iDisplayLength)
          }
        ]
        // console.log("searcjing")

        const messages = await Message.aggregate(aggregateQue)
        aggregateQue.splice(aggregateQue.length - 2, 2)
        // console.log(aggregateQue,"aggregateQue")
        const totalCount = await Message.aggregate(aggregateQue)

        // let totalCountDoc = await Message.countDocuments({
        //   title: {
        //     $regex: req.query.sSearch,
        //     $options: '$i'
        //   },
        //   msg: {
        //     $regex: req.query.sSearch,
        //     $options: '$i'
        //   }
        // });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCount.length,
          iTotalDisplayRecords: totalCount.length,
        };
        delete aggregateQue;
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          // console.log(JSON.stringify(messages), "HSHSGHSGHSGHSGHSGHSGHSG");
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            console.log(short,"short")
            if(message.attachment && message.attachment.length){
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> <span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`,  `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`,`${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.result ? `${message.result} times`: "Not Yet Sent"}`
                ,message.when_to_use
              ]);
            }else{
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> `, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`,`${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`,`${message.result ? `${message.result} times`: "Not Yet Sent"}`
                ,message.when_to_use
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
            $sort:{createdAt:-1}
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
              localField: "_id",
              foreignField: "msg_id",
              as: "result",
            },
          },
          {
            $project:{
              "_id":1,
              "title":1,
              "msg":1,
              "when_to_use":1,
              "type":1,
              "employee": 1,
              "attachment":1,
              "result":{
                $sum:"$result.sent_count"
              },
              "createdAt": 1
            }
          },
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
          }
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
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(messages,"admin");
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            if(message.attachment && message.attachment.length){
              // console.log(message.attachment,"message.attachment" ,)
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a> <span onclick="viewAttachment('${message._id}')" id="span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.result ? `${message.result} times`: "Not Yet Sent"}`
                ,message.when_to_use,message.type
              ]);
            } else {
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.result ? `${message.result} times`: "Not Yet Sent"}`
                ,message.when_to_use,message.type
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
      const sortingArr = ["title", "createdAt", "employee", "total.sent_count", "total.last_sent"];

      // console.log("no admin");
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      if(req.query.sSearch){
        aggregateQue = [{
            $match: {
              status: "active",
              $or:[
                {center_id: {$in: centers}},
                {added_by:1}
              ]
              // center_id: ObjectId(req.session.user.center_id),
            }
          },
          {
            '$match': {
              $or: [
                {
                  title: {
                    $regex: req.query.sSearch,
                    $options: 'i'
                  }
                },
                {
                  msg: {
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
                                  { $eq: ['$center_id', centers] }
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
          // {
          //   $sort: {
          //     "total.sent_count": -1,
          //   },
          // },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          },
          {
            '$skip': parseInt(req.query.iDisplayStart)
          }, {
            '$limit': parseInt(req.query.iDisplayLength)
          }
        ]
        const messages = await Message.aggregate(aggregateQue)
        aggregateQue.splice(aggregateQue.length - 2, 2)
        // console.log(aggregateQue,"aggregateQue")
        const totalCount = await Message.aggregate(aggregateQue)
          // .skip(parseInt(req.query.iDisplayStart))
          // .limit(parseInt(req.query.iDisplayLength));
        // console.log("messages--------",messages, "messages--------")
        // let totalCountDoc = await Message.countDocuments({$or:[{center_id: ObjectId(req.session.user.center_id)},{added_by:1}],
        // title: {
        //   $regex: req.query.sSearch,
        //   $options: '$i'
        // },
        // msg: {
        //   $regex: req.query.sSearch,
        //   $options: '$i'
        // }
        // });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCount.length,
          iTotalDisplayRecords: totalCount.length,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            if(message.attachment && message.attachment.length){
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a><span onclick="viewAttachment('${message._id}')" id = "span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `,`${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`
                ,message.when_to_use
              ]);
            }else{
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `, `${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`
                ,message.when_to_use
              ]);
            }
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }else{
        // console.log(objectIdArray,"objectIdArray")
        const messages = await Message.aggregate([
          {
            $match: {
              status: "active",
              $or:[
                {center_id: {$in: centers}},
                {added_by:1}
              ]
              // center_id: ObjectId(req.session.user.center_id),
            }
          },
          // {

          //   $sort:{createdAt:-1}

          // },
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
                                  // { $in: ['$center_id', objectIdArray] }
                                  { $eq: ['$center_id', centers] }
                              ]
                          }
                      }
                  },


              ],
              as: "total",
            }
          },
          {
            $unwind: {
              path: "$total",
              preserveNullAndEmptyArrays: true,
            },
          },
          // {
          //   $sort: {
          //     "total.sent_count": -1,
          //   },
          // },
          {
            '$sort': {
              [sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1
            }
          }
        ])
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength));
        // console.log("messages--------",messages)
        let totalCountDoc = await Message.countDocuments({$or:[{center_id: {$in: centers}},{added_by:1}]});
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(messages,"final");
        if (messages.length) {
          messages.map((message) => {
            let xyz = message.msg;
            // console.log(xyz,"xyz")
            // short = xyz.replace(/(.{30})..+/, "$1…");
            short = xyz.length > 30 ? xyz.slice(0, 30 - 1) + "…" : xyz;
            // console.log(short,"short")
            if(message.attachment && message.attachment.length){
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a><span onclick="viewAttachment('${message._id}')" id="span_download" class="badge nowrap"><i class="fa fa-paperclip" style="float:right;"></i></span>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `,`${message.total ? moment(message.total.last_sent).format("MMM DD - HH:mm A") : "Not Yet Send"}`
                ,message.when_to_use
              ]);
            } else {
              newArr.push([
                `<a href="javascript:void(0)" onclick="redirectToresponse('${message._id}')">${message.title ? message.title : "Not Provided"
                }</a>`, `<a class="btn btn-link btn-primary" onclick="viewMsg('${message._id}');"><i class="fa fa-eye"></i></a>`, `${message.createdAt ? moment(message.createdAt).format("DD/MM/YYYY <br> hh:mm A") : "Not Provided"}`, `${message.employee && message.employee.length ? `${message.employee[0].first_name} ${message.employee[0].last_name}` : "Not Provided"}`, `${message.total ? `${message.total.sent_count} times` : "Not yet sent"} `, `${message.total ? moment(message.total.last_sent).format("MMM DD- HH:mm A") : "Not Yet Send"}`
                ,message.when_to_use
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
}

exports.messagedatatableFilterr = async (req, res, next) => {
  try {
    let newArr = [];
    // console.log(req.query, "req.queryquery");
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      let centers = await Center.find({status: "active"}).distinct('_id');
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];

      if (req.query.sSearch) {
        let message = await Message.findOne({ _id: req.params.message_id });
        let leads = await Lead.find({
          school_id:{ $in: centers },
          $or:[
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
          // parent_name: {
          //     $regex: req.query.sSearch,
          //     $options: '$i'
          //   }
          //   // lead_no: {
          //   //   $regex: req.query.sSearch,
          //   //   $options: '$i'
          //   // }
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id:{ $in: centers },
          $or:[
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
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li> <button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      } else {

        let message = await Message.findOne({ _id: req.params.message_id });
        // console.log(message,"message")
        let leads = await Lead.find({
          school_id:{ $in: centers }
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id:{ $in: centers }
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li> <button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }
    } else {
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      // console.log("no admin");
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      if(req.query.sSearch){
        let message = await Message.findOne({ _id: req.params.message_id });
        // let ackno_data = await Acknowledgment.find({msg_id:message._id});
        // // console.log(ackno_data,"ackno_data")
        // let lead = await Lead.aggregate([
        //   {$match:{
        //     "$and":[
        //       {
        //         school_id: req.session.user.center_id
        //       },
        //       {
        //         _id:{$in:ackno_data.map(function (ackno_data) { return mongoose.Types.ObjectId(ackno_data.lead_id); })}
        //       }
        //     ]
        //   }},
        //   {"$skip":parseInt(req.query.iDisplayStart)},
        //   {"$limit":parseInt(req.query.iDisplayLength)},

        //   {
        //     "$lookup": {
        //       "from": "acknowledgments",
        //       let: { id: '$_id' },
        //       pipeline: [
        //         {

        //           $match: {
        //             $expr: {
        //               $and: [
        //                 { $eq: ['$lead_id', '$$id'] },
        //                 { $eq: ['$msg_id', message._id] },

        //               ]
        //             }
        //           }
        //         },
        //       ],
        //       "as": "acknowledgements_data"
        //     }
        //   },
        //   { "$unwind": "$acknowledgements_data" },

        // ])

        // console.log("lead-------------",lead);
        // if (lead.length) {
        //   lead.map((lead) => {
        //     console.log(lead.acknowledgements_data.last_sent,"lead")
        //   })
        // }
        // return
        // let leads = await Acknowledgment.find({ msg_id: message._id ,center_id:req.session.user.center_id,}).populate("lead_id").sort({last_sent:-1})
        let leads = await Acknowledgment.aggregate([
          {
            $match:{
              msg_id: ObjectId(message._id),
              center_id:{$in: centers}
            }
          },
          {
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
          },
        ])
        .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
           .skip(parseInt(req.query.iDisplayStart))
           .limit(parseInt(req.query.iDisplayLength))

        let result = leads.map(a => a.lead_id);
        // console.log(leads, "racknowledgmentesponsesearching---->>")
        // return;
        // console.log(result, "result")
        // let leads = await Lead.find({ school_id: req.session.user.center_id })
        // let leads = await Lead.find({ school_id: req.session.user.center_id, _id: { $in: result } })
        //   .skip(parseInt(req.query.iDisplayStart))
        //   .limit(parseInt(req.query.iDisplayLength))
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({ school_id: {$in: centers}, _id: { $in: result } });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            // let temp = acknowledgments.find(acknowledgment => acknowledgment.lead_id)
            // // console.log(temp,"temp2")
            // // console.log(lead._id,"temp")
            // for(let i=0; i<acknowledgments.length; i++){
            //   if(acknowledgments[i].lead_id === lead._id){
            //     console.log(lead._id,acknowledgments[i].last_sent,"if" )
            //   }else{
            //     console.log(lead._id,acknowledgments[i].last_sent ,"else")
            //   }
            // }
            // console.log(moment(lead.last_sent).fromNow(),"fromnow")
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`,
              `${ lead.last_sent ? moment(lead.last_sent).fromNow() : "Not Provided" }`,
              `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'whatsapp'}${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }else{

        let message = await Message.findOne({ _id: req.params.message_id });
        // let ackno_data = await Acknowledgment.find({msg_id:message._id});
        // // console.log(ackno_data,"ackno_data")
        // let lead = await Lead.aggregate([
        //   {$match:{
        //     "$and":[
        //       {
        //         school_id: req.session.user.center_id
        //       },
        //       {
        //         _id:{$in:ackno_data.map(function (ackno_data) { return mongoose.Types.ObjectId(ackno_data.lead_id); })}
        //       }
        //     ]
        //   }},
        //   {"$skip":parseInt(req.query.iDisplayStart)},
        //   {"$limit":parseInt(req.query.iDisplayLength)},

        //   {
        //     "$lookup": {
        //       "from": "acknowledgments",
        //       let: { id: '$_id' },
        //       pipeline: [
        //         {

        //           $match: {
        //             $expr: {
        //               $and: [
        //                 { $eq: ['$lead_id', '$$id'] },
        //                 { $eq: ['$msg_id', message._id] },

        //               ]
        //             }
        //           }
        //         },
        //       ],
        //       "as": "acknowledgements_data"
        //     }
        //   },
        //   { "$unwind": "$acknowledgements_data" },

        // ])

        // console.log("lead-------------",lead);
        // if (lead.length) {
        //   lead.map((lead) => {
        //     console.log(lead.acknowledgements_data.last_sent,"lead")
        //   })
        // }
        // return
        let leads = await Acknowledgment.find({ msg_id: message._id ,center_id:{$in: centers}}).sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
        let result = leads.map(a => a.lead_id);
        // console.log(leads, "racknowledgmentesponse---->>")
        // return;
        // console.log(result, "result")
        // let leads = await Lead.find({ school_id: req.session.user.center_id })
        // let leads = await Lead.find({ school_id: req.session.user.center_id, _id: { $in: result } })
        //   .skip(parseInt(req.query.iDisplayStart))
        //   .limit(parseInt(req.query.iDisplayLength))
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({ school_id: {$in: centers}, _id: { $in: result } });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            // let temp = acknowledgments.find(acknowledgment => acknowledgment.lead_id)
            // // console.log(temp,"temp2")
            // // console.log(lead._id,"temp")
            // for(let i=0; i<acknowledgments.length; i++){
            //   if(acknowledgments[i].lead_id === lead._id){
            //     console.log(lead._id,acknowledgments[i].last_sent,"if" )
            //   }else{
            //     console.log(lead._id,acknowledgments[i].last_sent ,"else")
            //   }
            // }
            // console.log(moment(lead.last_sent).fromNow(),"fromnow")
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`,
              `${ lead.last_sent ? moment(lead.last_sent).fromNow() : "Not Provided" }`,
              `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
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
  } catch (err) {
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
}

exports.messagedatatableFilter = async (req, res, next) => {
  try {
    let newArr = [];
    let findQue = {};
    // console.log(req.query, "req.queryquery");
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      let centers = await Center.find({status: "active"}).distinct('_id');
      let message = await Message.findOne({ _id: req.params.message_id });
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];

      let aggregateQue = [
        {
          '$match': {
            'school_id': {"$in": centers}
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

      findQue = {
        school_id: {$in: centers}
      };

      if (req.query.sSearch) {
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

      if (req.query.sSearch_1) {
        findQue = {
          stage: req.query.sSearch_6
        };
        aggregateQue.unshift({
          '$match': {
            'stage': req.query.sSearch_1
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

      if (req.query.program) {
        let program = req.query.program.map(s => mongoose.Types.ObjectId(s));
        findQue = {
          program_id: {$in:program}
        };
        aggregateQue.unshift({
          '$match': {
            'program_id': {$in:program}
          }
        });
      }

      const leads = await Lead.aggregate(aggregateQue);
      aggregateQue.splice(aggregateQue.length - 2, 2);
      const totalCount = await Lead.aggregate(aggregateQue);

      let finObj = {
        sEcho: req.query.sEcho,
        iTotalRecords: totalCount.length,
        iTotalDisplayRecords: totalCount.length
      };

      delete aggregateQue;

      // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
      // console.log(finObj);
      if (leads.length) {
        leads.map((lead, i) => {
          newArr.push([
            `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
            `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li> <button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
          ]);
        });
        finObj.data = newArr;
        res.json(finObj);
      } else {
        finObj.data = newArr;
        res.json(finObj);
      }
    } else {
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      // console.log("no admin");
      let message = await Message.findOne({ _id: req.params.message_id });
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');

      let aggregateQue = [
        {
          '$match': {
            msg_id: message._id
          }
        }, {
          '$match': {
            center_id: {$in: centers}
          }
        }, {
          '$lookup': {
            'from': 'leads',
            'localField': 'lead_id',
            'foreignField': '_id',
            'as': 'leads'
          }
        }, {
          '$unwind': {
            'path': '$leads'
          }
        }, {
          '$project': {
            'title': 1,
            'msg': 1,
            'msg_id': 1,
            'lead_id': 1,
            'leads.stage': 1,
            'leads.status_id': 1,
            'leads.program_id': 1,
            'last_sent': 1,
            'lead_no': 1,
            'lead_date': 1,
            'child_first_name': 1,
            'child_last_name': 1,
            'parent_name': 1,
            'parent_email': 1,
            'parent_whatsapp': 1,
            'parent_first_contact': 1
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

      if (req.query.sSearch) {
        aggregateQue.push({
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

      if (req.query.sSearch_1) {
        aggregateQue.push({
          '$match': {
            'leads.stage': req.query.sSearch_1
          }
        });
      }

      if (req.query.status_2) {
        let status = req.query.status_2.map(s => mongoose.Types.ObjectId(s));
        aggregateQue.push({
          '$match': {
            'leads.status_id': {$in:status}
          }
        });
      }

      if (req.query.program_2) {
        let program = req.query.program_2.map(s => mongoose.Types.ObjectId(s));
        aggregateQue.push({
          '$match': {
            'leads.program_id': {$in:program}
          }
        });
      }

      // console.log(JSON.stringify(aggregateQue));

      const leads = await Acknowledgment.aggregate(aggregateQue);
      // let result = leads.map(a => a.lead_id);
      // aggregateQue.splice(aggregateQue.length - 2, 2);
      _.remove(aggregateQue, "$skip")
      _.remove(aggregateQue, "$limit")
      const totalCount = await Acknowledgment.aggregate(aggregateQue);

      let finObj = {
        sEcho: req.query.sEcho,
        iTotalRecords: totalCount.length,
        iTotalDisplayRecords: totalCount.length
      };

      delete aggregateQue;

      if (leads.length) {
        // console.log(leads)
        leads.map((lead, i) => {
          newArr.push([
            `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
            `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`,
            `${ lead.last_sent ? moment(lead.last_sent).fromNow() : "Not Provided" }`,
            `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead.lead_id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
          ]);
        });
        finObj.data = newArr;
        res.json(finObj);
      } else {
        finObj.data = newArr;
        res.json(finObj);
      }
    }
  } catch (err) {
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
}

exports.messagedatatableFilter22 = async (req, res, next) => {
  try {
    // console.log("filter22");
    // return;
    let newArr = [];
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // console.log("super adminnnn")
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      let centers = await Center.find({status: "active"}).distinct('_id');
      let message = await Message.findOne({ _id: req.params.message_id });
      // console.log(message,"message")
      if (req.query.sSearch) {
        // SEARCH DATA
        let leads = await Lead.find({
          school_id: {$in: centers},
          $or:[
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
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id: {$in: centers},
          $or:[
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
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      } else {
        // PLAIN DATA
        let leads = await Lead.find({
          school_id: {$in: centers}
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id: {$in: centers}
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }
    } else {
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      // console.log("no admin");
      // let objectIdArray = req.session.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      if(req.query.sSearch){
        let message = await Message.findOne({ _id: req.params.message_id });
        // console.log(message._id,"message")
        let acknowledgments = await Acknowledgment.find({ msg_id: message._id })
        let result = acknowledgments.map(a => a.lead_id);
        // console.log(acknowledgments,"racknowledgmentesponse")
        // console.log(result,"result")
        // let leads = await Lead.find({ school_id: req.session.user.center_id })
        let leads = await Lead.find({ school_id:  {$in: centers}, _id: { $nin: result },
          $or:[
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
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({ school_id: {$in: centers}, _id: { $nin: result } ,
          $or:[
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
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li> <button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });

          finObj.data = newArr;
          // console.log(newArr,"newArr")
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }else{

        let message = await Message.findOne({ _id: req.params.message_id });
        // console.log(message._id,"message")
        let acknowledgments = await Acknowledgment.find({ msg_id: message._id })
        let result = acknowledgments.map(a => a.lead_id);
        // console.log(acknowledgments,"racknowledgmentesponse")
        // console.log(result,"result")
        // let leads = await Lead.find({ school_id: req.session.user.center_id })
        let leads = await Lead.find({ school_id: {$in: centers}, _id: { $nin: result } })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({ school_id: {$in: centers}, _id: { $nin: result } });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });

          finObj.data = newArr;
          // console.log(newArr,"newArr")
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }
    }
  } catch (err) {
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
}

exports.messagedatatableFilter2 = async (req, res, next) => {
  try {
    // console.log("filter22");
    // return;
    let newArr = [];
    if (req.session.user.main && req.session.user.main == req.config.admin.main) {
      // console.log("super adminnnn")
      // THIS SUPER ADMIN IS NOT USABLE. IT US NOT REQUIRED. WILL DELETE THIS LATER.
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      let centers = await Center.find({status: "active"}).distinct('_id');
      let message = await Message.findOne({ _id: req.params.message_id });
      // console.log(message,"message")
      if (req.query.sSearch) {
        // SEARCH DATA
        let leads = await Lead.find({
          school_id: {$in: centers},
          $or:[
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
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id: {$in: centers},
          $or:[
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
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      } else {
        // PLAIN DATA
        let leads = await Lead.find({
          school_id: {$in: centers}
        })
          .skip(parseInt(req.query.iDisplayStart))
          .limit(parseInt(req.query.iDisplayLength))
          .sort({[sortingArr[req.query.iSortCol_0 ? req.query.iSortCol_0 : 1]]: req.query.sSortDir_0 == 'asc' ? 1 : -1})
        // console.log(leads,"leads")
        let totalCountDoc = await Lead.countDocuments({
          school_id: {$in: centers}
        });
        let finObj = {
          sEcho: req.query.sEcho,
          iTotalRecords: totalCountDoc,
          iTotalDisplayRecords: totalCountDoc,
        };
        // newArr.push([`<a href="javascript:void(0)" onclick="redirectToEditleed('${lead._id}')">${lead.lead_no ? lead.lead_no : "Not Provided"}</a>`
        // console.log(finObj);
        if (leads.length) {
          leads.map((lead, i) => {
            newArr.push([
              `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
              `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
            ]);
          });
          finObj.data = newArr;
          res.json(finObj);
        } else {
          finObj.data = newArr;
          res.json(finObj);
        }
      }
    } else {
      const sortingArr = ["lead_no", "lead_date", "parent_name", "child_first_name", "child_last_name", "parent_email", "parent_whatsapp"];
      // console.log("no admin");
      let message = await Message.findOne({ _id: req.params.message_id });
      let centers = await Center.find({_id: {$in: req.session.user.center_id}, status: "active"}).distinct('_id');
      let acknowledgments = await Acknowledgment.find({ msg_id: message._id })
      let result = acknowledgments.map(a => a.lead_id);

      let aggregateQue = [
        {
          '$match': {
            'school_id': {$in: centers}
          }
        }, {
          '$match': {
            '_id': { $nin: result }
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

      if (req.query.sSearch) {
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

      if (req.query.sSearch_1) {
        findQue = {
          stage: req.query.sSearch_6
        };
        aggregateQue.unshift({
          '$match': {
            'stage': req.query.sSearch_1
          }
        });
      }

      if (req.query.status_1) {
        let status = req.query.status_1.map(s => mongoose.Types.ObjectId(s));
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

      if (req.query.program_1) {
        let program = req.query.program_1.map(s => mongoose.Types.ObjectId(s));
        findQue = {
          program_id: {$in:program}
        };
        aggregateQue.unshift({
          '$match': {
            'program_id': {$in:program}
          }
        });
      }

      const leads = await Lead.aggregate(aggregateQue);
      aggregateQue.splice(aggregateQue.length - 2, 2);
      const totalCount = await Lead.aggregate(aggregateQue);

      let finObj = {
        sEcho: req.query.sEcho,
        iTotalRecords: totalCount.length,
        iTotalDisplayRecords: totalCount.length
      };

      delete aggregateQue;

      if (leads.length) {
        leads.map((lead, i) => {
          newArr.push([
            `${lead.lead_no ? lead.lead_no : "Not Provided"}`, `${lead.lead_date ? moment(lead.lead_date).format("L") : "Not Provided"}`, `${lead.parent_name ? lead.parent_name : "Not Provided"}`, `${lead.child_first_name ? lead.child_first_name : "Not Provided"}`, `${lead.child_last_name ? lead.child_last_name : "Not Provided"}`, `${lead.parent_email ? lead.parent_email : "Not Provided"}`,
            `${lead.parent_whatsapp ? lead.parent_whatsapp : "Not Provided"}`, `<ul class="response_tbl_action_btn"><li><button type="button" class="btn btn-link btn-primary dim-whatsapp-${i}" data-toggle="tooltip" title="message" data-original-title="Send Whatsapp" onclick="redirectToallmessage('${lead._id}|${message._id}|${'whatsapp'}|${lead.parent_whatsapp}', 'dim-whatsapp-${i}')"><i class="fab fa-whatsapp"></i></button></li><li><button type="button" class="btn btn-link btn-primary dim-email-${i}" data-toggle="tooltip" title="message" data-original-title="Send Email" onclick="redirectToallmessage('${lead._id}|${message._id}|${'email'}|${lead.parent_email}', 'dim-email-${i}')"><i class="fa fa-envelope"></i></button></li></ul>`,
          ]);
        });

        finObj.data = newArr;
        // console.log(newArr,"newArr")
        res.json(finObj);
      } else {
        finObj.data = newArr;
        res.json(finObj);
      }
    }
  } catch (err) {
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
}

exports.downoadFile = async (req, res, next) => {
  try {
    // console.log(req.params,"req.params")
    // const filePath = `C:/workspace/kido_backend/public/uploads/${req.params.file}`;
     const filePath = path.join(__dirname, `../../public/uploads/${req.params.file}`)
    // console.log(filePath,"filePathfilePath"  )
    res.download(filePath, req.params.file);
    // console.log(filePath)
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "downoadFile not working - post request",
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

exports.previewMessage = async (req, res, next) => {
  try {
    const msgID = req.body.msg_id;
    const message = await Message.findOne({ _id: msgID });
    // console.log(message);
    return res.status(200).json({
      message: "message",
      data: message,
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(
      err,
      "downoadFile not working - post request",
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
