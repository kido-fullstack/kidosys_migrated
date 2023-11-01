const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const responsesController = require('../../../controllers/admin/responsesController');
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const employeeController = require('../../../controllers/admin/employeeController');

router.get('/all',
  handlers.requirePermission(permission_name.CONTENT_VIEW_LISTING),
  responsesController.allResponses
);

router.get('/send/:message_id',
  responsesController.deatilResponse
);

router.get('/datatable',
  responsesController.datatableFilter
);

router.get('/messagedatatable/:message_id',
  responsesController.messagedatatableFilter
);

router.get('/otherclient/:message_id',
  responsesController.messagedatatableFilter2
);

router.post('/whatsapp/:id',
  responsesController.whatsappResponse
);
router.get('/downloadfile/:file',
  responsesController.downoadFile
);
// router.get('/email/:id',
//   responsesController.emailResponse
// )

router.post('/get/message',
  responsesController.previewMessage
);

module.exports = router;
