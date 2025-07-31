import { Request, Response, NextFunction } from "express";
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
      const {
        imei,
        iradium_imei,
        device_id,
        user_id,
        tracker_model,
        device_type,
        purchase_date,
        device_code,
      } = req.body;

      if (device_type === "pmd") {
        if (
          !imei ||
          !device_id ||
          !user_id ||
          !tracker_model ||
          !device_type ||
          !purchase_date ||
          !device_code
        ) {
          return res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }
      } else {
        if (
          !imei ||
          !iradium_imei ||
          !device_id ||
          !user_id ||
          !tracker_model ||
          !device_type ||
          !purchase_date ||
          !device_code
        ) {
          return res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }
      }

      if (device_type === "pmd") {
        if (!device_code.match(/^PMD-\d{4}$/)) {
          return res.status(400).json({
            success: false,
            message: "Invalid device code format. It should be like PMD-0001",
          });
        }
      } else if (!device_code.match(/^CSD-\d{4}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid device code format. It should be like CSD-0001",
        });
      }

      const isValidUUID = (id: string) =>
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
          id
        );

      if (!isValidUUID(user_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user_id (must be a valid UUID)",
        });
      }

      if (!isValidUUID(tracker_model)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tracker_model (must be a valid UUID)",
        });
      }

      // Check uniqueness for imei
      const existingByImei = await DeviceModel.getByImei?.(imei);
      if (existingByImei) {
        return res.status(409).json({
          success: false,
          message: "Device with this IMEI already exists",
        });
      }

      // Check uniqueness for iradium_imei
      if (iradium_imei) {
        const existingByIridium = await DeviceModel.getByIridiumImei?.(
          iradium_imei
        );
        if (existingByIridium) {
          return res.status(409).json({
            success: false,
            message: "Device with this Iridium IMEI already exists",
          });
        }
      }

      const device = await DeviceModel.createDeviceInfo(
        imei,
        iradium_imei,
        device_id,
        user_id,
        device_type, 
        tracker_model, 
        purchase_date,
        device_code
      );
      res.status(201).json({
        success: true,
        message: "Device added successfully",
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      // Read query params with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Fetch total count of devices (for pagination metadata)
      const totalDevices = await DeviceModel.countDevices();

      // Fetch devices for the current page
      const devices = await DeviceModel.getDevicesWithPagination(limit, offset);

      // Calculate total pages
      const totalPages = Math.ceil(totalDevices / limit);

      res.status(200).json({
        success: true,
        message: "Devices retrieved successfully",
        data: devices,
        pagination: {
          totalDevices,
          totalPages,
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// module.exports = DevicesController;
export default DevicesController;
