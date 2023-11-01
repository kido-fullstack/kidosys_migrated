const Joi = require('joi');

const addMessageSchema = Joi.object({
  title: Joi.string().required(),
  msg: Joi.string().required()
});

module.exports = addMessageSchema;