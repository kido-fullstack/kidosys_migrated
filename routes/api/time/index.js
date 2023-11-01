const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const timeController = require('../../../controllers/api/timeController');

router.get('/',
  timeController.test
);

router.get('/all',
  timeController.getAll
);

router.get('/all/range',
  timeController.getAllRange
);

router.post('/add',
  timeController.postTime
);

module.exports = router;