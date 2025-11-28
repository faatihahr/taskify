"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const error_1 = require("./middlewares/error");
const swagger_1 = require("./swagger/swagger");
// import path from "path";
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors_1.default);
// Serve static files from uploads
// const uploadsPath = path.join(__dirname, "..", "uploads");
// console.log("SERVING UPLOADS FROM:", uploadsPath);
// app.use("/uploads", express.static(uploadsPath));
// Routes
app.use('/api', auth_1.default, swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
// Error handling middleware
app.use(error_1.errorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;
