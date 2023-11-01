const express = require('express');
const router = express.Router();
const logController = require('../../../controllers/admin/logController');

router.get('/error/logs',
  logController.checkLogFileExist,
  logController.getAllApiErrorsLogs
);

router.get('/combined/logs',
  logController.checkCombinedLogFileExist,
  logController.getAllApiLogs
);

router.get('/exception/logs',
  logController.checkExceptionLogFileExist,
  logController.getExceptionApiLogs
);

router.get('/rejection/logs',
  logController.checkRejectionLogFileExist,
  logController.getRejectionApiLogs
);

module.exports = router;