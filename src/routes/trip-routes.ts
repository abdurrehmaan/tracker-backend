// src/routes/trip-routes.ts
import { Router } from "express";
import TripController from "../controllers/trip-controller";

const TripRoutes = Router();

// Route to validate and create driver/carrier
TripRoutes.post("/process-carrier-driver", TripController.processCarrierAndDriver);
TripRoutes.get("/validate-driver", TripController.driverexitandcreate);

TripRoutes.get("/ping", (req, res) => res.json({ ok: true }));

export default TripRoutes;
