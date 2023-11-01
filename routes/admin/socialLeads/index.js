const express = require('express');
const router = express.Router();
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const socialController = require('../../../controllers/admin/socialController');

router.get('/',
  socialController.getTest
);

router.get('/webhook',
  socialController.getFBLeadsWebhook
);

router.post('/webhook',
  socialController.postFBLeadsWebhook
);

module.exports = router;