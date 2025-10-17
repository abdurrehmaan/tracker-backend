import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";

// Import routes
import UserRouter from "./routes/user-routes";
import AuthRouter from "./routes/auth-routes";
import DeviceRouter from "./routes/device-routes";
import TrackerRouter from "./routes/tracker-module-routes";
import PlatformRouter from "./routes/platform-routes";
import TRMRouters from "./routes/trm-routes";
import TripRoutes from "./routes/trip-routes";

dotenv.config();

const app = express();

// CORS configuration - MUST be before routes
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Add if using Vite
  'https://device-tracker-dashboard-eight.vercel.app',
  'https://tracker-backend-drab.vercel.app' // Fixed: removed the path
];

// Add environment variable if it exists
if (process.env.CMS_FRONTEND_URL) {
  allowedOrigins.push(process.env.CMS_FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // For debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/devices", DeviceRouter);
app.use("/api/tracker", TrackerRouter);
app.use("/api/platform", PlatformRouter);
app.use("/api/psw", TRMRouters);
app.use("/api/trip", TripRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});