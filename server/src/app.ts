import express from 'express';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Auth routes - using real auth service
import { loginUser, registerUser } from './service/auth';

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register attempt:', email);
    
    const result = await registerUser(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Import and use board routes
import boardRoutes from './routes/board';
app.use('/api/boards', boardRoutes);

// Import and use list routes
import listRoutes from './routes/list';
app.use('/api', listRoutes);

// Import and use card routes
import cardRoutes from './routes/card';
app.use('/api/cards', cardRoutes);

// Import and use invitation routes
import invitationRoutes from './routes/invitation';
app.use('/api/invitation', invitationRoutes);

// Import and use notification routes
import notificationRoutes from './routes/notification';
app.use('/api/notifications', notificationRoutes);

// Import and setup Swagger
import { swaggerUi, swaggerSpec } from './swagger/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Test endpoint: http://localhost:3000/test');
  console.log('Login endpoint: http://localhost:3000/api/auth/login');
  console.log('Swagger Documentation: http://localhost:3000/api-docs');
});

export default app;