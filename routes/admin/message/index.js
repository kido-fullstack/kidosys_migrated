const express = require('express');
const router = express.Router();
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const messageController = require('../../../controllers/admin/messageController');
const employeeController = require('../../../controllers/admin/employeeController');

router.get('/',
  messageController.test
);

router.get('/all',
  handlers.requirePermission(permission_name.MSG_LISTING),
  messageController.getAllMessages
);

router.get('/add',
  handlers.requirePermission(permission_name.MSG_ADD),
  messageController.getAddMessage
);

router.post('/add',
  // handlers.requirePermission(permission_name.MSG_ADD),
  messageController.postAddMessage
);

router.post('/add/from/direct/lead/msg',
  messageController.postAddFromDirectMessage
);

router.get('/edit/:message_id',
  handlers.requirePermission(permission_name.MSG_EDIT),
  messageController.getEditMessage,
);

router.post('/edit/:message_id',
  // handlers.requirePermission(permission_name.MSG_EDIT),
  messageController.postEditMessage
);

router.post('/view/attachments',
  handlers.requirePermission(permission_name.MSG_LISTING),
  messageController.postViewAttachments
);

module.exports = router;