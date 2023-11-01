const mongoose = require('mongoose');
const Followup = mongoose.model('Followup');
const Lead = mongoose.model('Lead');
const Center = mongoose.model('Center');
const Bookmark = mongoose.model('Bookmark');
const ObjectId = require("mongodb").ObjectId;
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');
const momentZone = require('moment-timezone');
const moment = require("moment");
const mail = require("../../handlers/mail");

exports.getAllFollowups = async (req, res, next) => {
  return res.send('jeu');
};

exports.getAllOverdueFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
      let start = momentZone.tz(moment().subtract(180, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
      const page = req.params.page || 1;
      const limit = 10;
      const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {
      let followupData = await Followup.find({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({
        follow_up_date: 'desc'
      });
      console.log(skip,limit)
      console.log(followupData,"foll")
      let followups = []
      let followupObject
      let followupAggre
      // console.log(followupData,"followyuyuy")
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let follow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("Followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Overdue Followups", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
     let followups = []
     let followupObject
     let followupAggre
     for(let i=0; i<followupData.length; i++){
       let Type =followupData[i].type;
       let follow_id =followupData[i]._id;
       let lead_id =followupData[i].lead_id;
       if(Type == "lead"){
         followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , follow_id ,lead_id)
         followupObject = Object.assign({},...followupAggre)
         followups.push(followupObject)
       }else{
         followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , follow_id ,lead_id)
         followupObject = Object.assign({},...followupAggre)
         followups.push(followupObject)
       }
     }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Overdue Followups", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allfollowupsToday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllTodayFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    // console.log(start,end)
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main) {

      let followupData = await Followup.find({
            follow_up_date: {
              '$gte': start,
              '$lte': end
            }
      })
      .skip(skip)
      .limit(limit)
      .sort({
        follow_up_date: 'desc'
      });
      let followups = []
      let followupObject
      let followupAggre
      // console.log(followupData,"followyuyuy")
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let follow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("Followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Followups Today", {total_records: count, followups}, 200));
    } else {

      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
         center_id: {$in: objectIdArray},
          follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let follow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , follow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([ countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Today", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allfollowupsToday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllYesterdayFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(1, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().subtract(1, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Followups Yesterday", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));

      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [ count] = await Promise.all([ countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("Followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Followups Yesterday", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allFollowupsYesterday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllUpcomingFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().add(730, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate(); // for next 2 years
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Upcoming", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Upcoming", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allfollowupsUpcoming - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllPastSevenDaysFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(7, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }

      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Past Seven Days", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Past Seven Days", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPastSevenDaysFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllPastThirtyDaysFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(30, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [ count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Past 30 Days", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Past 30 Days", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPastSevenDaysFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllOlderFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().subtract(730, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate(); // last 2 years
    let end = momentZone.tz(moment().valueOf(), "Asia/Kolkata").endOf('day').toDate();
    // console.log(start, "startadmin")
    // console.log(end, "endadmin");
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }

      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All older followups", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All older followups", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPastSevenDaysFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllTomorrowFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().add(1, 'day').valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().add(1, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Followups Tomorrow", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [ count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("Followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All Followups Tomorrow", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "allFollowupsYesterday - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllNextThirtyDaysFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().add(30, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups next 30 days", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups next 30 days", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPastSevenDaysFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllNextSevenDaysFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().add(7, 'day').valueOf(), "Asia/Kolkata").endOf('day').toDate();
    // console.log(start, "startadmin")
    // console.log(end, "endadmin");
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        follow_up_date: {
            '$gte': start,
            '$lte': end
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups next 7 days", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
         follow_up_date: {
           '$gte': start,
           '$lte': end
         }
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        follow_up_date: {
          '$gte': start,
          '$lte': end
        }
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups next 7 days", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllPastSevenDaysFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllSomedayFollowups = async (req, res, next) => {
  try {
    const timeZone = momentZone.tz.guess();
    let start = momentZone.tz(moment().valueOf(),"Asia/Kolkata").startOf('day').toDate();
    let end = momentZone.tz(moment().day(7).valueOf(), "Asia/Kolkata").endOf('day').toDate();
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
        someday: 1
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        someday: 1
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Someday", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
        someday: 1
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        someday: 1
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All followups Someday", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllSomedayFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAllNofollowupFollowups = async (req, res, next) => {
  try {
    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;
    if (req.user && req.user.main == req.config.admin.main){
      let followupData = await Followup.find({
         no_followup: 1
        })
        .skip(skip)
        .limit(limit)
        .sort({
          follow_up_date: 'desc'
        });
        let followups = []
        let followupObject
        let followupAggre
        for(let i=0; i<followupData.length; i++){
          let Type =followupData[i].type;
          let folow_id =followupData[i]._id;
          let lead_id =followupData[i].lead_id;
          if(Type == "lead"){
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            // console.log(followupAggre, "funcntiondata")
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }else{
            followupAggre = await  Followup.followUpData(isAdmin = 1, req.user._id, Type  , folow_id ,lead_id)
            followupObject = Object.assign({},...followupAggre)
            followups.push(followupObject)
          }
        }
      const countPromise = Followup.countDocuments({
        no_followup: 1
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length  && skip) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All no followups", {total_records: count, followups}, 200));
    } else {
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      let followupData = await Followup.find({
        center_id: {$in: objectIdArray},
        no_followup: 1
       })
       .skip(skip)
       .limit(limit)
       .sort({
         follow_up_date: 'desc'
       });
      let followups = []
      let followupObject
      let followupAggre
      for(let i=0; i<followupData.length; i++){
        let Type =followupData[i].type;
        let folow_id =followupData[i]._id;
        let lead_id =followupData[i].lead_id;
        if(Type == "lead"){
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }else{
          followupAggre = await  Followup.followUpData(isAdmin = 0, req.user._id, Type  , folow_id ,lead_id)
          followupObject = Object.assign({},...followupAggre)
          followups.push(followupObject)
        }
      }
      const countPromise = Followup.countDocuments({
        center_id: {$in: objectIdArray},
        no_followup: 1
      });
      const [count] = await Promise.all([countPromise]);
      const pages = Math.ceil(count / limit);
      if (!followups.length) {
        return res.status(400).json(response.responseError("followups not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }
      return res.status(200).json(response.responseSuccess("All no followups", {total_records: count, followups}, 200));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getAllSomedayFollowups - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getAddFollowupLeadDetails = async (req, res, next) => {
  try {

  } catch (err) {
    helper.errorDetailsForControllers(err, "getAddFollowupLeadDetails - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.postAddFollowup = async (req, res, next) => {
  try {
    // console.log(helper.isValidMongoID(req.params.lead_id));
    const timeZone = momentZone.tz.guess();
    const dateByTimeZone = momentZone.tz(Date.now(), "Asia/Kolkata");
    const StatusCollection = mongoose.connection.db.collection("statuses");
    if (!req.params.lead_id) {
      return res.status(400).json(response.responseError('Please provide parameter ID!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    if (!helper.isValidMongoID(req.params.lead_id)) {
      return res.status(400).json(response.responseError('Invalid Parameter ID!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    const leadId = await Lead.findOne({ _id: req.params.lead_id });
    if (leadId) {
      const zone = await Center.findOne({ _id: leadId.school_id });
      const status = await StatusCollection.find({ _id: mongoose.Types.ObjectId(req.body.status_id) }).toArray();

      let flDate = req.body.follow_up_date ? momentZone.tz(new Date(req.body.follow_up_date), "Asia/Kolkata") : undefined;
      let flTime = req.body.follow_up_time;

      let options = {
        type: status[0].type,
        stage: status[0].stage,
        status_id: req.body.status_id,
        substatus_id: req.body.substatus_id,
        action_taken: req.body.action_taken,
        updatedAt: dateByTimeZone,
        follow_due_date: flDate,
        follow_due_time: flTime
      };

      if (status[0].stage == "Closed - Won") {
        options.enrolled = 1;
      }

      if (req.body.no_followup) {
        options.do_followup = 0;
      }

      if (req.body.someday) {
        flDate = moment(dateByTimeZone).add(30, 'days').format();
        flTime = "11:00 PM"
      }

      const updateLead = await Lead.updateOne(
        {
          _id: req.params.lead_id,
        },
        {
          $set: options,
        },
        { new: true }
      );

      const newFollowUp = new Followup({
        status_id: req.body.status_id,
        follow_status: req.body.follow_status,
        follow_sub_status: req.body.follow_sub_status,
        substatus_id: req.body.substatus_id,
        action_taken: req.body.action_taken || [],
        enq_stage: status[0].stage,
        type: status[0].type,
        notes: req.body.notes,
        follow_up_date: flDate,
        follow_up_time: flTime,
        date_sort: moment(`${flDate}T${flTime}Z`).toISOString(),
        remark: req.body.remark || "",
        updatedBy_name: req.user.name,
        updatedBy: req.user._id,
        lead_id: req.params.lead_id,
        center_id: leadId.school_id,
        someday: req.body.someday,
        no_followup: req.body.no_followup,
        country_id: leadId.country_id || null,
        zone_id: leadId.zone_id || null,
        source_category: leadId.source_category || "",
        lead_no: leadId.lead_no,
        lead_name: leadId.parent_name || "",
        child_name: leadId.child_first_name ? `${leadId.child_first_name} ${leadId.child_last_name}` : "",
        is_whatsapp: 0,
        is_email: 0
      });

      await newFollowUp.save(async (err, result) => {
        if (err) {
          console.log('ERROR add followups api -->', err);
          return res.status(400).json(response.responseError('Something went wrong!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
        }
        if (req.body.substatus_id == "63b4080ff1f372a8e4fdb114") {
          await mail.send({
            user: leadId.parent_email,
            subject: "KIDO India",
            msg: {
              lead_name: leadId.parent_name || "",
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
              date: moment(flDate).format("Do MMMM YYYY"),
              time: flTime,
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time
            },
            filename: "email-tour-booked-lead",
            title: "KIDO India",
          });
        }

        if (req.body.substatus_id.split("|")[0] == "63b4082ff1f372a8e4fdb118") {
          // if tour booked reschdule sub-status, then send mail
          // mail sent
          await mail.send({
            user: leadId.parent_email,
            subject: "KIDO India",
            msg: {
              lead_name: leadId.parent_name || "",
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
              date: moment(flDate).format("Do MMMM YYYY"),
              time: flTime,
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time
            },
            filename: "email-tour-reschedule-lead",
            title: "KIDO India",
          });
        }

        if (status[0].stage == "Post Tour") {
          // if stage in Post Tour, the send mail
          // mail sent
          await mail.send({
            user: leadId.parent_email,
            subject: "Thank You",
            msg: {
              lead_name: leadId.parent_name || "",
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
              date: moment(flDate).format("Do MMMM YYYY"),
              time: flTime,
              mon_fir_start: zone.mon_to_fri_start_time,
              mon_fir_end: zone.mon_to_fri_end_time,
              sat_start: zone.saturday_start_time,
              sat_end: zone.saturday_end_time
            },
            filename: "email-post-tour-lead",
            title: "Thank You",
          });
        }
        return res.status(200).json(response.responseSuccess("Followups added", [], 200));
      })
    } else {
      return res.status(400).json(response.responseError('Lead not found for followups. Please check again in lead id is correct or not in parameters!', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "postAddFollowup - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getSavedListFollowups = async (req, res, next) => {
  try {
    const followups = await Bookmark
      .findOne({ type: 'followups' })
      .populate({
        path: 'followups_data',
        select: {
          is_whatsapp:1,
          is_email:1,
          follow_status:1,
          follow_sub_status:1,
          enq_stage:1,
          type:1,
          follow_up_date:1,
          center_id: 1,
          lead_no: 1,
          lead_name: 1,
          child_name: 1,
          lead_id: 1
        },
        populate: [
          {
            path: 'center_id',
            select: { 'school_name':1, 'school_display_name': 1 }
          },
          {
            path: 'lead_id',
            select: { 'child_gender': 1, 'child_dob': 1, 'primary_parent': 1, 'parent_name': 1 }
          }
        ]
      });

    if (followups) {
      return res.status(200).json(response.responseSuccess("Followups saved list.", followups.followups_data, 200));
    } else {
      return res.status(400).json(response.responseError('No saved list found.', 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getSavedListLead not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
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

    const timeZone = momentZone.tz.guess();

    const startDate = momentZone.tz("Asia/Kolkata").startOf('day').toDate();
    const endDate = momentZone.tz("Asia/Kolkata").endOf('day').toDate();

    let aggregateQue = [
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
        '$project': {
          'follow_status': 1,
          'follow_sub_status': 1,
          'enq_stage': 1,
          'type': 1,
          'follow_up_date': 1,
          'follow_up_time': 1,
          'someday': 1,
          'no_followup': 1,
          'center._id': 1,
          'center.school_name': 1,
          'center.school_display_name': 1,
          'lead_no': 1,
          'lead_name': 1,
          'child_name': 1,
          'lead_id._id': 1,
          'lead_id.child_gender': 1,
          'lead_id.child_dob': 1,
          'lead_id.primary_parent': 1,
          'lead_id.parent_name': 1,
          'center_id': 1
        }
      },
      {
        '$skip': parseInt(skip)
      }, {
        '$limit': parseInt(limit)
      }
    ];

    if (req.user.main && req.user.main == req.config.admin.main) {
      // ADMIN
      // console.log('ADMINNNNNN___')
      findQue = {};
    } else {
      // NON ADMIN
      // console.log('NON ADMINNNNNN___')
      let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
      // console.log(objectIdArray,"objectIdArray")

      findQue = {
        center_id: {$in: objectIdArray}
      };
      aggregateQue.unshift({
        '$match': {
          'center_id': {$in: objectIdArray}
        }
      });
    }
    // console.log(req.query,"req.queryryryryyr")
    if (req.body.start_date && req.body.end_date) {
      // console.log('DATE GIVEN---');
      let start = momentZone.tz(`${req.body.start_date}`,"Asia/Kolkata").startOf('day').toDate();
      let end = momentZone.tz(`${req.body.end_date}`, "Asia/Kolkata").endOf('day').toDate();
      console.log("start---", start);
      console.log("end---", end);

      aggregateQue = [
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
          '$project': {
            'follow_status': 1,
            'follow_sub_status': 1,
            'enq_stage': 1,
            'type': 1,
            'follow_up_date': 1,
            'follow_up_time': 1,
            'someday': 1,
            'no_followup': 1,
            'center._id': 1,
            'center.school_name': 1,
            'center.school_display_name': 1,
            'lead_no': 1,
            'lead_name': 1,
            'child_name': 1,
            'lead_id._id': 1,
            'lead_id.child_gender': 1,
            'lead_id.child_dob': 1,
            'lead_id.primary_parent': 1,
            'lead_id.parent_name': 1,
            'center_id': 1
          }
        },
        {
          '$skip': parseInt(skip)
        }, {
          '$limit': parseInt(limit)
        }
      ];
      if (req.user.main && req.user.main == req.config.admin.main) {
        // ADMIN
        // console.log('ADMINNNNNN___')
        findQue = {};
      } else {
        // NON ADMIN
        // console.log('NON ADMINNNNNN___')
        let objectIdArray = req.user.center_id.map(s => mongoose.Types.ObjectId(s));
        // console.log(objectIdArray,"objectIdArray")

        findQue = {
          center_id: {$in: objectIdArray},
        };
        aggregateQue.unshift({
          '$match': {
            'center_id': {$in: objectIdArray}
          }
        });
      }
    }
    if (req.body.status) {
      let status = req.body.status.map(s => mongoose.Types.ObjectId(s));
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
    if (req.body.program) {
      // console.log(req.query.program,"req.program.program")
      let program = req.body.program.map(s => mongoose.Types.ObjectId(s));
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
    if (req.body.sources) {
      // console.log(req.query.know_us,"req.know_us.know_us")
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
    if (req.body.stage) {
      // console.log(req.query.sSearch_6,"req.query.sSearch_6req.query.sSearch_6")
      findQue = {
        enq_stage: req.body.stage
      };
      aggregateQue.unshift({
        '$match': {
          'enq_stage': req.body.stage
        }
      });
    }
    if (req.body.countries) {
      // console.log(req.query.country,"followup.countryt");
      let country = req.body.countries.map(s => mongoose.Types.ObjectId(s));
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

    if (req.body.zones) {
      let zone = req.body.zones.map(s => mongoose.Types.ObjectId(s));
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

    if (req.body.centers) {
      let center = req.body.centers.map(s => mongoose.Types.ObjectId(s));
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

    if (req.body.source_category) {
      findQue = {
        source_category: req.body.source_category
      };
      aggregateQue.unshift({
        '$match': {
          'source_category': req.body.source_category
        }
      });
    }

    const followUps = await Followup.aggregate(aggregateQue);
    aggregateQue.splice(aggregateQue.length - 2, 2);
    const totalCount = await Followup.aggregate(aggregateQue);
    if (!followUps.length) {
      return res.status(400).json(response.responseError("Followup not found!", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }
    return res.status(200).json(response.responseSuccess("Filtered Followups", {total_records :totalCount.length, followUps}, 200));

  }catch (err) {
    helper.errorDetailsForControllers(err, "dropdownFilter - Post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
}