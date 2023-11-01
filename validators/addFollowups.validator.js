const Joi = require('joi');

const addFollowupsSchema = Joi.object({
  follow_up_time: Joi.string().required(),
  follow_up_date: Joi.date().greater('now').required(),
  status_id: Joi.string().required(),
  substatus_id: Joi.string().required(),
  no_followup: Joi.number().integer(),
  someday: Joi.number().integer(),
  follow_status: Joi.string().required(),
  follow_sub_status: Joi.string().required(),
  notes: Joi.string().optional().allow(''),
  remark: Joi.string().optional().allow(''),
  action_taken: Joi.array().items(Joi.string())
});

module.exports = addFollowupsSchema;