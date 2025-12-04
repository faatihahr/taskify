import Joi from 'joi';

export const createCardSchema = Joi.object({
  title: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().allow('').max(1000),
  listId: Joi.string().required(),
  position: Joi.number().integer().min(0).optional(),
  dueDate: Joi.date().optional().allow(null),
  coverImage: Joi.string().uri().optional().allow(null)
});

export const updateCardSchema = Joi.object({
  title: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().allow('').max(1000),
  dueDate: Joi.date().optional().allow(null),
  coverImage: Joi.string().uri().optional().allow(null),
  completed: Joi.boolean().optional()
}).min(1); // At least one field must be provided

export const moveCardSchema = Joi.object({
  listId: Joi.string().required(),
  position: Joi.number().integer().min(0).required()
});
