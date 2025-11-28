"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, postman, etc.)
        if (!origin)
            return callback(null, true);
        // Allow specific origins
        const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // For development, allow all origins
        callback(null, true);
    },
    credentials: true,
});
exports.default = corsMiddleware;
