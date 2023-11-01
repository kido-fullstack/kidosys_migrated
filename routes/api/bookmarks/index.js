const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const bookmarkController = require('../../../controllers/api/bookmarkController');
const Validator = require('../../../middlewares/Validator');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  bookmarkController.test
);

// lead, enqs, followups
router.post('/switch',
  accountController.Auth,
  accountController.checkToken,
  Validator('bookmark'),
  bookmarkController.checkValidMongoID,
  bookmarkController.checkId,
  bookmarkController.saveBookmark
);

module.exports = router;