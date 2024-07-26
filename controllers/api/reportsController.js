const mongoose = require('mongoose');
const Center = mongoose.model('Center');
const Lead = mongoose.model('Lead');
const _ = require('lodash');
const momentZone = require('moment-timezone');
const moment = require("moment");
const helper = require('../../handlers/helper');
const response = require('../../handlers/response');

exports.getMTDReports = async (req, res, next) => {
  try {
    let countries = [];
    let zones = [];
    let centers = [];
    const repArr = [];
    const dateArr = [];
    let zonesWithCentersGrouped = [];
    let start = null;
    let end = null;

    const page = req.params.page || 1;
    const limit = 10;
    const skip = (page * limit) - limit;

    const resultsPerPage = limit;
    const currentPage = page;

    const currentDate = moment().tz("Asia/Kolkata");

    if (req.query.country) { // country
      countries = req.query.country ? JSON.parse(req.query.country).map(s => mongoose.Types.ObjectId(s)) : [];
    }

    if (req.query.zone) { // zone
      zones = req.query.zone ? JSON.parse(req.query.zone).map(s => mongoose.Types.ObjectId(s)) : []
    }

    if (req.query.center) { // center
      centers = req.query.center ? JSON.parse(req.query.center).map(s => mongoose.Types.ObjectId(s)) : [];
    }

    if (req.query.startDate) { // start date
      start = req.query.startDate;
    }

    if (req.query.endDate) { // end date
      end = req.query.endDate;
    }

    let startMonthDate;
    let endMonthDate;

    if (start || end) {
      startMonthDate = momentZone.tz(`${start}`, "Asia/Kolkata").startOf('day').toDate();
      endMonthDate = momentZone.tz(`${end}`, "Asia/Kolkata").endOf('day').toDate();
    } else {
      startMonthDate = currentDate.clone().startOf('month');
      endMonthDate = currentDate.clone().endOf('day');
    }

    const startDate = moment(startMonthDate, 'YYYY/MM/DD')
    const endDate = moment(endMonthDate, 'YYYY/MM/DD');

    const numDays = endDate.diff(startDate, 'days') + 1;
    const dateRange = _.range(numDays).map((index) => moment(startDate).add(index, 'days').format('YYYY-MM-DD'));
    // const paginatedDates = _.chunk(dateRange, resultsPerPage);
    // const currentPageDates = paginatedDates[currentPage - 1];

    if (req.user && req.user.main == req.config.admin.main) {
      // Admin
      // page, limit, countries, zones, centers, start, end
      zonesWithCentersGrouped = await Center.getZonesWithCentersGroupedAPI(countries, zones, centers);
    } else {
      // Non-Admin
      let centersObj = await Center.find({ _id: { $in: req.user.center_id }, status: "active" }).distinct('_id');
      zonesWithCentersGrouped = await Center.getZonesWithCentersGroupedNonAdminAPI(countries, zones, centers && centers.length ? centers : centersObj);
    }

    const listOfSchoolsWithIds = _.flatMap(zonesWithCentersGrouped, 'schools').map(school => school.school_id);

      const repTotal = [];
      if (zonesWithCentersGrouped && zonesWithCentersGrouped.length) {
        if (dateRange && dateRange.length) {
          for (const date of dateRange) {
            const repObj = [];
            dateArr.push(moment(date).format("DD-MMMM-YYYY"));
            let total = 0;

            for (const [i, center_id] of listOfSchoolsWithIds.entries()) {
              let leadCount = await Lead.find({
                lead_date: {
                  $gte: momentZone.tz(date, "Asia/Kolkata").startOf('day').toDate(),
                  $lte: momentZone.tz(date, "Asia/Kolkata").endOf('day').toDate()
                },
                school_id: center_id
              }, { lead_no: 1 });
              leadCount = leadCount.length;
              repObj.push(leadCount);
              // total += leadCount;
            }
            // console.log(total);
            repArr.push(repObj);
            repTotal.push(total);
          }
        } else {
          return res.status(400).json(response.responseError("Dates not available", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
        }
      } else {
        return res.status(400).json(response.responseError("Centers not available", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
      }

      return res.status(200).json(response.responseSuccess("MTD Reports", {centers: zonesWithCentersGrouped, dates: dateArr, leads_data: repArr}, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "getMTDReports - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};

exports.getYTDReports = async (req, res, next) => {
  try {
    let countries = [];
    let zones = [];
    let centers = [];
    const repArr = [];
    const dateArr = [];
    const months = [];
    let zonesWithCentersGrouped = [];
    let start = null;
    let end = null;

    if (req.query.country) { // country
      countries = req.query.country ? JSON.parse(req.query.country).map(s => mongoose.Types.ObjectId(s)) : [];
    }

    if (req.query.zone) { // zone
      zones = req.query.zone ? JSON.parse(req.query.zone).map(s => mongoose.Types.ObjectId(s)) : []
    }

    if (req.query.center) { // center
      centers = req.query.center ? JSON.parse(req.query.center).map(s => mongoose.Types.ObjectId(s)) : [];
    }

    if (req.query.startDate) { // start date
      start = req.query.startDate;
    }

    if (req.query.endDate) { // end date
      end = req.query.endDate;
    }

    if (start && end) {
      startDate = moment(start, 'MM/YYYY');
      endDate = moment(end, 'MM/YYYY');
      currentMonth = startDate.clone();
    } else {
      return res.status(400).json(response.responseError("Please provide start month & end month for reports", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }

    while (currentMonth.isSameOrBefore(endDate, 'month')) {
      months.push(currentMonth.format('MM/YYYY'));
      currentMonth.add(1, 'month');
    }

    if (req.user && req.user.main == req.config.admin.main) {
      // Admin
      zonesWithCentersGrouped = await Center.getZonesWithCentersGroupedAPI(countries, zones, centers);
    } else {
      // Non-Admin
      let centersObj = await Center.find({ _id: { $in: req.user.center_id }, status: "active" }).distinct('_id');
      zonesWithCentersGrouped = await Center.getZonesWithCentersGroupedNonAdminAPI(countries, zones, centers && centers.length ? centers : centersObj);
    }
    const listOfSchoolsWithIds = _.flatMap(zonesWithCentersGrouped, 'schools').map(school => school.school_id);

    let repTotal = [];
    if (zonesWithCentersGrouped && zonesWithCentersGrouped.length) {
      for (const date of months) {
        const repObj = [];
        const dateParse = moment(date, 'MM/YYYY');
        const dateParseLast = moment(date, 'MM/YYYY');
        const lastDate = dateParseLast.endOf('month');
        const firstDateFormatted = dateParse.date(1).format('YYYY-MM-DD');
        const lastDateFormatted = lastDate.format('YYYY-MM-DD');

        dateArr.push(`${dateParse.format('MMMM')}-${dateParse.format('YYYY')}`);
        let total = 0; // Initialize the total to 0

        for (const [i, center_id] of listOfSchoolsWithIds.entries()) {
          // const leadCount = await Lead.reportCountDefault(date, timeZone, center_id);
          let leadCount = await Lead.find({
            lead_date: {
              $gte: momentZone.tz(firstDateFormatted, "Asia/Kolkata").startOf('day').toDate(),
              $lte: momentZone.tz(lastDateFormatted, "Asia/Kolkata").endOf('day').toDate()
            },
            school_id: center_id
          }, { lead_no: 1 });
          leadCount = leadCount.length;
          repObj.push(leadCount);
        }
        // repObj.total = `<strong>${total}</strong>`;
        repArr.push(repObj);
        repTotal.push(total);
      }
    } else {
      return res.status(400).json(response.responseError("Centers not available", 400, 400, req.originalUrl, req.body, moment().format('MMMM Do YYYY, h:mm:ss a')));
    }

    return res.status(200).json(response.responseSuccess("YTD Reports", {centers: zonesWithCentersGrouped, dates: dateArr, leads_data: repArr}, 200));
  } catch (err) {
    helper.errorDetailsForControllers(err, "getYTDReports - get request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};