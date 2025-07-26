import { Request, Response, NextFunction } from "express";
import User from "../models/user-model";
import Role from "../models/role-model";
import { fakeAuth } from "../middlewares/auth-middleware";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Middleware to authenticate user
class AuthController { 
    static async loginUser(req: Request, res: Response, next: NextFunction) { 
        try {
            const { email, password } = req.body;
            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }
            // Find user by email
          
            const user = await User.getByEmail(email);
            console.log("User found:", user);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            // Check password
            if (!user.password_hash) {
                return res.status(500).json({
                    success: false,
                    message: "User password hash is missing in the database"
                });
            }
            const isMatch = await bcrypt.compare(password, user.password_hash);


            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }
            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

            res.status(200).json({
                success: true,
                message: "Login successful",
                token
            });
        } catch (error) {
            next(error);
        }

    }

    static async registerUser(req: Request, res: Response, next: NextFunction) { 
        try {
            const { username, email, password, role_id } = req.body;
            // Validate input
            if (!username || !email || !password || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            // Check for unique username
            const existingUserByUsername = await User.getByUsername?.(username);
            if (existingUserByUsername) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists"
                });
            }

            // Check for unique email
            const existingUserByEmail = await User.getByEmail?.(email);
            if (existingUserByEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            // Check if role exists
            const role = await Role.getById(role_id);
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID"
                });
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create user
            const newUser = await User.create({ username, email, password_hash: hashedPassword, role_id });

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserProfile(req: Request, res: Response, next: NextFunction) { 
        try {
            const userId = req.user.id;
        
            const user = await User.getById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    static async logoutUser(req: Request, res: Response, next: NextFunction) { 
        try {
            // Invalidate token logic can be implemented here
            res.status(200).json({
                success: true,
                message: "Logout successful"
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;