const Joi = require('joi');

const OTPSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().regex(/^[0-9]{6}$/).messages({'string.pattern.base': `OTP must have 6 digits.`}).required()
});

module.exports = OTPSchema;