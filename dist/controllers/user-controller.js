"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user-model"));
const role_model_1 = __importDefault(require("../models/role-model"));
class UserController {
    // GET all users with roles
    static async getAllUsers(req, res, next) {
        try {
            console.log("Fetching all users with roles...");
            const users = await user_model_1.default.getAllWithRoles();
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: users,
                count: users.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET user by ID with role
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_model_1.default.getByIdWithRole(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST create new user
    static async createUser(req, res, next) {
        try {
            const { name, email, password_hash, role_id } = req.body;
            // Validation
            if (!name || !email || !password_hash || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }
            // Check if role exists
            const role = await role_model_1.default.getById(role_id);
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role ID'
                });
            }
            const newUser = await user_model_1.default.create({ name, email, password_hash, role_id });
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: newUser
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET all roles (helper endpoint)
    static async getAllRoles(req, res, next) {
        try {
            const roles = await role_model_1.default.getAll();
            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: roles,
                count: roles.length
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = UserController;
