const express = require('express');
const router = express.Router();
const {
  catchErrors
} = require('../../../handlers/errorHandlers');
const accountController = require('../../../controllers/admin/accountController');
const clientController = require('../../../controllers/admin/clientController');

router.get('/',
  clientController.test
);

router.get('/all',
  // accountController.requireRole('admin', 'super admin'),
  clientController.allClient
);

router.get('/add',
  // accountController.requireRole('admin', 'super admin'),
  clientController.getAddClient
);

router.post('/add',
  // accountController.requireRole('admin', 'super admin'),
  clientController.postAddClient
);

router.get('/edit/:client_id',
  // accountController.requireRole('admin', 'super admin'),
  clientController.getEditClient
);

router.post('/edit/:client_id',
  // accountController.requireRole('admin', 'super admin'),
  clientController.postEditClient
);

router.get('/select/state/:state_id',
  clientController.selectState
);

router.get('/select/substatus/:status_id',
  clientController.selectSubStatus
);

module.exports = router;