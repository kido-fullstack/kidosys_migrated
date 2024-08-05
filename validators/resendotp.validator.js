const Joi = require('joi');

const resndOTPSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

module.exports = resndOTPSchema;