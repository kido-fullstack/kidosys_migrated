const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const programController = require('../../../controllers/admin/programController');

router.get('/all',
  employeeController.onlyAdminEntry,
  programController.allProgram
);

router.get('/add',
  employeeController.onlyAdminEntry,
  programController.getAddProgram
);

router.post('/add',
  employeeController.onlyAdminEntry,
  programController.postAddProgram
);

router.get('/edit/:program_id',
  employeeController.onlyAdminEntry,
  programController.getEditProgram
);

router.post('/edit/:program_id',
  employeeController.onlyAdminEntry,
  programController.postEditProgram
);

module.exports = router;
