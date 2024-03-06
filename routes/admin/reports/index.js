const express = require('express');
const router = express.Router();
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const reportsController = require('../../../controllers/admin/reportsController');

// Leads export ot excel reports start from below

router.get('/export',
  handlers.requirePermission(permission_name.LEAD_EXPORT),
  reportsController.exportLeads
);

router.get('/exportFollowups',
  handlers.requirePermission(permission_name.LEAD_EXPORT),
  reportsController.exportFollowups
);

router.get('/export/demo/template',
  handlers.requirePermission(permission_name.LEAD_EXPORT),
  reportsController.exportDemoTemplate
);

// MTD reports start from below

router.post('/get/header/dyamically',
  reportsController.postHeaderDyamically
);

router.post('/get/header/dyamically/nonadmin',
  reportsController.postHeaderDyamicallyNonAdmin
);

router.get('/mtd/all',
  handlers.requirePermission(permission_name.REPORT_MTD),
  reportsController.mtdLeadsReports
);

router.get('/execQuery',
  // handlers.requirePermission(permission_name.REPORT_MTD),
  reportsController.execQueryView
);
router.post('/execQuery',
  // handlers.requirePermission(permission_name.REPORT_MTD),
  reportsController.execQueryRun
);

router.get('/datatable/mtd',
  reportsController.mtdDatatableLeadsReports
);

router.get('/mtd/export',
  handlers.requirePermission(permission_name.REPORT_MTD),
  reportsController.mtdLeadsExportoExcel
);

// YTD reports start from below

router.get('/ytd/all',
  handlers.requirePermission(permission_name.REPORT_YTD),
  reportsController.ytdLeadsReports
);

router.get('/datatable/ytd',
  reportsController.ytdDatatableLeadsReports
);

router.get('/ytd/export',
  handlers.requirePermission(permission_name.REPORT_YTD),
  reportsController.ytdLeadsExportoExcel
);

// CHARTS reports start from below

router.get("/chart/circle/1/1",
  reportsController.getCircleChart1Of1
);

router.get("/chart/circle/1/2",
  reportsController.getCircleChart2Of1
);

router.get("/chart/circle/1/3",
  reportsController.getCircleChart3Of1
);

router.get("/chart/circle/2/1",
  reportsController.getCircleChart1Of2
);

router.get("/chart/circle/2/2",
  reportsController.getCircleChart2Of2
);

router.get("/chart/bar/1/1",
  reportsController.getBarChart1Of1
);

router.get("/chart/bar/1/2",
  reportsController.getBarChart2Of1
);

router.get("/chart/doughnut/1/1",
  reportsController.getDoughnutChart1Of1
);

router.get("/chart/doughnut/1/2",
  reportsController.getDoughnutChart2Of1
);

router.get("/chart/horizontal/1",
  reportsController.getHorizontalChart1
);

router.get("/chart/horizontal/2",
  reportsController.getHorizontalChart2
);

router.get("/chart/horizontal/3",
  reportsController.getHorizontalChart3
);

router.get("/chart/multiplebarchart/1",
  reportsController.getMultipleBarChart1
);

router.get("/chart/multipleLinebarchart/1",
  reportsController.getMultipleLineBarChart1
);

router.get("/headerbox/lead",
  reportsController.getHeaderLead
);

router.get("/headerbox/followup",
  reportsController.getHeaderFollowup
);

router.get("/headerbox/followupdue",
  reportsController.getHeaderFollowUpDue
);

module.exports = router;
