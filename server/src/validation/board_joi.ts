import Joi from "joi";

export const createBoardSchema = Joi.object({
    title: Joi.string().required().min(1).max(255),
    description: Joi.string().optional().max(1000),
    background: Joi.string().optional().uri(),
    backgroundImage: Joi.any().optional() // Allow file upload field
});

export const updateBoardSchema = Joi.object({
    title: Joi.string().allow('').optional().min(0).max(255),
    description: Joi.string().allow('').optional().max(1000),
    background: Joi.string().allow('').optional().uri(),
    backgroundImage: Joi.any().optional() // Allow file upload field
}).min(1); // At least one field must be provided
