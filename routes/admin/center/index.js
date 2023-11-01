const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const middleware = require('../../../handlers/middleware');
const employeeController = require('../../../controllers/admin/employeeController');
const centerController = require('../../../controllers/admin/centerController');

router.get('/all',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.allCenter
);

router.get('/add',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.getAddCenter
);

router.post('/add',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.postAddCenter
);

router.get('/view/detail/:center_id',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.getViewCenter
);

router.get('/edit/:center_id',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.getEditCenter
);

router.post('/edit/:center_id',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  centerController.postEditCenter
);
router.post('/dropdown',
  centerController.dropdownFilter
);
router.post('/programdropdown',
  centerController.programFilter
);
router.post('/city',
  centerController.cityFilter
);

router.post('/filter/dropdown',
  centerController.filterDropdownOnEmp
);

router.get('/get/allstates',
  centerController.getAllStates
);

module.exports = router;