const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const reportsController = require('../../../controllers/api/reportsController');
const handlers = require("../../../handlers/helper");
const { permission_name } = require('../../../config/responseSetting');

router.get('/mtd/all/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.REPORT_MTD),
  reportsController.getMTDReports
);

router.get('/ytd/all/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.REPORT_YTD),
  reportsController.getYTDReports
);

module.exports = router;