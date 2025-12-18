"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveListSchema = exports.updateListSchema = exports.createListSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createListSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(1).max(255),
    position: joi_1.default.number().integer().min(0).optional()
});
exports.updateListSchema = joi_1.default.object({
    title: joi_1.default.string().optional().min(1).max(255),
    position: joi_1.default.number().integer().min(0).optional()
}).min(1); // At least one field must be provided
exports.moveListSchema = joi_1.default.object({
    position: joi_1.default.number().integer().min(0).required()
});
