const express = require('express');
const router = express.Router();
const countryController = require('../../../controllers/api/countryController');
const accountController = require('../../../controllers/api/accountController');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  countryController.getAllCountry
);

module.exports = router;