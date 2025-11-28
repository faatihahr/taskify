import { Router } from "express";
import multer from "multer";
import path from "path";
import { createBoard, getUserBoards, getBoardById, updateBoard, deleteBoard } from "../controllers/board";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import { createBoardSchema, updateBoardSchema } from "../validation/board_joi";

const router = Router();

// Configure multer for board background uploads
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// All board routes require authentication
router.use(authenticate);

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
router.get("/", getUserBoards);

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
router.post("/", upload.single('backgroundImage'), validate(createBoardSchema), createBoard);

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
router.get("/:id", getBoardById);

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
router.put("/:id", upload.single('backgroundImage'), validate(updateBoardSchema), updateBoard);

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
router.delete("/:id", deleteBoard);

export default router;
