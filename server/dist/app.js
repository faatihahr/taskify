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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Basic middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});
// Auth routes - using real auth service
const auth_1 = require("./service/auth");
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);
        const result = yield (0, auth_1.loginUser)(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
}));
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        console.log('Register attempt:', email);
        const result = yield (0, auth_1.registerUser)(name, email, password);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Import and use board routes
const board_1 = __importDefault(require("./routes/board"));
app.use('/api/boards', board_1.default);
// Import and use list routes
const list_1 = __importDefault(require("./routes/list"));
app.use('/api', list_1.default);
// Import and use card routes
const card_1 = __importDefault(require("./routes/card"));
app.use('/api/cards', card_1.default);
// Import and setup Swagger
const swagger_1 = require("./swagger/swagger");
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
// Serve static files
const uploadsPath = path_1.default.join(__dirname, "..", "uploads");
app.use("/uploads", express_1.default.static(uploadsPath));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Test endpoint: http://localhost:3000/test');
    console.log('Login endpoint: http://localhost:3000/api/auth/login');
    console.log('Swagger Documentation: http://localhost:3000/api-docs');
});
exports.default = app;
