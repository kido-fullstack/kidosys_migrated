const Joi = require('joi');

const centerIdSchema = Joi.object({
  center_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/, 'object Id')
});

module.exports = centerIdSchema;