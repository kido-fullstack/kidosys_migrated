const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const centerController = require('../../../controllers/api/centerController');

// Adding to support get geographical data API
const Validator = require('../../../middlewares/Validator');

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

router.get('/getbyuser',
  accountController.Auth,
  accountController.checkToken,
  centerController.getByUser
);

router.post('/get/geographical/data',
  accountController.Auth,
  accountController.checkToken,
  Validator('centerId'),
  centerController.getDataByCenter
);

module.exports = router;