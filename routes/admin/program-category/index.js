const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const programCategoryController = require('../../../controllers/admin/programCategoryController');

router.get('/all',
  employeeController.onlyAdminEntry,
  programCategoryController.allProgramCategory
);

router.get('/add',
  employeeController.onlyAdminEntry,
  programCategoryController.getAddProgramCategory
);

router.post('/add',
  employeeController.onlyAdminEntry,
  programCategoryController.postAddProgramCategory
);

router.get('/edit/:programcategory_id',
  employeeController.onlyAdminEntry,
  programCategoryController.getEditProgramCategory
);

router.post('/edit/:programcategory_id',
  employeeController.onlyAdminEntry,
  programCategoryController.postEditProgramCategory
);

module.exports = router;
