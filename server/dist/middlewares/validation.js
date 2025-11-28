"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            const err = new Error(`Validation error: ${errors.join(', ')}`);
            err.status = 400;
            return next(err);
        }
        next();
    };
};
exports.validate = validate;
