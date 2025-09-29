// src/routes/platform-routes.ts
import { Router } from "express";
import PlatformController from "../controllers/platform-controller"; // ✅ correct file & default export
import { Platform } from "../models/platform-model";

const PlatformRouter = Router();

PlatformRouter.post("/create", PlatformController.createPlatform);
//update 
PlatformRouter.put("/update/:id", PlatformController.updatePlatform);
//delete
PlatformRouter.delete("/delete/:id", PlatformController.deletePlatform);
//get All 
PlatformRouter.get("/all", PlatformController.getAllPlatforms);

export default PlatformRouter;
