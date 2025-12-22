"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveCardSchema = exports.updateCardSchema = exports.createCardSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCardSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(1).max(255),
    description: joi_1.default.string().optional().allow('').max(1000),
    listId: joi_1.default.string().required(),
    position: joi_1.default.number().integer().min(0).optional(),
    dueDate: joi_1.default.date().optional().allow(null),
    coverImage: joi_1.default.string().uri().optional().allow(null)
});
exports.updateCardSchema = joi_1.default.object({
    title: joi_1.default.string().optional().min(1).max(255),
    description: joi_1.default.string().optional().allow('').max(1000),
    dueDate: joi_1.default.date().optional().allow(null),
    coverImage: joi_1.default.alternatives().try(joi_1.default.string().uri(), // Full URIs like https://...
    joi_1.default.string().pattern(/^\/uploads\//) // Relative URLs like /uploads/covers/...
    ).optional().allow(null),
    completed: joi_1.default.boolean().optional(),
    listId: joi_1.default.string().optional(),
    position: joi_1.default.number().integer().min(0).optional()
}).min(1); // At least one field must be provided
exports.moveCardSchema = joi_1.default.object({
    listId: joi_1.default.string().required(),
    position: joi_1.default.number().integer().min(0).required()
});
