// src/routes/platform-routes.ts
import { Router } from "express"; // ✅ correct file & default export
import TRMController from "../controllers/trm-controller"; // ✅ correct file & default export

const TRMRouters = Router();

// TRMRouters.post("/psw", TRMController.getTRMData);
TRMRouters.get("/trm-dataset", TRMController.getTRMData);
TRMRouters.get("/trm-alldataset", TRMController.getTRMData);
TRMRouters.get("/trm-all", TRMController.AllSortedTRMData);

TRMRouters.get("/ping", (req, res) => res.json({ ok: true }));

//update

export default TRMRouters;
