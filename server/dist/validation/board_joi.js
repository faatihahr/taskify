"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBoardSchema = exports.createBoardSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createBoardSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(1).max(255),
    description: joi_1.default.string().optional().max(1000),
    background: joi_1.default.string().optional().uri(),
    backgroundImage: joi_1.default.any().optional() // Allow file upload field
});
exports.updateBoardSchema = joi_1.default.object({
    title: joi_1.default.string().allow('').optional().min(0).max(255),
    description: joi_1.default.string().allow('').optional().max(1000),
    background: joi_1.default.string().allow('').optional().uri(),
    backgroundImage: joi_1.default.any().optional() // Allow file upload field
}).min(1); // At least one field must be provided
