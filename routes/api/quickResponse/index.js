const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const quickResponseController = require('../../../controllers/api/quickResponseController');
const handlers = require("../../../handlers/helper");
const { permission_name } = require('../../../config/responseSetting');
const Validator = require('../../../middlewares/Validator');

router.get('/test',
  quickResponseController.test
);

router.get('/all/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.getAllQuickResponse
);

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.getAllQuickResponse
);

router.get('/all/lead/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.getAllLeadQuickResponse
);

router.get('/all/lead',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.getAllLeadQuickResponse
);

router.get('/detail/:message_id',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.getDetailQuickResponse
);

router.post('/search/:page',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.searchQuickResponse
);

router.post('/search',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.searchQuickResponse
);

router.post('/create/message',
  accountController.Auth,
  accountController.checkToken,
  Validator('addMessage'),
  handlers.requireAPIPermission(permission_name.MSG_ADD),
  quickResponseController.uploadFileIntoMedia,
  quickResponseController.postCreateMessage
);

router.post('/update/message/:message_id',
  accountController.Auth,
  accountController.checkToken,
  Validator('addMessage'),
  handlers.requireAPIPermission(permission_name.MSG_EDIT),
  quickResponseController.uploadFileIntoMedia,
  quickResponseController.postUpdateMessage
);

router.get('/existingclient/:message_id/:page',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.getExistingClientQuickResponse
);

router.get('/existingclient/:message_id',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.getExistingClientQuickResponse
);

router.get('/otherclient/:message_id/:page',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.getOtherClientQuickResponse
);

router.get('/otherclient/:message_id',
  accountController.Auth,
  accountController.checkToken,
  quickResponseController.getOtherClientQuickResponse
);

router.get('/send/:message_id',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.sendQuickResponseThroughList
);

router.get('/all/lead/list/:message_id/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.getAllLeadListQuickResponse
);

router.post('/send/message',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  // Validator('sendMessage'),
  quickResponseController.postSendMessageToLead
);

router.post('/send/email/multiple',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.MSG_LISTING),
  quickResponseController.postSendEmailToMultipleLeads
);


module.exports = router;