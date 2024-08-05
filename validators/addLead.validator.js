const Joi = require('joi');

const addLeadSchema = Joi.object({
  school_id: Joi.string().required(),
  programcategory_id: Joi.string().required(),
  program_id: Joi.string().allow(''),
  status_id: Joi.string().required(),
  substatus_id: Joi.string().required(),
  child_first_name: Joi.string().optional().allow(''),
  child_dob: Joi.date().optional(),
  child_last_name: Joi.string().optional().allow(''),
  child_gender: Joi.string().optional().allow(''),
  child_pre_school: Joi.string().optional().allow(''),
  primary_parent: Joi.string().required(),
  parent_name: Joi.string().required(),
  parent_first_contact: Joi.string().optional().allow(''),
  parent_second_contact: Joi.string().optional().allow(''),
  parent_email: Joi.string().required(),
  parent_education: Joi.string().optional().allow(''),
  parent_profession: Joi.string().optional().allow(''),
  secondary_parent_name: Joi.string().optional().allow(''),
  secondary_parent_type: Joi.string().optional().allow(''),
  secondary_first_contact: Joi.string().optional().allow(''),
  secondary_Second_contact: Joi.string().optional().allow(''),
  secondary_second_whatsapp: Joi.number().integer(),
  secondary_first_whatsapp: Joi.number().integer(),
  secondary_whatsapp: Joi.string().optional().allow(''),
  secondary_email: Joi.string().optional().allow(''),
  secondary_education: Joi.string().optional().allow(''),
  secondary_profession: Joi.string().optional().allow(''),
  parent_landmark: Joi.string().optional().allow(''),
  parent_house: Joi.string().optional().allow(''),
  parent_street: Joi.string().optional().allow(''),
  parent_address: Joi.string().optional().allow(''),
  parent_country: Joi.string().optional().allow(''),
  parent_state: Joi.string().optional().allow(''),
  parent_pincode: Joi.string().optional().allow(''),
  parent_area: Joi.string().optional().allow(''),
  parent_city: Joi.string().optional().allow(''),
  parent_know_aboutus: Joi.array().items(Joi.string()),
  parent_whatsapp: Joi.string().optional().allow(''),
  whatsapp_second: Joi.number().integer(),
  whatsapp_first: Joi.number().integer(),
  source_category: Joi.string().optional().allow(''),
  status_id: Joi.string().required(),
  substatus_id: Joi.string().required(),
  remark: Joi.string().optional().allow(''),
  sibling: Joi.number().integer(),
  old_lead_id: Joi.string().when(
    'sibling', {
    is: 1,
    then: Joi.string().required()
  }
  ),
  center_id: Joi.string().when(
    'form', {
    is: 'enquiry',
    then: Joi.string().required()
  }
  ),
  action_taken: Joi.array().items(Joi.string()),
  cor_parent: Joi.string().required(),
  company_name_parent: Joi.string().optional().allow('')
});

module.exports = addLeadSchema;
