const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');

router.get('/login',
  accountController.getLogin
);

router.post('/login',
  accountController.postAdminLogin
);

router.get('/passwordexpire',
  accountController.getPasswordExpiry
);

router.post('/passwordexpire',
  accountController.postPasswordExpiry
);

router.post('/loginwithotp',
  accountController.loginWithOtp
);

router.post('/resendotp',
  accountController.resendOtp
);

router.get('/logout',
  accountController.getAdminLogout
);

router.get('/my',
  accountController.authorization,
  accountController.getMyAccount
);

module.exports = router;