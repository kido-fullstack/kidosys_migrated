const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const academicYearController = require('../../../controllers/admin/academicYearController');

router.get('/',
  academicYearController.test
);

router.get('/all',
  handlers.requirePermission(permission_name.ACADEMIC_YEAR_LISTING),
  academicYearController.getAllAcaYear
);

router.get('/add',
  handlers.requirePermission(permission_name.ACADEMIC_YEAR_ADD),
  academicYearController.getAddAcademicYear
);

router.post('/add',
  handlers.requirePermission(permission_name.ACADEMIC_YEAR_ADD),
  academicYearController.postAddAcademicYear,
  // academicYearController.updateStatusAll
);

router.get('/edit/:year_id',
  handlers.requirePermission(permission_name.ACADEMIC_YEAR_EDIT),
  academicYearController.getEditAcademicYear,
);

router.post('/edit/:year_id',
  handlers.requirePermission(permission_name.ACADEMIC_YEAR_EDIT),
  academicYearController.postEditAcademicYear,
  academicYearController.updateStatusAll
);

module.exports = router;