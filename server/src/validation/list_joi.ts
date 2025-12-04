import Joi from 'joi';

export const createListSchema = Joi.object({
  title: Joi.string().required().min(1).max(255),
  position: Joi.number().integer().min(0).optional()
});

export const updateListSchema = Joi.object({
  title: Joi.string().optional().min(1).max(255),
  position: Joi.number().integer().min(0).optional()
}).min(1); // At least one field must be provided

export const moveListSchema = Joi.object({
  position: Joi.number().integer().min(0).required()
});
