const express = require('express');
const router = express.Router();
const zoneController = require('../../../controllers/api/zoneController');
const accountController = require('../../../controllers/api/accountController');

router.post('/getzonebycountry',
  accountController.Auth,
  accountController.checkToken,
  zoneController.getZoneByCountry
);

module.exports = router;