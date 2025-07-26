import TrackerModuleController from "../controllers/tracker-module-controller";

const express = require("express");
// const TrackerModuleController = require("../controllers/user-controller"



const TrackerRouter = express.Router();

TrackerRouter.get("/all-tracker", TrackerModuleController.GetAllTracker);

export default TrackerRouter;
