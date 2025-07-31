import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";

// Import routes
import UserRouter from "./routes/user-routes";
import AuthRouter from "./routes/auth-routes";
import DeviceRouter from "./routes/device-routes";
import TrackerRouter from "./routes/tracker-module-routes";

dotenv.config();

const app = express();
app.use(express.json());

//ServerError handling
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

  

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/api", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/devices", DeviceRouter);
app.use("/api/tracker", TrackerRouter);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
