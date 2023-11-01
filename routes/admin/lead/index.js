const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const leadController = require('../../../controllers/admin/leadController');
const handlers = require('../../../handlers/helper');
const { permission_name } = require('../../../config/responseSetting');
const employeeController = require('../../../controllers/admin/employeeController');

router.get('/all',
  // handlers.requirePermission(permission_name.LEAD_LISTING),
  leadController.allLeads
);

router.get('/add',
  handlers.requirePermission(permission_name.LEAD_ADD),
  leadController.getAddLead
);

router.post('/add',
  handlers.requirePermission(permission_name.LEAD_ADD),
  leadController.postAddLead
);
router.post('/addsibling',
  leadController.postAddSiblingLead
);

router.get('/add/followup/:lead_id',
  handlers.requirePermission(permission_name.FOLLOWUP_ADD),
  leadController.updateNewLead,
  leadController.getAddFollowUp
);

router.get('/edit/followup/:follow_id',
  handlers.requirePermission(permission_name.FOLLOWUP_EDIT),
  leadController.getEditFollowUp
);

router.post('/edit/followup/:follow_id',
  handlers.requirePermission(permission_name.FOLLOWUP_EDIT),
  leadController.postEditFollowUp
);

router.post('/add/followup/:lead_id',
  handlers.requirePermission(permission_name.FOLLOWUP_ADD),
  leadController.postAddFollowUp
);

router.get('/view/detail/:lead_id',
  leadController.getViewLead
);

router.get('/follow/all',
  handlers.requirePermission(permission_name.FOLLOWUP_LISTING),
  leadController.getFollowLead
);

router.post('/filter/date',
  leadController.postLeadDate
);

router.post('/followup/filter/date',
  leadController.postLeadFollowDate
);

router.get('/edit/:lead_id',
  handlers.requirePermission(permission_name.LEAD_EDIT),
  leadController.getEditLead
);
router.get('/view/:lead_id',
  handlers.requirePermission(permission_name.LEAD_EDIT),
  leadController.updateNewLead,
  leadController.getViewLead
);

router.post('/edit/:lead_id',
  handlers.requirePermission(permission_name.LEAD_EDIT),
  leadController.postEditLead
);

router.get('/followup/edit/:followup_id',
  leadController.getEditLeadFollow
);

router.post('/followup/edit/:followup_id',
  leadController.postEditLeadFollow
);

router.get('/datatable',
  handlers.requirePermission(permission_name.LEAD_LISTING),
  leadController.datatableFilter
);

router.get('/datatablefollowup',
  handlers.requirePermission(permission_name.FOLLOWUP_LISTING),
  leadController.datatableFollowupFilter
);

router.post('/dropdown',
  leadController.dropdownFilter
);

router.get('/allmessage/:id',
  handlers.requirePermission(permission_name.CONTENT_VIEW_LISTING),
  leadController.allMessage
);

router.post('/zonefilter',
  leadController.postEditZoneFilter
);
router.post('/centerfilter',
  leadController.postEditCenterFilter
);
router.get('/messagedatatable/',
  handlers.requirePermission(permission_name.CONTENT_VIEW_LISTING),
  leadController.messageDatatable
);

router.post('/addmessage/:id',
  leadController.addMessage
);

router.get('/send/:id',
  leadController.messageDeatil
);

router.post('/status',
  leadController.statusFilter
);

router.post('/state',
  leadController.stateFilter
);

router.post('/city',
  leadController.cityFilter
);

router.post('/center',
  leadController.centerFilter
);

router.get('/filter',
  employeeController.checkAdminOrNot,
  leadController.filterDropdown
);

router.get('/welcome/email/read',
  employeeController.checkAdminOrNot,
  leadController.readWelcomeEmail
);

router.post('/get/center/accordingtouser',
  employeeController.checkAdminOrNot,
  leadController.getCenterAccordingToUser
);

router.post('/transfer/lead',
  handlers.requirePermission(permission_name.LEAD_TRANSFER),
  leadController.postTransferLead
);

router.get('/get/leadsnumber/accordingtouser',
  employeeController.checkAdminOrNot,
  leadController.getLeadsAccordingToUser
);

router.get('/create/existing/:old_lead',
  handlers.requirePermission(permission_name.LEAD_ADD),
  leadController.getCreateExistingLeadWithOldLead
);

router.post('/add/existing/:old_lead',
  handlers.requirePermission(permission_name.LEAD_ADD),
  leadController.postCreateExistingLeadWithOldLead
);

router.post('/check/email/validation',
  leadController.postEmailValidation
);

// socket implementation
router.get('/upload/excel',
  leadController.uploadExcel
);

// socket implementation DEMO
router.post('/upload',
  handlers.requirePermission(permission_name.LEAD_IMPORT),
  leadController.uploadFile,
  leadController.uploadExcelPost
);
// ACTUAL UPLOAD
router.get('/upload/file',
  handlers.requirePermission(permission_name.LEAD_IMPORT),
  leadController.uploadFileGet
);

module.exports = router;
