const Joi = require('joi');

const bookmarkSchema = Joi.object({
    id: Joi.string().case('lower').required(),
    type: Joi.string().valid('lead', 'enq', 'followups').required()
});

module.exports = bookmarkSchema;