import { Request, Response, NextFunction } from "express";
import User from "../models/user-model";
import Role from "../models/role-model";
import { fakeAuth } from "../middlewares/auth-middleware";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import DeviceModel from "../models/device-model";
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
class DevicesController {
  



  static async addDevice(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Adding new device...");
      const { imei, iradium_imei, device_id, user_id, tracker_model, device_type } = req.body;

      console.log('request body', req.body)

      // Validate required fields
      if (!imei || !iradium_imei || !device_id || !user_id || !tracker_model || !device_type) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }

      // Check uniqueness for imei
      const existingByImei = await DeviceModel.getByImei?.(imei);
      if (existingByImei) {
        return res.status(409).json({
          success: false,
          message: "Device with this IMEI already exists"
        });
      }

      // Check uniqueness for iradium_imei
      const existingByIridium = await DeviceModel.getByIridiumImei?.(iradium_imei);
      if (existingByIridium) {
        return res.status(409).json({
          success: false,
          message: "Device with this Iridium IMEI already exists"
        });
      }

      // Check uniqueness for device_id
      const existingByDeviceId = await DeviceModel.getByDeviceId?.(device_id);
      if (existingByDeviceId) {
        return res.status(409).json({
          success: false,
          message: "Device with this Device ID already exists"
        });
      }

    

      const device = await DeviceModel.createDeviceInfo(imei, iradium_imei, device_id, user_id, tracker_model, device_type);
      res.status(201).json({
        success: true,
        message: "Device added successfully",
        data: device
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Fetching all devices...");
      const devices = await DeviceModel.getAllDevices();

      res.status(200).json({
        success: true,
        message: "Devices retrieved successfully",
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }
}

// module.exports = DevicesController;
export default DevicesController;


