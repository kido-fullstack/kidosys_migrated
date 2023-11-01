const express = require('express');
const router = express.Router();
const leadController = require('../../../controllers/api/leadController');
const accountController = require('../../../controllers/api/accountController');

router.get('/',
  leadController.test
);

router.get('/config/:user_id',
  accountController.Auth,
  accountController.checkToken,
  leadController.configJSON
);

module.exports = router;