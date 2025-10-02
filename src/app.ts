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
app.use(express.json());

//ServerError handling
const allowedOrigins = [
  'http://localhost:3000',
  'https://device-tracker-dashboard-eight.vercel.app'
];

// Add environment variable if it exists
if (process.env.CMS_FRONTEND_URL) {
  allowedOrigins.push(process.env.CMS_FRONTEND_URL);
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
    message: "Something went wrong",
  });
});

// Error handling middleware (must be last)
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
