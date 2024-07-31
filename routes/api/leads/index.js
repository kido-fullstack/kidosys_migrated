const express = require('express');
const router = express.Router();
const leadsController = require('../../../controllers/api/leadsController');
const accountController = require('../../../controllers/api/accountController');
const handlers = require("../../../handlers/helper");
const { permission_name } = require('../../../config/responseSetting');
const Validator = require('../../../middlewares/Validator');

router.get('/all',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLeads
);

router.get('/all/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayLeads
);

router.get('/all/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayLeads
);

router.get('/all/today/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayLeadsNew
);

router.get('/all/today/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayNoPageLeads
);

router.get('/all/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayLeads
);

router.get('/all/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayLeads
);

router.get('/all/yesterday/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayLeadsNew
);

router.get('/all/yesterday/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayNoPageLeads
);

router.get('/all/thisweek/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisWeakLeads
);

router.get('/all/thisweek',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisWeakLeads
);

router.get('/all/thismonth/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisMonthLeads
);

router.get('/all/thismonth',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisMonthLeads
);

router.get('/all/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderLeads
);

router.get('/all/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderLeads
);

router.get('/all/older/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderLeadsNew
);

router.get('/all/older/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderNoPageLeads
);

router.get('/all/enquiry/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayEnquiry
);

router.get('/all/enquiry/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayEnquiry
);

router.get('/all/enquiry/today/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayEnquiryNew
);

router.get('/all/enquiry/today/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayNoPageEnquiry
);

router.get('/all/enquiry/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayEnquiry
);

router.get('/all/enquiry/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayEnquiry
);

router.get('/all/enquiry/yesterday/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayEnquiryNew
);

router.get('/all/enquiry/yesterday/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayNoPageEnquiry
);

router.get('/all/enquiry/thisweek/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisWeakEnquiry
);

router.get('/all/enquiry/thisweek',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisWeakEnquiry
);

router.get('/all/enquiry/thismonth/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisMonthEnquiry
);

router.get('/all/enquiry/thismonth',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllThisMonthEnquiry
);

router.get('/all/enquiry/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderEnquiry
);

router.get('/all/enquiry/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderEnquiry
);

router.get('/all/enquiry/older/new/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderEnquiryNew
);

router.get('/all/enquiry/older/new',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderNoPageEnquiry
);

router.get('/details/:lead_id',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.FOLLOWUP_ADD),
  leadsController.getLeadDetails
);

router.get('/saved/list',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getSavedListLead
);

router.get('/enquiry/saved/list',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getSavedListEnq
);

router.post('/add',
  accountController.Auth,
  accountController.checkToken,
  Validator('addLead'),
  handlers.requireAPIPermission(permission_name.LEAD_ADD),
  leadsController.addLeadPost
);

router.post('/addext',
  // accountController.Auth,
  // accountController.checkToken,
  // Validator('addLead'),
  // handlers.requireAPIPermission(permission_name.LEAD_ADD),
  leadsController.addLeadPost_ext
);

router.get('/edit/:lead_id',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_EDIT),
  leadsController.getEditLeadPost
);

router.post('/edit/:lead_id',
  accountController.Auth,
  accountController.checkToken,
  Validator('editLead'),
  handlers.requireAPIPermission(permission_name.LEAD_EDIT),
  leadsController.postEditLeadPost
);

// know us
router.get('/source',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getAllSource
);

router.get('/statuses',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getAllStatuses
);

router.get('/substatuses',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getAllSubStatuses
);

router.get('/actionplanned',
  accountController.Auth,
  accountController.checkToken,
  leadsController.getAllActionPlanned
);

router.get('/source/category',
  accountController.Auth,
  accountController.checkToken,
  leadsController.dropdownSourceCategory
);

router.get('/stages',
  accountController.Auth,
  accountController.checkToken,
  leadsController.dropdownStages
);

router.post('/filter',
  accountController.Auth,
  accountController.checkToken,
  leadsController.dropdownFilter
);

router.post('/filter/:page',
  accountController.Auth,
  accountController.checkToken,
  leadsController.dropdownFilter
);

router.post('/search/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.searchFilter
);

router.post('/search',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.searchFilter
);

router.post('/website/create',
  accountController.Auth,
  accountController.checkToken,
  Validator('addLeadFromWebsite'),
  handlers.requireAPIPermission(permission_name.LEAD_ADD),
  leadsController.addLeadForWebIntegration
);

router.get('/refresh/redis/data',
  leadsController.refreshData
);

router.get('/all/last/seven/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast7DaysNoPageLeads
);

router.get('/all/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast7DaysLeads
);

router.get('/all/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast30DaysNoPageLeads
);

router.get('/all/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast30Days
);

module.exports = router;
