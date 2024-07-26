const express = require('express');
const router = express.Router();
const programCatController = require('../../../controllers/api/programCatController');
const accountController = require('../../../controllers/api/accountController');

router.get('/getbycenter',
  accountController.Auth,
  accountController.checkToken,
  programCatController.GetProByCenter
);

router.get('/get',
  accountController.Auth,
  accountController.checkToken,
  programCatController.GetProgramByCenter
);

// Duplicate API for Atto Frontend dev
router.get('/get/by/center',
  accountController.Auth,
  accountController.checkToken,
  programCatController.GetProByCenter
);

// Duplicate API for Atto Frontend dev
router.get('/getbycenter',
  accountController.Auth,
  accountController.checkToken,
  programCatController.GetProgramByCenter
);

module.exports = router;