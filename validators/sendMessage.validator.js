const Joi = require('joi');

const sendMessageSchema = Joi.object({
  type: Joi.string().valid('email', 'whatsapp', 'sms').required(),
  lead_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/, 'object Id'),
  message_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/, 'object Id'),
  to: Joi.string().when(
    'type', {
      is: 'email',
      then: Joi.string().email({ tlds: { allow: false } }).required(),
      otherwise: Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `to field phone number must have 10 digits.`}).required()
    }
  ),
  message: Joi.string().required()
});

module.exports = sendMessageSchema;