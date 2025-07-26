import pool from "../config/db"; // Adjust the path as needed to where your pool is exported

class DeviceModel {
  // Get all roles
  static async createDeviceInfo(
    imei: string,
    iradium_imei: string,
    device_id: string,
    user_id: string,
    tracker_model: string,
    device_type: string
  ): Promise<any> {
    // table : public.device_inventory
    // fields : imei , iradium_imei, device_id , user_id, device_type
    //   create add table to inventory
    const query = `insert into public.device_inventory (imei, iradium_imei, device_id, user_id,tracker_model, device_type) values ($1, $2, $3, $4, $5, $6) returning *`;

    try {
      const result = await pool.pool.query(query, [
        imei,
        iradium_imei,
        device_id,
        user_id,
        tracker_model,
        device_type,
      ]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // Get all roles
  static async getAllDevices(): Promise<any[]> {
    // table : public.device_inventory
    // fields : imei , iradium_imie, device_id , user_id, device
    const query =
      "SELECT * FROM public.device_inventory ORDER BY created_at DESC";
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

  // getByIridiumImei
  static async getByIridiumImei(imei: string): Promise<any> {
    // table : public.device_inventory
    // fields : imei , iradium_imie, device_id , user_id, device
    const query =
      "SELECT * FROM public.device_inventory WHERE iradium_imei = $1";
    try {
      const result = await pool.pool.query(query, [imei]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // getByImei
  static async getByImei(imei: string): Promise<any> {
    const query = "SELECT * FROM public.device_inventory WHERE imei = $1";
    try {
      const result = await pool.pool.query(query, [imei]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // getByDeviceId
  static async getByDeviceId(device_id: string): Promise<any> {
    const query = "SELECT * FROM public.device_inventory WHERE device_id = $1";
    try {
      const result = await pool.pool.query(query, [device_id]);
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

export default DeviceModel;
