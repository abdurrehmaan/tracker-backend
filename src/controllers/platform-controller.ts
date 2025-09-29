// src/controllers/platform-controller.ts
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import Platform from "../models/platform-model";
dotenv.config();

class PlatformController {
  // POST /platforms/create
  async createPlatform(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code } = req.body;
      console.log("Creating platform:", { name, code });

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const existingByName = await Platform.getPlatformByName(name);
      if (existingByName) {
        return res.status(409).json({
          success: false,
          message: "Platform name already exists",
        });
      }


      const newPlatform = await Platform.createPlatform({ name, code });

      return res.status(201).json({
        success: true,
        message: "Platform created successfully",
        data: newPlatform,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPlatforms(req: Request, res: Response, next: NextFunction) {
    try {
      const platforms = await Platform.getAllPlatforms();
      return res.status(200).json({
        success: true,
        data: platforms,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlatformById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const platform = await Platform.getPlatformById(Number(id));
      if (!platform) {
        return res.status(404).json({
          success: false,
          message: "Platform not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: platform,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlatform(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, code } = req.body;

      console.log("Updating platform:", { id, name, code });

      const platform = await Platform.getPlatformById(Number(id));
      if (!platform) {
        return res.status(404).json({
          success: false,
          message: "Platform not found",
        });
      }

      const updatedPlatform = await Platform.updatePlatform(Number(id), {
        name,
        code,
      });

      return res.status(200).json({
        success: true,
        message: "Platform updated successfully",
        data: updatedPlatform,
      });
    } catch (error) {
      next(error);
    }
  }
  async deletePlatform(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const platform = await Platform.getPlatformById(Number(id));
      if (!platform) {
        return res.status(404).json({
          success: false,
          message: "Platform not found",
        });
      }

      await Platform.deletePlatform(Number(id));

      return res.status(200).json({
        success: true,
        message: "Platform deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }



}

export default new PlatformController(); // ✅ export an instance
