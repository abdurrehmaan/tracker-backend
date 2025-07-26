import { Request, Response, NextFunction } from "express";
import User from "../models/user-model";
import Role from "../models/role-model";
import Tracker from "../models/tracker-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to authenticate user
class TrackerModuleController {
  static async GetAllTracker(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Fetching all trackers...");
      const trackers = await Tracker.getAllTrackers();

      res.status(200).json({
        success: true,
        message: "Trackers retrieved successfully",
        data: trackers,
        count: trackers.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TrackerModuleController;
