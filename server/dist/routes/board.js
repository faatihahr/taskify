"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const board_1 = require("../controllers/board");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../middlewares/validation");
const board_joi_1 = require("../validation/board_joi");
const router = (0, express_1.Router)();
// Configure multer for board background uploads
const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
// All board routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Get user boards
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Boards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 boards:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/", board_1.getUserBoards);
/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create new board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Board created successfully
 */
router.post("/", upload.single('backgroundImage'), (0, validation_1.validate)(board_joi_1.createBoardSchema), board_1.createBoard);
/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Get board by ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 */
router.get("/:id", board_1.getBoardById);
/**
 * @swagger
 * /api/boards/{id}:
 *   put:
 *     summary: Update board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Board updated successfully
 */
router.put("/:id", upload.single('backgroundImage'), (0, validation_1.validate)(board_joi_1.updateBoardSchema), board_1.updateBoard);
/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     summary: Delete board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 */
router.delete("/:id", board_1.deleteBoard);
exports.default = router;
