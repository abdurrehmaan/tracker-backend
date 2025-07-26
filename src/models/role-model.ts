

import pool  from '../config/db'; // Adjust the path as needed to where your pool is exported

class Role {
  // Get all roles
  static async getAll() {
    const query = "SELECT * FROM public.roles ORDER BY name ASC";

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

  // Get role by ID
  static async getById(roleId: number) {
    const query = "SELECT * FROM public.roles WHERE id = $1";

    try {
      const result = await pool.pool.query(query, [roleId]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }
}

export default Role;
