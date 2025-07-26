const express = require("express");
const UserController = require("../controllers/user-controller");

const UserRouter = express.Router();

UserRouter.get("/users", UserController.getAllUsers);
UserRouter.get("/users/:id", UserController.getUserById);
UserRouter.post("/users", UserController.createUser);
UserRouter.get("/roles", UserController.getAllRoles);

export default UserRouter;
