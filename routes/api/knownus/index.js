const express = require('express');
const router = express.Router();
const knownusController = require('../../../controllers/api/knownusController');
const accountController = require('../../../controllers/api/accountController');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  knownusController.getAllKnownus
);
module.exports = router;