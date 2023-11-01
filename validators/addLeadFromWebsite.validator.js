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
  child_dob: Joi.date().format('MM/DD/YYYY').optional().allow(null),
  city: Joi.string().when(
    'form', {
      is: 'contact',
      then: Joi.string().required()
    }
  ),
  desc: Joi.string().optional().allow('')
});

module.exports = addLeadFromWebsiteSchema;