const express = require('express');
const router = express.Router();
const followupsController = require('../../../controllers/api/followupsController');
const accountController = require('../../../controllers/api/accountController');
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const Validator = require('../../../middlewares/Validator');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllFollowups
);

router.get('/all/overdue/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllOverdueFollowups
);

router.get('/all/overdue',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllOverdueFollowups
);

router.get('/all/today/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllTodayFollowups
);

router.get('/all/today',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllTodayFollowups
);

router.get('/all/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllYesterdayFollowups
);

router.get('/all/yesterday',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllYesterdayFollowups
);

router.get('/all/upcoming/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllUpcomingFollowups
);

router.get('/all/upcoming',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllUpcomingFollowups
);

router.get('/all/someday/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllSomedayFollowups
);

router.get('/all/someday',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllSomedayFollowups
);

router.get('/all/nofollowup/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNofollowupFollowups
);

router.get('/all/nofollowup',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNofollowupFollowups
);

router.get('/all/pastsevendays/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllPastSevenDaysFollowups
);

router.get('/all/pastsevendays',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllPastSevenDaysFollowups
);

router.get('/all/pastthirtydays/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllPastThirtyDaysFollowups
);

router.get('/all/pastthirtydays',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllPastThirtyDaysFollowups
);

router.get('/all/older/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllOlderFollowups
);

router.get('/all/older',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllOlderFollowups
);

router.get('/all/tomorrow/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllTomorrowFollowups
);

router.get('/all/tomorrow',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllTomorrowFollowups
);

router.get('/all/nextthirtydays/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNextThirtyDaysFollowups
);

router.get('/all/nextthirtydays',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNextThirtyDaysFollowups
);

router.get('/all/nextsevendays/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNextSevenDaysFollowups
);

router.get('/all/nextsevendays',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getAllNextSevenDaysFollowups
);

router.get('/get/lead/details/',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.FOLLOWUP_ADD),
  followupsController.getAddFollowupLeadDetails
);

router.post('/add/:lead_id',
  accountController.Auth,
  accountController.checkToken,
  Validator('addFollowups'),
  handlers.requireAPIPermission(permission_name.FOLLOWUP_ADD),
  followupsController.postAddFollowup
);

router.get('/saved/list',
  accountController.Auth,
  accountController.checkToken,
  followupsController.getSavedListFollowups
);

router.post('/filter',
  accountController.Auth,
  accountController.checkToken,
  followupsController.dropdownFilter
);

router.post('/filter/:page',
  accountController.Auth,
  accountController.checkToken,
  followupsController.dropdownFilter
);

module.exports = router;