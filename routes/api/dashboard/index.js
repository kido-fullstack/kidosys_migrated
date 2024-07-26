const express = require('express');
const router = express.Router();
const dashboardController = require('../../../controllers/api/dashboardController');

router.get('/get',
  dashboardController.getDashboardData
);

module.exports = router;