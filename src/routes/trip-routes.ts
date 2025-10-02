// src/routes/trip-routes.ts
import { Router } from "express";
import TripController from "../controllers/trip-controller";

const TripRoutes = Router();

// Route to validate and create driver/carrier
TripRoutes.post("/process-carrier-driver", TripController.processCarrierAndDriver);
// Route to validate and create vehicle/carrier
TripRoutes.post("/process-carrier-vehicle", TripController.processCarrierAndVehicle);
// Route to check vehicle in PMD devices
TripRoutes.post("/check-vehicle-pmd", TripController.checkVehicleInPmdDevices);

TripRoutes.get("/ping", (req, res) => res.json({ ok: true }));

export default TripRoutes;
