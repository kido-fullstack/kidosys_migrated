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

router.get('/all/new/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayLeadsNew
);

router.get('/all/new/today',
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

router.get('/all/new/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayLeadsNew
);

router.get('/all/new/yesterday',
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

router.get('/all/new/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderLeadsNew
);

router.get('/all/new/older',
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

router.get('/all/new/enquiry/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllTodayEnquiryNew
);

router.get('/all/new/enquiry/today',
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

router.get('/all/new/enquiry/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllYesterdayEnquiryNew
);

router.get('/all/new/enquiry/yesterday',
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

router.get('/all/new/enquiry/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllOlderEnquiryNew
);

router.get('/all/new/enquiry/older',
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

router.get('/source/category/new',
  accountController.Auth,
  accountController.checkToken,
  leadsController.dropdownSourceCategoryNew
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

router.get('/all/enquiry/last/seven/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast7DaysNoPageEnquiry
);

router.get('/all/enquiry/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast7DaysEnquiry
);

router.get('/all/enquiry/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast30DaysNoPageEnquiry
);

router.get('/all/enquiry/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getAllLast30DaysEnquiry
);

router.get('/starred/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredTodayLeads
);

router.get('/starred/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredTodayNoPageLeads
);

router.get('/starred/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredYesterdayLeads
);

router.get('/starred/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredYesterdayNoPageLeads
);

router.get('/starred/last/seven/days/',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast7DaysNoPageLead
);

router.get('/starred/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast7DaysLead
);

router.get('/starred/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast30DaysNoPageLead
);

router.get('/starred/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast30DaysLead
);

router.get('/starred/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredOlderLeads
);

router.get('/starred/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredOlderNoPageLeads
);

router.get('/tour/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourTodayLeads
);

router.get('/tour/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourTodayNoPageLeads
);

router.get('/tour/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourYesterdayLeads
);

router.get('/tour/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourYesterdayNoPageLeads
);

router.get('/tour/last/seven/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourLast7DaysNoPageLead
);

router.get('/tour/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourLast7DaysLead
);

router.get('/tour/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourLast30DaysNoPageLead
);

router.get('/tour/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourLast30DaysLead
);

router.get('/tour/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourOlderLeads
);

router.get('/tour/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getTourOlderNoPageLeads
);

router.get('/all/filter/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.allLeadsFilter
);

router.get('/starred/enquiry/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredTodayEnquiry
);

router.get('/starred/enquiry/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredTodayNoPageEnquiry
);

router.get('/starred/enquiry/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredYesterdayEnquiry
);

router.get('/starred/enquiry/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredYesterdayNoPageEnquiry
);

router.get('/starred/enquiry/last/seven/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast7DaysNoEnquiry
);

router.get('/starred/enquiry/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast7DaysEnquiry
);

router.get('/starred/enquiry/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast30DaysNoEnquiry
);

router.get('/starred/enquiry/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredLast30DaysEnquiry
);

router.get('/starred/enquiry/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredOlderEnquiry
);

router.get('/starred/enquiry/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getStarredOlderNoPageEnquiry
);

router.get('/enrolled/today',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledTodayNoPageEnquiry
);

router.get('/enrolled/today/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledTodayEnquiry
);

router.get('/enrolled/yesterday/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledYesterdayEnquiry
);

router.get('/enrolled/yesterday',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledYesterdayNoPageEnquiry
);

router.get('/enrolled/last/seven/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledLast7DaysNoPageEnquiry
);

router.get('/enrolled/last/seven/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledLast7DaysEnquiry
);

router.get('/enrolled/last/thirty/days',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledLast30DaysNoPageEnquiry
);

router.get('/enrolled/last/thirty/days/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledLast30DaysEnquiry
);

router.get('/enrolled/older/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledOlderEnquiry
);

router.get('/enrolled/older',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.getEnrolledOlderNoPageEnquiry
);

router.get('/all/enquiry/filter/:page',
  accountController.Auth,
  accountController.checkToken,
  handlers.requireAPIPermission(permission_name.LEAD_LISTING),
  leadsController.allEnquiryFilter
);

module.exports = router;
