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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("../prisma/client");
const jwt_1 = require("../utils/jwt");
function withTimeout(p, ms, message = 'Operation timed out') {
    let timeout;
    const t = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([p, t]);
}
// REGISTER (kept simple)
const registerUser = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email.match(/@/) || password.length < 6) {
        throw new Error('Invalid email or password');
    }
    const existingUser = yield withTimeout(client_1.prisma.user.findUnique({ where: { email } }), Number(process.env.DB_QUERY_TIMEOUT || 5000), 'DB lookup timed out');
    if (existingUser)
        throw new Error('Email already registered');
    const hashed = yield bcryptjs_1.default.hash(password, 10);
    const user = yield withTimeout(client_1.prisma.user.create({ data: { name, email, password: hashed } }), Number(process.env.DB_QUERY_TIMEOUT || 5000), 'DB create timed out');
    const payload = { id: user.id };
    const token = (0, jwt_1.signToken)(payload);
    return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        token,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
});
exports.registerUser = registerUser;
// LOGIN - simplified with timeout + logs
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('loginUser: start for', email);
        if (!process.env.DATABASE_URL) {
            console.warn('loginUser: DATABASE_URL not set');
        }
        try {
            const user = yield withTimeout(client_1.prisma.user.findUnique({ where: { email } }), Number(process.env.DB_QUERY_TIMEOUT || 5000), 'DB lookup timed out');
            console.log('loginUser: user lookup done for', email);
            if (!user)
                throw new Error('User not found');
            if (!user.password)
                throw new Error('Password not set for this user');
            const isMatch = yield withTimeout(bcryptjs_1.default.compare(password, user.password), 3000, 'bcrypt timed out');
            if (!isMatch)
                throw new Error('Incorrect password');
            const payload = { id: user.id };
            const token = (0, jwt_1.signToken)(payload);
            return {
                user_id: user.id,
                name: user.name,
                email: user.email,
                token,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        }
        catch (err) {
            console.error('loginUser: error for', email, err instanceof Error ? err.message : err);
            throw err;
        }
    });
}
