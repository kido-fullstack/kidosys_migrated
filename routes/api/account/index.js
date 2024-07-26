const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/api/accountController');
const Validator = require('../../../middlewares/Validator');

router.get('/',
  accountController.test
);

router.post('/login',
  Validator('login'),
  accountController.postLogin
);

router.post('/logout',
  accountController.Auth,
  accountController.checkToken,
  accountController.postLogout
);

router.get('/my',
  accountController.Auth,
  accountController.checkToken,
  accountController.getMyAccount
);

router.post('/login/verify',
  // Validator('OTP'),
  accountController.postLoginVerify
);

router.post('/resend/otp',
  // Validator('resendOTP'),
  accountController.postResendOTP
);

module.exports = router;