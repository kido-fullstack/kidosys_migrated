const express = require('express');
const router = express.Router();
const qrcodeController = require('../../../controllers/admin/qrcodeController');

router.get('/generate',
  qrcodeController.generateQRCode
);
// router.get('/add',
//   qrcodeController.addLead
// );
// router.post('/add',
//   qrcodeController.postAddLead
// );
module.exports = router;