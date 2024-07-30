const express = require('express');
const router = express.Router();
const programController = require('../../../controllers/api/programController');
const accountController = require('../../../controllers/api/accountController');

router.get('/getbycategory',
  accountController.Auth,
  accountController.checkToken,
  programController.GetProByProCat
);
router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  programController.getAllProgram
);

router.get('/get',
  accountController.Auth,
  accountController.checkToken,
  programController.getProgramByProgramCategory
);

router.get('/get/new',
  accountController.Auth,
  accountController.checkToken,
  programController.GetProByProCatNew
);

router.get('/getbycategory/new',
  accountController.Auth,
  accountController.checkToken,
  programController.getProgramByProgramCategoryNew
);

module.exports = router;
