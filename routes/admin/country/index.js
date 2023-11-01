const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const countryController = require('../../../controllers/admin/countryController');

router.get('/all',
  employeeController.onlyAdminEntry,
  countryController.allCountry
);

router.get('/add',
  employeeController.onlyAdminEntry,
  countryController.getAddCountry
);

router.post('/add',
  employeeController.onlyAdminEntry,
  countryController.postAddCountry
);

router.get('/edit/:country_id',
  employeeController.onlyAdminEntry,
  countryController.getEditCountry
);

router.post('/edit/:country_id',
  employeeController.onlyAdminEntry,
  countryController.postEditCountry
);

module.exports = router;
