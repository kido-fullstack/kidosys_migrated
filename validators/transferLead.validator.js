const Joi = require('joi');

const transferLeadSchema = Joi.object({
  center_id: Joi.string().required(),
  pro_cat: Joi.string().required(),
  lead_id: Joi.string().required(),
  pro: Joi.optional().allow("")
});

module.exports = transferLeadSchema;