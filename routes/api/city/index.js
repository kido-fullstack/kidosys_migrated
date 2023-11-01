const express = require('express');
const router = express.Router();
const cityController = require('../../../controllers/api/cityController');
const accountController = require('../../../controllers/api/accountController');

router.get('/getcitybystate',
  accountController.Auth,
  accountController.checkToken,
  cityController.getCityByState
);

module.exports = router;