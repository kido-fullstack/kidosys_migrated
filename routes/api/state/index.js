const express = require('express');
const router = express.Router();
const stateController = require('../../../controllers/api/stateController');
const accountController = require('../../../controllers/api/accountController');

router.get('/getstatebycountry',
  accountController.Auth,
  accountController.checkToken,
  stateController.getStateByCountry
);

module.exports = router;