const express = require('express');
const router = express.Router();
const statusController = require('../../../controllers/api/statusController');
const accountController = require('../../../controllers/api/accountController');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  statusController.getAllStatus
);
module.exports = router;