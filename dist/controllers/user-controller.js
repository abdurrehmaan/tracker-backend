"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const user_model_1 = require("../models/user-model"); // Adjust the import path as necessary
const getUsers = async (req, res) => {
    try {
        const users = await (0, user_model_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUsers = getUsers;
