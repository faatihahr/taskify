"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRegister = handleRegister;
exports.handleLogin = handleLogin;
exports.handleLogout = handleLogout;
const auth_1 = require("../service/auth");
const auth_joi_1 = require("../validation/auth_joi");
function handleRegister(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure request body is parsed
        if (!req.body || Object.keys(req.body).length === 0) {
            const err = new Error("Request body is required. Make sure to send JSON data with Content-Type: application/json");
            err.status = 400;
            throw err;
        }
        const { error } = auth_joi_1.registerSchema.validate(req.body);
        if (error) {
            const validationError = new Error(error.message);
            validationError.status = 400;
            throw validationError;
        }
        const { name, email, password } = req.body;
        const result = yield (0, auth_1.registerUser)(name, email, password);
        res.status(201).json({ message: "User Registered", user: result });
    });
}
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure request body is parsed
        if (!req.body || Object.keys(req.body).length === 0) {
            const err = new Error("Request body is required. Make sure to send JSON data with Content-Type: application/json");
            err.status = 400;
            throw err;
        }
        const { error } = auth_joi_1.loginSchema.validate(req.body);
        if (error) {
            const validationError = new Error(error.message);
            validationError.status = 400;
            throw validationError;
        }
        const { email, password } = req.body;
        // Dev stub: if USE_STUB_LOGIN=true in env, return a fake user quickly
        if (process.env.USE_STUB_LOGIN === 'true') {
            console.log('handleLogin: using dev stub for', email);
            return res.json({
                message: 'Login success',
                user_id: 'stub-user-id',
                name: 'Developer',
                email,
                token: 'stub-token',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        try {
            const result = yield (0, auth_1.loginUser)(email, password);
            res.json(Object.assign({ message: "Login success" }, result));
        }
        catch (err) {
            console.error('handleLogin: error', err instanceof Error ? err.message : err);
            // If DB or other error and stub allowed, fallback to stub
            if (process.env.USE_STUB_LOGIN === 'true') {
                console.log('handleLogin: falling back to dev stub after error for', email);
                return res.json({
                    message: 'Login success',
                    user_id: 'stub-user-id',
                    name: 'Developer',
                    email,
                    token: 'stub-token',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            res.status(401).json({ message: err.message || 'Login failed' });
        }
    });
}
function handleLogout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json({ message: "Logout success" });
    });
}
