import pool from "../config/db"; // Adjust the path as needed to where your pool is exported

interface TrackerData {
  tracker_name: string;
}

// table : tracker_model_details

export class Tracker {
  // Get all users with their roles
  static async getAllTrackers(): Promise<any[]> {
    const query = `
        SELECT 
            id, 
            tracker_name, 
            created_at, 
            updated_at
        FROM public.tracker_model_details
        ORDER BY created_at DESC
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
}

export default Tracker;
