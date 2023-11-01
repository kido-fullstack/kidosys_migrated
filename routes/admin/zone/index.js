const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const zoneController = require('../../../controllers/admin/zoneController');

router.get('/',
  employeeController.onlyAdminEntry,
  zoneController.test
);

router.get('/all',
  employeeController.onlyAdminEntry,
  zoneController.getAllZones
);

router.get('/add',
  employeeController.onlyAdminEntry,
  zoneController.getAddZone
);

router.post('/add',
  employeeController.onlyAdminEntry,
  zoneController.postAddZone
);

router.get('/edit/:zone_id',
  employeeController.onlyAdminEntry,
  zoneController.getEditZone
);

router.post('/edit/:zone_id',
  employeeController.onlyAdminEntry,
  zoneController.postEditZone
);

router.post('/filter/dropdown',
  zoneController.getAllZonesOnDropdown
);

module.exports = router;