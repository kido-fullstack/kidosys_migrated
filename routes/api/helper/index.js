const express = require('express');
const router = express.Router();
const helperController = require('../../../controllers/api/helperController');

router.get('/',
  helperController.test
);

router.post('/remove/pdf',
  helperController.removePDFromEntirely
);

module.exports = router;