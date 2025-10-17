// src/routes/trip-routes.ts
import { Router } from "express";
import TripController from "../controllers/trip-controller";

const TripRoutes = Router();

// Route to create a new trip
TripRoutes.post("/create-trip", TripController.createTrip);
// Route to validate and create driver/carrier
TripRoutes.post("/process-carrier-driver", TripController.processCarrierAndDriver);
// Route to validate and create vehicle/carrier
TripRoutes.post("/process-carrier-vehicle", TripController.processCarrierAndVehicle);
// Route to check/create route
TripRoutes.post("/process-route", TripController.processRoute);
// Route to check vehicle in PMD devices
TripRoutes.post("/check-vehicle-pmd", TripController.checkVehicleInPmdDevices);
// Route to get all PMD devices
TripRoutes.get("/get-all-pmd-devices", TripController.getAllPmdDevices);
// Route to get all CSD devices
TripRoutes.get("/get-all-csd-devices", TripController.getAllCsdDevices);
// Route to get all eSeal devices
TripRoutes.get("/get-all-eseal-devices", TripController.getAllEsealDevices);
// Route to search PMD devices by IMEI
TripRoutes.get("/pmd/search", TripController.searchPmdDevices);
// Route to search CSD devices by IMEI
TripRoutes.get("/csd/search", TripController.searchCsdDevices);
// Route to search eSeal devices
TripRoutes.get("/eseal/search", TripController.searchEsealDevices);
// Configured Pmd devices
TripRoutes.get("/pmd/configured", TripController.getConfiguredPMDDevices);
//configured Csd devices
TripRoutes.get("/csd/configured", TripController.getConfiguredCSDDevices);
// configured pmd search
TripRoutes.get("/pmd/configured/search", TripController.searchConfiguredPMDDevices);
// configured pmd search by path param (e.g. /pmd/configured/search/11223344)
TripRoutes.get("/pmd/configured/search/:imei", TripController.searchConfiguredPMDDevices);
// configured csd search
TripRoutes.get("/csd/configured/search", TripController.searchConfiguredCSDDevices);
// configured csd search by path param
TripRoutes.get("/csd/configured/search/:imei", TripController.searchConfiguredCSDDevices);
//findvehicle which exist in pmd_devices by vehicle_id
TripRoutes.get("/vehicle/:vehicle_id", TripController.findVehicleInPmdDevices);
//findContainer which exist in csd_devices by container_id
TripRoutes.get("/container/:container_id", TripController.findContainerInCSDDevices);
//progress container by plate_number
TripRoutes.post("/progress-container/", TripController.progressContainer);

// Debug endpoint - temporary

TripRoutes.get("/ping", (req, res) => res.json({ ok: true }));

export default TripRoutes;
