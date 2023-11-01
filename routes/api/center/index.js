const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const centerController = require('../../../controllers/api/centerController');

router.get('/',
  centerController.test
);

router.get('/view/detail/:center_id',
  accountController.Auth,
  accountController.checkToken,
  centerController.viewCenter
);

router.post('/edit/detail/:center_id',
  accountController.Auth,
  accountController.checkToken,
  centerController.editCenter
);
router.post('/getcenterbyzone',
  accountController.Auth,
  accountController.checkToken,
  centerController.getCenterByZone
);

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  centerController.allCenter
);

module.exports = router;