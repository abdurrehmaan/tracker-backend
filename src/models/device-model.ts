import pool from "../config/db"; // Keep the same import

class DeviceModel {
  static async createDeviceInfo(
    imei: string,
    iradium_imei: string,
    device_id: string,
    user_id: string,
    device_type: string,
    tracker_model: string,
    purchase_date: string = new Date().toISOString().split("T")[0],
    device_code: string
  ): Promise<any> {
    const query = `INSERT INTO public.device_inventory 
      (imei, iradium_imei, device_id, user_id, tracker_model, device_type, purchase_date, device_code) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;

    try {
      const result = await pool.pool.query(query, [
        imei,
        iradium_imei,
        device_id,
        user_id,
        tracker_model,
        device_type,
        purchase_date,
        device_code,
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

  // Count total devices for pagination
  static async countDevices(): Promise<number> {
    const query = "SELECT COUNT(*) FROM public.device_inventory";
    try {
      const result = await pool.pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // Get paginated devices with joins (limit & offset)
  static async getDevicesWithPagination(
    limit: number,
    offset: number
  ): Promise<any[]> {
    const query = `
     SELECT 
    di.id AS device_inventory_id,
    di.imei,
    di.iradium_imei,
    di.device_id,
    di.device_type,
    di.device_code,
    di.created_at AS device_created_at,
    di.updated_at AS device_updated_at,
    u.name,
    u.email,
    u.role_id,
    u.created_at AS user_created_at,
    tmd.tracker_name,
    tmd.created_at AS tracker_created_at
FROM public.device_inventory di
LEFT JOIN public.users u ON di.user_id = u.id
LEFT JOIN public.tracker_model_details tmd ON di.tracker_model = tmd.id
ORDER BY di.created_at DESC
LIMIT $1 OFFSET $2
    `;

    try {
      const result = await pool.pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  static async getAllDevices(): Promise<any[]> {
    // You can keep this or remove if you exclusively use pagination methods
    const query = `SELECT 
        di.id AS device_inventory_id,
        di.imei,
        di.iradium_imei,
        di.device_id,
        di.device_type,
        di.created_at AS device_created_at,
        di.updated_at AS device_updated_at,
        u.username,
        u.email,
        u.role_id,
        u.created_at AS user_created_at,
        tmd.tracker_name,
        tmd.created_at AS tracker_created_at
      FROM public.device_inventory di
      LEFT JOIN public.users u ON di.user_id = u.id
      LEFT JOIN public.tracker_model_details tmd ON di.tracker_model = tmd.id
      ORDER BY di.id DESC
      LIMIT 100`;

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

  static async getByIridiumImei(imei: string): Promise<any> {
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

  // update  device info
  static async updateDeviceInfo(device_id: string, data: any): Promise<any> {
    const query = "UPDATE public.device_inventory SET $1 WHERE device_id = $2";
    try {
      const result = await pool.pool.query(query, [data, device_id]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database query failed: ${error.message}`);
      } else {
        throw new Error("Database query failed: Unknown error");
      }
    }
  }

  // delete device by device_id
  static async deleteDeviceById(device_id: string): Promise<void> {
    const query = "DELETE FROM public.device_inventory WHERE device_id = $1";
    try {
      await pool.pool.query(query, [device_id]);
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
