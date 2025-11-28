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
// REGISTER
const registerUser = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Validasi sederhana
    if (!email.match(/@/) || password.length < 6) {
        throw new Error("Invalid email or password");
    }
    // Cek apakah email sudah ada
    const existingUser = yield client_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    // Hash password
    const hashed = yield bcryptjs_1.default.hash(password, 10);
    // Buat user baru
    const user = yield client_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
        },
    });
    // Buat JWT token
    const payload = {
        id: user.id,
    };
    const token = (0, jwt_1.signToken)(payload);
    return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        token,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
});
exports.registerUser = registerUser;
// LOGIN
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield client_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User not found");
        if (!user.password)
            throw new Error("Password not set for this user");
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            throw new Error("Incorrect password");
        const payload = { id: user.id };
        const token = (0, jwt_1.signToken)(payload);
        return {
            user_id: user.id,
            name: user.name,
            email: user.email,
            token,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    });
}
