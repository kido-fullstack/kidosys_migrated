const Joi = require('joi').extend(require('@joi/date'));

const addLeadFromWebsiteSchema = Joi.object({
  parent_name: Joi.string().required(),
  parent_first_contact: Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
  parent_email: Joi.string().email({ tlds: { allow: false } }).required(),
  form: Joi.string().valid('enquiry', 'contact').required(),
  center_id: Joi.string().when(
    'form', {
      is: 'enquiry',
      then: Joi.string().required()
    }
  ),
  child_name: Joi.string().optional().allow(''),
  child_first_name: Joi.string().optional().allow(''),
  company_name_parent: Joi.string().optional().allow(''),
  program_id: Joi.string().optional().allow(''),
  parent_know_aboutus: Joi.array().optional().allow(null),
  source_category: Joi.string().optional().allow(''),
  child_dob: Joi.date().format('DD/MM/YYYY').optional().allow(null),
  city: Joi.string().when(
    'form', {
      is: 'contact',
      then: Joi.string().required()
    }
  ),
  desc: Joi.string().optional().allow('')
});

module.exports = addLeadFromWebsiteSchema;