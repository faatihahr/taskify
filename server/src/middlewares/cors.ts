import cors from 'cors';

const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, postman, etc.)
        if (!origin) return callback(null, true);

        // Allow specific origins
        const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // For development, allow all origins
        callback(null, true);
    },
    credentials: true,
});

export default corsMiddleware;
