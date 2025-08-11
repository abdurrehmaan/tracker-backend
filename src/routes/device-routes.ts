import DevicesController from "../controllers/device-controller";

const express = require("express");
const DeviceRouter = express.Router();

DeviceRouter.post("/add-device", DevicesController.addDevice);

DeviceRouter.get("/get-devices", DevicesController.getAllDevices);
DeviceRouter.get("/search-devices", DevicesController.searchDevices);
DeviceRouter.put("/edit-device/:id", DevicesController.UpdateDevice);
DeviceRouter.delete("/delete-device/:id", DevicesController.deleteDeviceById);
DeviceRouter.get("/get-all-pmd-devices", DevicesController.getAllPMDDevices);
DeviceRouter.get("/get-all-csd-devices", DevicesController.getAllCSDDevices);
// DeviceRouter.get("/logout", DeviceController.logoutUser);
// DeviceRouter.get("/profile", DeviceController.getUserProfile);


export default DeviceRouter;
