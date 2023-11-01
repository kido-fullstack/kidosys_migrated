const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const categoryController = require('../../../controllers/admin/categoryController');

router.get('/all',
  categoryController.allCategory
);

router.get('/add',
  categoryController.getAddCategory
);

router.post('/add',
  categoryController.uploadCategory,
  categoryController.resizeCategory,
  categoryController.postAddCategory
);

router.get('/view/detail/:category_id',
  categoryController.getViewCategory
);

router.get('/edit/:category_id',
  categoryController.getEditCategory
);

router.post('/edit/:category_id',
  categoryController.uploadCategory,
  categoryController.resizeCategory,
  categoryController.postEditCategory
);

module.exports = router;