const Joi = require('joi').extend(require('@joi/date'));

const getOverdueFollowupsSchema = Joi.object({
  startDate: Joi.date().format('MM/DD/YYYY').required(),
  endDate: Joi.date().format('MM/DD/YYYY').required()
});

module.exports = getOverdueFollowupsSchema;