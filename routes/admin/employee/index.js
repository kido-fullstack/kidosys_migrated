const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const employeeController = require('../../../controllers/admin/employeeController');
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');

router.get('/',
  employeeController.test
);

router.get('/all',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_VIEW_LISTING),
  employeeController.allEmployee
);

router.get('/add',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_ADD_USER),
  employeeController.checkAdminOrNot,
  employeeController.getAddEmployee
);

router.post('/add',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_ADD_USER),
  employeeController.checkDuplicateEntryForEmployee,
  employeeController.checkAdminOrNot,
  employeeController.postAddEmployee
);

router.get('/edit/:employee_id',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_EDIT_USER),
  employeeController.getEditEmployee
);

router.post('/edit/:employee_id',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_EDIT_USER),
  employeeController.postEditEmployee
);

router.post('/add/apart/admin',
  accountController.authorization,
  handlers.requirePermission(permission_name.USER_ADD_USER),
  employeeController.getAdminEmail,
  employeeController.checkDuplicateEntryForEmployee,
  employeeController.checkAdminOrNot,
  employeeController.postAddEmployeeApartAdmin
);

router.get('/pending/approvals',
  accountController.authorization,
  employeeController.onlyAdminEntry,
  employeeController.getAllPendingApprovals,
);

router.post('/view/password',
  handlers.requirePermission(permission_name.USER_VIEW_PASSWORD),
  employeeController.viewPassword
);

router.post('/send/mail',
  handlers.requirePermission(permission_name.USER_SEND_MAIL),
  employeeController.sendMailToUser
);

router.post('/reset/password',
  handlers.requirePermission(permission_name.USER_RESET_PASSWORD),
  employeeController.resetPasswordUser
);

router.post('/approve/status/toggle',
  handlers.requirePermission(permission_name.USER_APPROVAL),
  employeeController.approveStatus
);

module.exports = router;