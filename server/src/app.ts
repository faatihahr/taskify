import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import corsMiddleware from './middlewares/cors';
import { errorHandler } from './middlewares/error';
import { swaggerUi, swaggerSpec } from "./swagger/swagger";
// import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Serve static files from uploads
// const uploadsPath = path.join(__dirname, "..", "uploads");

// console.log("SERVING UPLOADS FROM:", uploadsPath);

// app.use("/uploads", express.static(uploadsPath));

// Routes
app.use('/api', authRoutes, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
