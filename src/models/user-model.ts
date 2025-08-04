import pool from "../config/db"; // Adjust the path as needed to where your pool is exported

interface UserData {
  name: string;
  email: string;
  password_hash: string;
  role_id: number;
}

export class User {
  // Get all users with their roles
  static async getAllWithRoles() {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        u.updated_at,
        r.id as role_id,
        r.name as role_name
      FROM public.users u
      LEFT JOIN public.roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;

    try {
      const result = await pool.pool.query(query);
      return result.rows;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // Get user by ID with role
  static async getByIdWithRole(userId: string) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        u.updated_at,
        r.id as role_id,
        r.name as role_name
      FROM public.users u
      LEFT JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;

    try {
      const result = await pool.pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database query failed: ${error}`);
    }
  }

  // Create new user

  static async create(userData: UserData) {
    const { name, email, password_hash, role_id } = userData;
    const query = `
      INSERT INTO public.users (name, email, password_hash, role_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, email, role_id, created_at
    `;

    try {
      const result = await pool.pool.query(query, [
        name,
        email,
        password_hash,
        role_id,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  static async getByEmail(email: string) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.created_at,
        u.updated_at,
        r.id as role_id,
        r.name as role_name
      FROM public.users u
      LEFT JOIN public.roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;

    try {
      const result = await pool.pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database query failed: ${error}`);
    }
  }

  static async getById(userId: string) {
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        created_at, 
        updated_at, 
        role_id
      FROM public.users
      WHERE id = $1
    `;

    try {
      const result = await pool.pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database query failed: ${error}`);
    }
  }

  static async getByUsername(name: string) {
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        created_at, 
        updated_at, 
        role_id
      FROM public.users
      WHERE name = $1
    `;

    try {
      const result = await pool.pool.query(query, [name]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database query failed: ${error}`);
    }
  }
}

export default User;
