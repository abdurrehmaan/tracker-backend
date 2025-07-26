const express = require("express");
const AuthController = require("../controllers/auth-controller");
const AuthRouter = express.Router();

AuthRouter.post("/login", AuthController.loginUser);
AuthRouter.post("/register", AuthController.registerUser);
// AuthRouter.get("/logout", AuthController.logoutUser);
// AuthRouter.get("/profile", AuthController.getUserProfile);


export default AuthRouter;
