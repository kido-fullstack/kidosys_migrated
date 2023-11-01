const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const inventoryController = require('../../../controllers/admin/inventoryController');

router.get('/test',
  inventoryController.testAdminAPI
);

router.get('/',
  inventoryController.redirectToDashboard
);

router.get('/dashboard',
  accountController.requireRole('admin', 'super admin'),
  inventoryController.getDashboard
);

router.get('/404',
  accountController.requireRole('admin', 'super admin'),
  inventoryController.redirectToFourOhFour
);

router.get('/error',
  accountController.requireRole('admin', 'super admin'),
  inventoryController.redirectToErr
);

router.get('/masters',
  accountController.requireRole('admin', 'super admin'),
  employeeController.checkAdminOrNot,
  inventoryController.allMasters
);

router.post('/program/dropdown',
  inventoryController.programDropdown
);

router.post('/state/dropdown',
  inventoryController.stateDropdown
);

router.post('/city/dropdown',
  inventoryController.cityDropdown
);

router.post('/check/email/validation',
  inventoryController.checkEmailValidation
);

module.exports = router;