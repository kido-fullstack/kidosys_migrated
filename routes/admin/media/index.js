const express = require('express');
const router = express.Router();
const mediaController = require('../../../controllers/admin/mediaController');

// router.get('/',
//   accountController.requireRole('admin', 'user'),
//   mediaController.getMediaPage
// );

router.post('/store',
  mediaController.storeMediaToDB
);

// router.post('/delete/file',
//   mediaController.deleteFile
// );

router.get('/getLists',
  mediaController.getLists
);

module.exports = router;