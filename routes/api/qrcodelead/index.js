const express = require('express');
const router = express.Router();
const qrLeadController = require('../../../controllers/api/qrLeadController');

router.get('/create/lead/:view_option',
  qrLeadController.checkValid,
  qrLeadController.addLead
);

router.post('/create/lead/:view_option',
  // qrLeadController.checkValid,
  qrLeadController.postAddLead
);

router.get('/create/test',
 qrLeadController.test
);

router.get('/thank-you',
  qrLeadController.thankYou
);

module.exports = router;