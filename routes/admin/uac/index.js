const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const uacController = require('../../../controllers/admin/uacController');

router.get('/all',
  employeeController.onlyAdminEntry,
  uacController.test
);

router.get('/role/all',
  employeeController.onlyAdminEntry,
  uacController.getAllRoles
);

router.get('/permission/all',
  employeeController.onlyAdminEntry,
  uacController.getAllPermissions
);

router.get('/role/add',
  employeeController.onlyAdminEntry,
  uacController.postAddRole
);

router.get('/permission/add',
  employeeController.onlyAdminEntry,
  uacController.getAddPermission
);

router.post('/permission/add',
  employeeController.onlyAdminEntry,
  uacController.postAddPermission
);

router.post('/role/create',
  employeeController.onlyAdminEntry,
  uacController.postCreateRole
);

router.get('/role/edit/:role_id',
  employeeController.onlyAdminEntry,
  uacController.getEditRole
);

router.post('/role/edit/:role_id',
  employeeController.onlyAdminEntry,
  uacController.postEditRole
);

module.exports = router;