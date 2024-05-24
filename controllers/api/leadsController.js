const mongoose = require('mongoose');
const Lead = mongoose.model('Lead');
const Center = mongoose.model("Center");
const Program = mongoose.model("Program");
const Followup = mongoose.model('Followup');
const Bookmark = mongoose.model('Bookmark');
const RoleAssign = mongoose.model('RoleAssign');
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const momentZone = require('moment-timezone');
const moment = require("moment");
const _ = require("lodash");
const mail = require("../../handlers/mail");
const helpers = require("../../handlers/helper");
const cacher = require("../../services/redis/cacher");
const config = require('../../config');

exports.getAllLeads = async (req, res, next) => {
  return res.send('jeu');
};

exports.getAllTodayLeads = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    console.log(req.query,"paramss")
    let sorting_feild = {lead_date: -1}
    if(req.query){
      if(req.query.data){
        if(req.query.data == "asc"){
          sorting_feild = {lead_date : 1}
        }else{
          sorting_feild = {lead_date: -1}
        }
      }else if(req.query.lead_name){
        if(req.query.lead_name == "asc"){
          sorting_feild = {parent_name : 1}
        }else{
          sorting_feild = {parent_name : -1}
        }
      }
    }else{
      console.log("else")
      sorting_feild = {lead_date: -1}
    }
    console.log(sorting_feild)
    // return
    if (req.user && req.user.main == req.config.admin.main) {
      const leadsPromise = Lead.leadData(isAdmin = 1, start, end, req.user._id, skip, limit, null ,sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Leads Today", {total_records :count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.leadData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead  Today", {total_records :count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allLeadToday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllYesterdayLeads = async (req, res, next) => {
  try {
      const timeZone = momentZone.tz.guess();
      let start = momentZone.tz(moment().subtract(1, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(moment().subtract(1, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
      const page = req.params.page || 1;
      const limit = 10;
      const skip = (page * limit) - limit;
      let sorting_feild = {lead_date: -1}
      if(req.query){
        if(req.query.data){
          if(req.query.data == "asc"){
            sorting_feild = {lead_date : 1}
          }else{
            sorting_feild = {lead_date: -1}
          }
        }else if(req.query.lead_name){
          if(req.query.lead_name == "asc"){
            sorting_feild = {parent_name : 1}
          }else{
            sorting_feild = {parent_name : -1}
          }
        }
      }else{
        console.log("else")
        sorting_feild = {lead_date: -1}
      }
      console.log(sorting_feild)
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise = Lead.leadData(isAdmin = 1, start, end, req.user._id, skip, limit, null, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead  Yesterday", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.leadData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead  Yesterday", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allLeadYesterday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllThisWeakLeads = async (req, res, next) => {
  try {
      const timeZone = momentZone.tz.guess();
      let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(moment().day(7).valueOf(), "Asia/Kolkata").endOf('day').toDate();
      console.log(start,end)
      const page = req.params.page || 1;
      const limit = 10;
      const skip = (page * limit) - limit;
      let sorting_feild = {lead_date: -1}
      if(req.query){
        if(req.query.data){
          if(req.query.data == "asc"){
            sorting_feild = {lead_date : 1}
          }else{
            sorting_feild = {lead_date: -1}
          }
        }else if(req.query.lead_name){
          if(req.query.lead_name == "asc"){
            sorting_feild = {parent_name : 1}
          }else{
            sorting_feild = {parent_name : -1}
          }
        }
      }else{
        console.log("else")
        sorting_feild = {lead_date: -1}
      }
      console.log(sorting_feild)
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise = Lead.leadData(isAdmin = 1, start, end, req.user._id, skip, limit, null, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead This Weeks", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.leadData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead This Weeks", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allLeadThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllThisMonthLeads = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('month').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    let sorting_feild = {lead_date: -1}
      if(req.query){
        if(req.query.data){
          if(req.query.data == "asc"){
            sorting_feild = {lead_date : 1}
          }else{
            sorting_feild = {lead_date: -1}
          }
        }else if(req.query.lead_name){
          if(req.query.lead_name == "asc"){
            sorting_feild = {parent_name : 1}
          }else{
            sorting_feild = {parent_name : -1}
          }
        }
      }else{
        console.log("else")
        sorting_feild = {lead_date: -1}
      }
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise = Lead.leadData(isAdmin = 1, start, end, req.user._id, skip, limit, null, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead This Months", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.leadData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead This Months", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allLeadThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllOlderLeads = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(730, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate(); // last 2 years
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    let sorting_feild = {lead_date: -1}
      if(req.query){
        if(req.query.data){
          if(req.query.data == "asc"){
            sorting_feild = {lead_date : 1}
          }else{
            sorting_feild = {lead_date: -1}
          }
        }else if(req.query.lead_name){
          if(req.query.lead_name == "asc"){
            sorting_feild = {parent_name : 1}
          }else{
            sorting_feild = {parent_name : -1}
          }
        }
      }else{
        console.log("else")
        sorting_feild = {lead_date: -1}
      }
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise = Lead.leadData(isAdmin = 1, start, end, req.user._id, skip, limit, null, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead Older", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.leadData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray, sorting_feild)
      const countPromise = Lead.leadCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Lead Older", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allLeadThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllTodayEnquiry = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    console.log(start,end)
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise= Lead.enquiryData(isAdmin = 1, start, end, req.user._id, skip, limit, null)
      const countPromise = Lead.enquiryCount(isAdmin = 1, start, end, null)
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All enquiries today", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      console.log(objectIdArray,"787")
      const leadsPromise=  Lead.enquiryData(isAdmin = 0, start, end, req.user._id , skip, limit, objectIdArray)
      // console.log(leadsPromise,"chchk")
      const countPromise = Lead.enquiryCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      console.log(leads)
      console.log(count)
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All enquiries today", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allenquirytoday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllYesterdayEnquiry = async (req, res, next) => {
  try {
      const timeZone = momentZone.tz.guess();
      let start = momentZone.tz(moment().subtract(1, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(moment().subtract(1, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
      const page = req.params.page || 1;
      const limit = 10;
      const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      // let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.enquiryData(isAdmin = 1, start, end, req.user._id, skip, limit, null)
      const countPromise = Lead.enquiryCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All enquiry yesterday", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.enquiryData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray)
      const countPromise = Lead.enquiryCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All enquiry yesterday!", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allEnquiryYesterday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllThisWeakEnquiry = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().day(7).valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise= Lead.enquiryData(isAdmin = 1, start, end, req.user._id, skip, limit, null)
      const countPromise = Lead.enquiryCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry This Weeks", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.enquiryData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray)
      const countPromise = Lead.enquiryCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry This Weeks", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allEnquiryThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllThisMonthEnquiry = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('month').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise= Lead.enquiryData(isAdmin = 1, start, end, req.user._id, skip, limit, null)
      const countPromise = Lead.enquiryCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry This Months", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.enquiryData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray)
      const countPromise = Lead.enquiryCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry This Months", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allEnquiryThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllOlderEnquiry = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(730, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate(); // last 2 years
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      const leadsPromise= Lead.enquiryData(isAdmin = 1, start, end, req.user._id, skip, limit, null)
      const countPromise = Lead.enquiryCount(isAdmin = 1, start, end, null);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length  && skip) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry Older", {total_records: count, leads}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      const leadsPromise= Lead.enquiryData(isAdmin = 0, start, end, req.user._id, skip, limit, objectIdArray)
      const countPromise = Lead.enquiryCount(isAdmin = 0, start, end, objectIdArray);
      const [leads, count] = await Promise.all([leadsPromise, countPromise]);
      const pages = Math.ceil(count / limit);
      if (!leads.length) {
        return res.status(400).json(response.responseError("Enquiry not found !", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Enquiry Older", {total_records: count, leads}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allEnquiryThisWeek - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getLeadDetails = async (req, res, next) => {
  try {
    if (!req.params.lead_id) {
      return res.status(400).json(response.responseError('Please provide lead ID.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    if (!helpers.isValidMongoID(req.params.lead_id)) {
      return res.status(400).json(response.responseError('Invalid Parameter ID!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const followups = await Followup
      .find({ lead_id: req.params.lead_id }, {
        follow_status: 1,
        follow_sub_status: 1,
        follow_up_date: 1,
        follow_up_time: 1,
        action_taken: 1,
        notes: 1,
        type: 1,
        someday: 1,
        no_followup: 1,
        updatedAt : 1
      })
      .sort({ follow_up_date: -1 });
    const lead = await Lead.findOne(
      {
      _id: req.params.lead_id,
      })
        .populate('status_id', { name: 1 })
        .populate('substatus_id', { name: 1 })
        .populate("programcategory_id", {title: 1 })
        .populate("program_id", { program_name: 1 })
        .populate("parent_country", { country_name: 1, country_code: 1, country_phonecode: 1 })
        .populate("parent_state", { state_name: 1, state_code: 1 })
        .populate("parent_city", { city_name: 1 })
        .populate('initial_status', { name: 1 })
        .populate('initial_sub_status', { name: 1 })
        .populate('school_id', { school_name: 1, school_display_name: 1 })
        .populate('zone_id', { name: 1 })
        .populate('country_id', { country_name: 1, country_code: 1, country_phonecode: 1 })

    if (lead) {
      const initialLeadData = {
        _id: "",
        follow_status: lead.initial_status.name,
        follow_sub_status: lead.initial_sub_status.name,
        follow_up_date: lead.lead_date,
        follow_up_time: "",
        action_taken: lead.initial_action || [],
        notes: lead.initial_notes,
        type: lead.type,
        someday: 0,
        no_followup: 0
      };

      followups.push(initialLeadData);

      return res.status(200).json(response.responseSuccess("Lead details with followups", {lead_detail: lead, followups: followups || []}, 200));
    } else {
      return res.status(400).json(response.responseError('Lead not found with this parameter ID!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getLeadDetails not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getSavedListLead = async (req, res, next) => {
  try {
    const leads = await Bookmark
      .findOne({ type: 'lead' })
      .populate({
        path: 'leads_data',
        select: {
          lead_no:1,
          stage:1,
          parent_name:1,
          child_first_name:1,
          child_last_name:1,
          child_gender:1,
          child_dob:1,
          school_id: 1,
          status_id: 1,
          substatus_id: 1
        },
        populate: [
          {
            path: 'school_id',
            select: { 'school_name':1, 'school_display_name': 1 }
          },
          {
            path: 'status_id',
            select: { 'name':1 }
          },
          {
            path: 'substatus_id',
            select: { 'name': 1 }
          }
        ]
      });

    if (leads) {
      return res.status(200).json(response.responseSuccess("Leads saved list.", leads.leads_data, 200));
    } else {
      return res.status(400).json(response.responseError('No saved list found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getSavedListLead not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getSavedListEnq = async (req, res, next) => {
  try {
    const leads = await Bookmark
      .findOne({ type: 'enq' })
      .populate({
        path: 'enqs_data',
        select: {
          lead_no:1,
          stage:1,
          parent_name:1,
          child_first_name:1,
          child_last_name:1,
          child_gender:1,
          child_dob:1,
          school_id: 1,
          status_id: 1,
          substatus_id: 1
        },
        populate: [
          {
            path: 'school_id',
            select: { 'school_name':1, 'school_display_name': 1 }
          },
          {
            path: 'status_id',
            select: { 'name':1 }
          },
          {
            path: 'substatus_id',
            select: { 'name': 1 }
          }
        ]
      });

    if (leads) {
      return res.status(200).json(response.responseSuccess("Enquires saved list.", leads.enqs_data, 200));
    } else {
      return res.status(400).json(response.responseError('No saved list found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getSavedListLead not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.addLeadPost = async (req, res, next) => {
  try {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
    const StatusCollection = mongoose.connection.db.collection("statuses");
    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    const zone = await Center.findOne({ _id: req.body.school_id });
    const status = await StatusCollection.find({ _id: mongoose.Types.ObjectId(req.body.status_id) }).toArray();

    if (status[0].type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;
      if (req.body.secondary_first_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_second_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    let whatsapp_number;
    let parent_second_whatsapp;
    let parent_first_whatsapp;

    if (req.body.whatsapp_first == 1) {
      whatsapp_number = req.body.parent_first_contact;
      parent_second_whatsapp = 0;
      parent_first_whatsapp = 1;
    } else if (req.body.whatsapp_second == 1) {
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
      viewoption: req.user && req.user.main ? null : req.user.view_option,
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
      parent_country: req.body.parent_country || null,
      parent_state: req.body.parent_state || null,
      parent_pincode: req.body.parent_pincode,
      parent_area: req.body.parent_area,
      parent_city: req.body.parent_city || null,
      parent_know_aboutus: req.body.parent_know_aboutus && req.body.parent_know_aboutus.length
        ? req.body.parent_know_aboutus
        : [],
      parent_whatsapp: whatsapp_number,
      parent_second_whatsapp: parent_second_whatsapp,
      parent_first_whatsapp: parent_first_whatsapp,
      source_category: req.body.source_category,
      status_id: req.body.status_id,
      substatus_id: req.body.substatus_id,
      updatedBy_name: req.user.name,
      createdBy_name:  req.user.name,
      stage: status[0].stage,
      remark: req.body.remark,
      action_taken: req.body.action_taken && req.body.action_taken.length ? req.body.action_taken : [],
      type: status[0].type,
      initial_status: req.body.status_id,
      initial_sub_status: req.body.substatus_id,
      initial_action: req.body.action_taken && req.body.action_taken.length ? req.body.action_taken : [],
      initial_notes: req.body.remark,
      follow_due_date: dateByTimeZone,
      follow_due_time : "",
      is_external: 0,
      external_source: "",
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
        activities: zone.activities_portal || ""
      },
      filename: "email-welcome-lead",
      title: `Welcome - ${zone.school_display_name}`,
    });
    if (status[0].stage == "Post Tour") {
      // if stage in Post Tour, the send mail
      // mail sent
      await mail.send({
        user: req.body.parent_email,
        subject: "Thank You",
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
          sat_end: zone.saturday_end_time
        },
        filename: "email-post-tour-lead",
        title: "Thank You",
      });
    }
    return res.status(200).json(response.responseSuccess("New lead added into system.", [], 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "addLeadPost not working - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.addLeadPost_ext = async (req, res, next) => {
  try {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
    const StatusCollection = mongoose.connection.db.collection("statuses");
    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    let zone = await Center.findOne({ "school_display_name": req.body.school_id.trim() });
    const status = await StatusCollection.find({ _id: mongoose.Types.ObjectId(req.body.status_id) }).toArray();

    // return zone
    // return res.status(200).json(zone);    

    if(!zone){
      zone = await Center.findOne({ "school_display_name": "HO Centre" });
    }

    let program = await Program.findOne({ "program_name": req.body.program_id.trim() });

    if(!program){
      program = await Program.findOne({ "program_name": "Other Program" });
    }

    if (status[0].type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;
      if (req.body.secondary_first_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_second_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    let whatsapp_number;
    let parent_second_whatsapp;
    let parent_first_whatsapp;

    if (req.body.whatsapp_first == 1) {
      whatsapp_number = req.body.parent_first_contact;
      parent_second_whatsapp = 0;
      parent_first_whatsapp = 1;
    } else if (req.body.whatsapp_second == 1) {
      whatsapp_number = req.body.parent_second_contact;
      parent_second_whatsapp = 1;
      parent_first_whatsapp = 0;
    }

    const latestLeadCount = await helper.leadCounter();
    const newLead = new Lead({
      lead_date: req.body.secondary_profession,
      lead_no: latestLeadCount,
      child_first_name: req.body.child_first_name ||"",
      child_dob: req.body.child_dob || "Child DOB",
      child_last_name: req.body.child_last_name,
      child_gender: req.body.child_gender,
      child_pre_school: childPre,
      programcategory_id: program.programcategory_id || null,
      program_id: program._id || null,
      school_id: zone._id,
      zone_id: zone.zone_id || null,
      country_id: zone.country_id,
      viewoption: null,
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
      parent_country: req.body.parent_country || null,
      parent_state: req.body.parent_state || null,
      parent_pincode: req.body.parent_pincode,
      parent_area: req.body.parent_area,
      parent_city: req.body.parent_city || null,
      parent_know_aboutus: req.body.parent_know_aboutus && req.body.parent_know_aboutus.length
        ? req.body.parent_know_aboutus
        : [],
      parent_whatsapp: whatsapp_number,
      parent_second_whatsapp: parent_second_whatsapp,
      parent_first_whatsapp: parent_first_whatsapp,
      source_category: req.body.source_category,
      status_id: req.body.status_id,
      substatus_id: req.body.substatus_id,
      updatedBy_name: "bulk-api",
      createdBy_name:  "bulk-api",
      createdAt:  req.body.secondary_profession,
      updatedAt:  req.body.secondary_profession,
      stage: status[0].stage,
      remark: req.body.remark,
      action_taken: req.body.action_taken && req.body.action_taken.length ? req.body.action_taken : [],
      type: status[0].type,
      initial_status: req.body.status_id,
      initial_sub_status: req.body.substatus_id,
      initial_action: req.body.action_taken && req.body.action_taken.length ? req.body.action_taken : [],
      initial_notes: req.body.remark,
      follow_due_date: dateByTimeZone,
      follow_due_time : "",
      is_external: 1,
      external_source: "",
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
    //     activities: zone.activities_portal || ""
    //   },
    //   filename: "email-welcome-lead",
    //   title: `Welcome - ${zone.school_display_name}`,
    // });
    if (0) {
      // if stage in Post Tour, the send mail
      // mail sent
      await mail.send({
        user: req.body.parent_email,
        subject: "Thank You",
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
    //     activities: zone.activities_portal || ""
    //   },
    //   filename: "email-welcome-lead",
    //   title: `Welcome - ${zone.school_display_name}`,
    // });       mon_fir_end: zone.mon_to_fri_end_time,
          sat_start: zone.saturday_start_time,
          sat_end: zone.saturday_end_time
        },
        filename: "email-post-tour-lead",
        title: "Thank You",
      });
    }
    return res.status(200).json(response.responseSuccess("New lead added into system.", [], 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "addLeadPost not working - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getEditLeadPost = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.lead_id })
    .populate({
      path: 'programcategory_id',
      model: 'Programcategory',
      select: {'title':1},
    })
    .populate({
      path: 'program_id',
      model: 'Program',
      select: {'program_name':1},
    })
    .populate({
      path: 'status_id',
      model: 'Statuses',
      select: {'name':1},
    })
    .populate({
      path: 'substatus_id',
      model: 'Substatus',
      select: {'name':1},
    })
    .populate({
      path: 'school_id',
      model: 'Center',
      select: {'school_name':1, 'school_display_name':1},
    })
    .populate({
      path: 'zone_id',
      model: 'Zone',
      select: {'name':1},
    })
    .populate({
      path: 'country_id',
      model: 'Country',
      select: {'country_name':1, 'country_id':1},
    })
    // console.log(lead,"lead")
    if (lead) {
      return res.status(200).json(response.responseSuccess("Get Edit Lead Data", lead, 200));
    } else {
      return res.status(400).json(response.responseError("No Lead found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  }  catch (err) {
    helper.errorDetailsForControllers(err, "getEditLeadPost not working - Get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.postEditLeadPost = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
    const StatusCollection = mongoose.connection.db.collection("statuses");
    let childPre = "";
    let secParentName = "";

    let sec_whatsapp_number = "";
    let sec_parent_second_whatsapp = 0;
    let sec_parent_first_whatsapp = 0;

    const status = await StatusCollection.find({ _id: mongoose.Types.ObjectId(req.body.status_id) }).toArray();

    if (status[0].type == "enquiry") {
      childPre = req.body.child_pre_school;
      secParentName = req.body.secondary_parent_name;
      if (req.body.secondary_first_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_first_contact;
        sec_parent_second_whatsapp = 0;
        sec_parent_first_whatsapp = 1;
      } else if (req.body.secondary_second_whatsapp == 1) {
        sec_whatsapp_number = req.body.parent_second_contact;
        sec_parent_second_whatsapp = 1;
        sec_parent_first_whatsapp = 0;
      }
    }

    let whatsapp_number;
    let parent_second_whatsapp;
    let parent_first_whatsapp;

    if (req.body.whatsapp_first == 1) {
      whatsapp_number = req.body.parent_first_contact;
      parent_second_whatsapp = 0;
      parent_first_whatsapp = 1;
    } else if (req.body.whatsapp_second == 1) {
      whatsapp_number = req.body.parent_second_contact;
      parent_second_whatsapp = 1;
      parent_first_whatsapp = 0;
    }

    const updateLead = Lead.updateOne(
      {
        _id: req.params.lead_id,
      },
      {
        $set: {
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
          updatedBy_name: req.user.name,
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
          parent_country: req.body.parent_country || null,
          parent_state: req.body.parent_state|| null,
          parent_pincode: req.body.parent_pincode,
          parent_area: req.body.parent_area,
          parent_city: req.body.parent_city || null,
          parent_know_aboutus: req.body.parent_know_aboutus || [],
          parent_whatsapp: whatsapp_number,
          parent_second_whatsapp: parent_second_whatsapp,
          parent_first_whatsapp: parent_first_whatsapp,
          source_category: req.body.source_category,
          status_id: req.body.status_id,
          substatus_id: req.body.substatus_id,
          stage: status[0].stage,
          remark: req.body.remark,
          action_taken: req.body.action_taken ? req.body.action_taken : [],
          type: status[0].type,
          enrolled: req.body.stage == "Closed - Won" ? 1 : 0,
          updatedAt: dateByTimeZone
        },
      },
      { new: true }
    ).exec(async (err, result) => {
      if (err) {
        console.log(err, "err");
        return res.status(400).json(response.responseError('Something went wrong!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
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
      return res.status(200).json(response.responseSuccess("Lead edited", [], 200));
    });
  }  catch (err) {
    helper.errorDetailsForControllers(err, "postEditLeadPost not working - Get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.searchFilter = async (req,res,next) => {
  try{
    // console.log(req.body,"donednoe")
    // console.log(req.params,"donednoe")
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if(req.body && req.body.search){
      // console.log(req.body, "body")
      let aggregateQue = [{
        '$match':{
          $or:[
            {
              parent_name: {
                $regex: req.body.search,
                $options: 'i'
              }
            },
            {
              child_first_name: {
                $regex: req.body.search,
                $options: 'i'
              }
            },
            {
              lead_no: {
                $regex: req.body.search,
                $options: 'i'
              }
            },
            {
              child_last_name: {
                $regex: req.body.search,
                $options: 'i'
              }
            }
          ]
        }
      },{
        $lookup:{
          from:"centers",
          localField:"school_id",
          foreignField:"_id",
          as: "school_id"
        }

      },
      {
       "$unwind" : "$school_id" ,
      }
      ,{
        $lookup:{
          from:"statuses",
          localField:"status_id",
          foreignField:"_id",
          as: "status_id"
        }

      },
      {
       "$unwind" : "$status_id" ,
      }
      ,{
        $lookup:{
          from:"substatuses",
          localField:"substatus_id",
          foreignField:"_id",
          as: "substatus_id"
        }

      },
      {
       "$unwind" : "$substatus_id" ,

      },{
        "$project":{
          'lead_no': 1,
          'lead_date': 1,
          'parent_name': 1,
          'child_first_name': 1,
          'child_last_name': 1,
          'stage': 1,
          'school_id._id': 1,
          'school_id.school_display_name': 1,
          'school_id.school_name': 1,
          'status_id._id': 1,
          'status_id.name': 1,
          'substatus_id._id': 1,
          'substatus_id.name': 1,
        }
      },{
        $skip:skip
      },{
        $limit:limit
      }
      ]
      const leads = await Lead.aggregate(aggregateQue)
      aggregateQue.splice(aggregateQue.length - 2, 2);

      const totalCount = await Lead.aggregate(aggregateQue);
      // console.log(leads,"lofghdh")
      if (!leads.length) {
        return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Searched Leads",{total_records :totalCount.length, leads}, 200));
    }else{
      console.log("Plz provided search")
      return res.status(400).json(response.responseError("Invalid search parameters", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  }catch (err) {
    helper.errorDetailsForControllers(err, "dropdownFilter - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
}

exports.getAllSource = async (req, res, next) => {
  try {
    const KnowUsCollection = mongoose.connection.db.collection("knowus");
    const knowus = await KnowUsCollection.find({ status: "active" }).toArray();
    if (knowus.length) {
      return res.status(200).json(response.responseSuccess("All sources", knowus, 200));
    } else {
      return res.status(400).json(response.responseError("No sources found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllSource not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllStatuses = async (req, res, next) => {
  try {
    let finalStatus = [];
    const StatusCollection = mongoose.connection.db.collection("statuses");
    const options = req.query.type == "lead" ? {type: "lead", _id: {
      $nin: [mongoose.Types.ObjectId("643d129984abb0ac02beacc6"), mongoose.Types.ObjectId("64394baeb858bfdf6844e96f"), mongoose.Types.ObjectId("64394ba0b858bfdf6844e96e")]
    }} : req.query.type == "enquiry" ? {type: "enquiry", _id: {
      $nin: [mongoose.Types.ObjectId("643d129984abb0ac02beacc6"), mongoose.Types.ObjectId("64394baeb858bfdf6844e96f"), mongoose.Types.ObjectId("64394ba0b858bfdf6844e96e")]
    }} : {_id: {
      $nin: [mongoose.Types.ObjectId("643d129984abb0ac02beacc6"), mongoose.Types.ObjectId("64394baeb858bfdf6844e96f"), mongoose.Types.ObjectId("64394ba0b858bfdf6844e96e")]
    }};
    const statuses = await StatusCollection.find(options).toArray();
    if (statuses.length) {
      return res.status(200).json(response.responseSuccess("All statuses", statuses, 200));
    } else {
      return res.status(400).json(response.responseError("No statuses found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllStatuses not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllSubStatuses = async (req, res, next) => {
  try {
    if (!req.body.status_id) {
      return res.status(400).json(response.responseError("Please provide status id.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const StatusCollection = mongoose.connection.db.collection("substatuses");
    const substatus = await StatusCollection.find({
      status_id: mongoose.Types.ObjectId(req.body.status_id),
    }).toArray();
    if (substatus.length) {
      return res.status(200).json(response.responseSuccess("All sub statuses", substatus, 200));
    } else {
      return res.status(400).json(response.responseError("No sub statuses found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllStatuses not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllActionPlanned = async (req, res, next) => {
  try {
    const ActionCollection = mongoose.connection.db.collection("actionplanneds");
    const actions = await ActionCollection.find({ status: "active" }).toArray();
    if (actions.length) {
      return res.status(200).json(response.responseSuccess("All action planned", actions, 200));
    } else {
      return res.status(400).json(response.responseError("No action planned found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllActionPlanned not working - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};
exports.dropdownSourceCategory = async (req,res,next) => {
  try{
    let datas = [
      {"source_name":"Direct Walk in"},
      {"source_name":"Digital Lead"},
      {"source_name":"Database/Events"}
    ]
    if (datas.length) {
      return res.status(200).json(response.responseSuccess("All Source Category", datas, 200));
    } else {
      return res.status(400).json(response.responseError("No Data found.", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  }catch (err) {
    helper.errorDetailsForControllers(err, "dropdownSourceCategory - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.dropdownStages = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: "All Stages",
      data: [{
        stage_name: "New Lead"
      }, {
        stage_name: "Enquiry Received"
      }, {
        stage_name: "Tour Booked"
      }, {
        stage_name: "Closed-Lead Lost"
      }, {
        stage_name: "Post Tour"
      }, {
        stage_name: "Closed-Enquiry Lost"
      }, {
        stage_name: "Closed - Won"
      }],
      code: 200
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "dropdownSourceCategory - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.dropdownFilter = async (req,res,next) => {
  try {
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;

    let zoneCount = 0;
    let newArr = [];
    let findQue = {};
    let aggregateQue = [
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
      }, {
        '$lookup': {
          'from': 'substatuses',
          'localField': 'substatus_id',
          'foreignField': '_id',
          'as': 'substatus_id'
        }
      }, {
        '$unwind': {
          'path': '$substatus_id',
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
        '$project': {
          'lead_no': 1,
          'lead_date': 1,
          'parent_name': 1,
          'child_first_name': 1,
          'child_last_name': 1,
          'stage': 1,
          'school_id._id': 1,
          'school_id.school_display_name': 1,
          'school_id.school_name': 1,
          'status_id._id': 1,
          'status_id.name': 1,
          'substatus_id._id': 1,
          'substatus_id.name': 1,
        }
      },
      {
        '$skip': parseInt(skip)
      }, {
        '$limit': parseInt(limit)
      }
    ];

    const timeZone = momentZone.tz.guess();

    if (req.user.main && req.user.main == req.config.admin.main) {
      findQue = {};
    } else {
      // NON ADMIN
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      findQue = {
        school_id: {$in: objectIdArray}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {"$in": objectIdArray}
        }
      });
    }
    if (req.body.zones) {
      let zone = req.body.zones.map(s => mongoose.Types.ObjectId(s));
      findQue = {
        zone_id: {$in:zone}
      };
      aggregateQue.unshift({
        '$match': {
          'zone_id': {$in:zone}
        }
      });
    }
    if (req.body.program) {
      let program = req.body.program.map(s => mongoose.Types.ObjectId(s));
      findQue = {
        program_id: {$in:program}
      };
      aggregateQue.unshift({
        '$match': {
          'program_id': {$in:program}
        }
      });
    }

    if (req.body.sources) {
      let know_us = req.body.sources
      findQue = {
        parent_know_aboutus: {$in:know_us}
      };
      aggregateQue.unshift({
        '$match': {
          'parent_know_aboutus': {$in:know_us}
        }
      });
    }

    if (req.body.start_date && req.body.end_date) {
      let start = momentZone.tz(`${req.body.start_date}`,"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(`${req.body.end_date }`, "Asia/Kolkata").endOf('day').toDate();
      findQue = {
        lead_date: {
          '$gte': start,
          '$lte': end
        }
      }
      aggregateQue.unshift({
        '$match': {
          'lead_date': {
            '$gte': start,
            '$lte': end
          }
        }
      });
    }

    if (req.body.countries) {
      let country = req.body.countries.map(s => mongoose.Types.ObjectId(s));

      findQue = {
        country_id: {$in: country}
      };
      aggregateQue.unshift({
        '$match': {
          'country_id': {$in: country}
        }
      });
    }

    if (req.body.centers) {
      let center = req.body.centers.map(s => mongoose.Types.ObjectId(s));
      findQue = {
        school_id: {$in:center}
      };
      aggregateQue.unshift({
        '$match': {
          'school_id': {$in:center}
        }
      });
    }
    if (req.body.status) {
      let status = req.body.status.map(s => mongoose.Types.ObjectId(s));
      findQue = {
        status_id: {$in:status}
      };
      aggregateQue.unshift({
        '$match': {
          'status_id': {$in:status}
        }
      });
    }

    if (req.body.source_category) {
      console.log(req.body.source_category,"req.body.sourcee")
      findQue = {
        source_category: req.body.source_category
      };
      aggregateQue.unshift({
        '$match': {
          'source_category': req.body.source_category
        }
      });
    }
    if (req.body.stage) {
      findQue = {
        stage: req.body.stage
      };
      aggregateQue.unshift({
        '$match': {
          'stage': req.body.stage
        }
      });
    }

    const leads = await Lead.aggregate(aggregateQue);

    aggregateQue.splice(aggregateQue.length - 2, 2);

    const totalCount = await Lead.aggregate(aggregateQue);
    if (!leads.length) {
      return res.status(400).json(response.responseError("Leads not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    return res.status(200).json(response.responseSuccess("Filtered Leads", {total_records :totalCount.length, leads}, 200));

  } catch (err) {
    helper.errorDetailsForControllers(err, "dropdownFilter - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
}

exports.addLeadForWebIntegration = async (req, res, next) => {
  try {
    let mailSent = 0;
    let newLead;
    let zone;
    let centerGiven;
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
    const latestLeadCount = await helper.leadCounter();
    const foundLead = await Lead
      .findOne({ parent_email: req.body.parent_email.toLowerCase().trim() })
      .populate({
        path: "status_id"
      })
      .populate({
        path: "substatus_id"
      });
    if (foundLead) {
      // Duplicate lead
      // return res.status(400).json(response.responseError("Lead with same email ID already exist.", 400, {}, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      let flDate = momentZone.tz(new Date(), "Asia/Kolkata");
      let flTime = "";
      const followupsOrder = await Followup.countDocuments({ lead_id: foundLead._id });
      let leadBody = _.omit(req.body, 'child_dob');

      if (leadBody && leadBody.center_id) {
        var centerOne = await Center.findOne({ _id: mongoose.Types.ObjectId(leadBody.center_id) }, { school_name: 1, school_display_name: 1 });
        leadBody.center = centerOne.school_display_name;
      }

      leadBody = _.omit(leadBody, 'center_id');

      const newFollowUp = new Followup({
        status_id: foundLead.status_id._id,
        follow_status: foundLead.status_id.name,
        follow_sub_status: foundLead.substatus_id.name,
        substatus_id: foundLead.substatus_id._id,
        action_taken: [],
        enq_stage: foundLead.stage,
        program_id: foundLead.program_id,
        parent_know_aboutus: foundLead.parent_know_aboutus || [],
        type: foundLead.type,
        notes: JSON.stringify(leadBody),
        follow_up_date: flDate,
        follow_up_time: "",
        date_sort: moment(`${flDate}T${flTime}Z`).toISOString(),
        remark: "",
        updatedBy_name: req.body.form == "enquiry" ? "Website Enquiry Form (Duplicate)" : "Website Contact Form (Duplicate)",
        updatedBy: mongoose.Types.ObjectId("63b407739d6efd6f19cf0716"),
        lead_id: foundLead._id,
        center_id: foundLead.school_id,
        someday: 0,
        no_followup: 0,
        country_id: foundLead.country_id || null,
        zone_id: foundLead.zone_id || null,
        source_category: "digital-lead",
        lead_no: foundLead.lead_no,
        lead_name: foundLead.parent_name || "",
        child_name: foundLead.child_first_name ? `${foundLead.child_first_name} ${foundLead.child_last_name}` : "",
        is_whatsapp: 0,
        is_email: 0,
        not_to_show: 0,
        comm_mode: "",
        order: followupsOrder + 1
      });
      await newFollowUp.save();
      foundLead.is_external = 2; // duplicate lead flag
      foundLead.is_dup = 1; // this lead is duplicated
      foundLead.dup_no = foundLead && foundLead.dup_no ? parseInt(foundLead.dup_no) + 1 : 1; // increase count by 1 for duplicate leads
      foundLead.updatedAt = flDate;
      foundLead.follow_due_date = flDate;
      await foundLead.save();
      return res.send({ success: true });
    }
    if (req.body.center_id) {
      centerGiven = req.body.center_id
    } else {
      centerGiven = mongoose.Types.ObjectId("64a26f270754b33d31c62b79");
    }
    zone = await Center.findOne({ _id: centerGiven });
    // if (!zone) {
    //   return res.status(400).json(response.responseError("Center not found", 400, {}, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    // }

    if(req.body.school_code){
      let cntrByScod = await Center.findOne({ school_code: req.body.school_code });
      if(cntrByScod){
        zone = cntrByScod;
        console.log(cntrByScod);
      }
    }
    // return res.status(400).json(zone);
    // -----------------------MAIL SETTING---------------------------
    if (zone && zone.school_name == "HEAD OFFICE") {
      mailSent = 0;
    } else {
      mailSent = 1;
    }
    (config.server.devenv == "dev") ? mailSent = 0 : false;


    let foundCenter = req.body.center_id;

    if(req.body.school_code){
      let cntrByScod = await Center.findOne({ school_code: req.body.school_code });
      if(cntrByScod){
        // zone = cntrByScod;
        foundCenter = cntrByScod._id;
      }
    }

    if (req.body.form == "enquiry") {
      // website form 1
      newLead = new Lead({
        lead_date: dateByTimeZone,
        lead_no: latestLeadCount,
        child_first_name: req.body.child_name ? req.body.child_name.split(" ")[0] : "",
        child_last_name: req.body.child_name ? req.body.child_name.split(" ")[1] : "",
        child_gender: "",
        child_pre_school: "",
        child_dob: req.body.child_dob,
        programcategory_id: mongoose.Types.ObjectId("64a27694d081b651a5b83db4"),
        program_id: mongoose.Types.ObjectId("64a276bdd081b651a5b83db8"),
        school_id: foundCenter,
        zone_id: zone ? zone.zone_id : null,
        country_id: zone ? zone.country_id : null,
        viewoption: null,
        primary_parent: "Guardian",
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: "",
        parent_email: req.body.parent_email,
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
        parent_know_aboutus: req.body.parent_know_aboutus ? req.body.parent_know_aboutus : ["KIDO Website"],
        parent_whatsapp: req.body.parent_first_contact,
        parent_second_whatsapp: 0,
        parent_first_whatsapp: 1,
        source_category: req.body.source_category ? req.body.source_category : "digital-lead",
        status_id: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
        substatus_id: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
        stage: "New Lead",
        remark: req.body.form == "enquiry" ? "From Website Enquiry Form" : "From Website Contact Form",
        updatedBy_name: req.body.form == "enquiry" ? "Website Enquiry Form" : "Website Contact Form",
        createdBy_name: "Digital lead",
        action_taken: [],
        type: "lead",
        initial_status: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
        initial_sub_status: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
        initial_action: [],
        initial_notes: req.body.form == "enquiry" ? "From Website Enquiry Form" : "From Website Contact Form",
        enrolled: 0,
        follow_due_date: dateByTimeZone,
        follow_due_time : "",
        is_external: 1,
        external_source: "Digital lead",
        sibling: 0,
        is_related: null,
        cor_parent: "",
        company_name_parent: "",
        do_followup: 1
      });
    } else {
      // website form 2
      newLead = new Lead({
        lead_date: dateByTimeZone,
        lead_no: latestLeadCount,
        child_first_name: "",
        child_last_name: "",
        child_gender: "",
        child_pre_school: "",
        programcategory_id: req.body.programcategory_id ? req.body.programcategory_id : mongoose.Types.ObjectId("64a27694d081b651a5b83db4"),
        program_id: req.body.program_id ? req.body.program_id : mongoose.Types.ObjectId("64a276bdd081b651a5b83db8"),
        school_id: foundCenter ? foundCenter : mongoose.Types.ObjectId("64a26f270754b33d31c62b79"),
        zone_id: zone ? zone.zone_id : null,
        country_id: zone ? zone.country_id : null,
        viewoption: null,
        primary_parent: "Guardian",
        parent_name: req.body.parent_name,
        parent_first_contact: req.body.parent_first_contact,
        parent_second_contact: "",
        parent_email: req.body.parent_email,
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
        parent_know_aboutus: req.body.parent_know_aboutus ? req.body.parent_know_aboutus : ["KIDO Website"],
        parent_whatsapp: req.body.parent_first_contact,
        parent_second_whatsapp: 0,
        parent_first_whatsapp: 1,
        source_category: req.body.source_category ? req.body.source_category : "digital-lead",
        status_id: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
        substatus_id: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
        stage: "New Lead",
        remark: req.body.form == "enquiry" ? "From Website Enquiry Form" : "From Website Contact Form",
        updatedBy_name: req.body.form == "enquiry" ? "Website Enquiry Form" : "Website Contact Form",
        createdBy_name: "Digital lead",
        action_taken: [],
        type: "lead",
        initial_status: mongoose.Types.ObjectId("63b3fa85f1f372a8e4fdb0e1"),
        initial_sub_status: mongoose.Types.ObjectId("63b3fb6ff1f372a8e4fdb0eb"),
        initial_action: [],
        initial_notes: `From Website Contact Form-&#13;&#10;${req.body.desc}&#13;&#10;&#13;&#10;City- ${req.body.city}`,
        enrolled: 0,
        follow_due_date: dateByTimeZone,
        follow_due_time : "",
        is_external: 1,
        external_source: "Digital lead",
        sibling: 0,
        is_related: null,
        cor_parent: "",
        company_name_parent: "",
        do_followup: 1
      });
    }
    await newLead.save();
    res.status(200).json(response.responseSuccess("Lead created ", [], 200));
    if (mailSent) {
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
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "dropdownFilter - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.refreshData = async (req, res, next) => {
  try {
    console.log('Redis data updation running...');
    await helper.getAllAssignedRolesByCache(RoleAssign, cacher);
    console.log('Redis data updated successfuly.');
    res.send({
      msg: "Redis data updated."
    });
  } catch (err) {
    console.log(err);
    return;
  }
};