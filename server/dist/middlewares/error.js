"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: err.errors
        });
    }
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    // Prisma error
    if (err.code) {
        // Handle specific Prisma error codes
        switch (err.code) {
            case 'P2002':
                return res.status(409).json({
                    message: 'Email already exists'
                });
            case 'P2025':
                return res.status(404).json({
                    message: 'Record not found'
                });
            default:
                console.error('Prisma Error Code:', err.code);
        }
    }
    // Default error response
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
}
