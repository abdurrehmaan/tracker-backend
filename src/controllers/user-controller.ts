import { Request, Response, NextFunction } from 'express';
import User from '../models/user-model';
import Role from '../models/role-model';

class UserController {
  // GET all users with roles
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Fetching all users with roles...");
      const users = await User.getAllWithRoles();
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        count: users.length
      });
    } catch (error) {
      next(error);
    }
  }
  // GET user by ID with role
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await User.getByIdWithRole(id);
      
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
    } catch (error) {
      next(error);
    }
  }
  // POST create new user
  static async createUser(req: Request, res: Response, next: NextFunction) {
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
      const role = await Role.getById(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID'
        });
      }

      const newUser = await User.create({ name, email, password_hash, role_id });
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }
  // GET all roles (helper endpoint)
  static async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await Role.getAll();
      
      res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles,
        count: roles.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
