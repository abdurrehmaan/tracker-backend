import { pool } from "../config/db"; // ✅ your DB connection pool

export class TripModel {
  // check drrver table if driver exists by driver name  get information of driver if driver to the driver table
  static async findDriverByName(driverName: string): Promise<any> {
    const { rows } = await pool.query(
      `SELECT * FROM drivers WHERE driver_name = $1;`,
      [driverName]
    );
    return rows[0];
  }

  static async createDriver(input: {
    driver_name: string;
    driver_contact_number: string;
  }): Promise<any> {
    const { driver_name, driver_contact_number } = input;
    const { rows } = await pool.query(
      `INSERT INTO drivers (driver_name, driver_contact_number)
        VALUES ($1, $2)
        RETURNING *;`,
      [driver_name, driver_contact_number]
    );
    return rows[0];
  }

  //check vehicle table if vehicle exists by vehicle number get information of vehicle if vehicle not exists add vehicle to the vehicle table
  static async findVehicleByNumber(vehicleNumber: string): Promise<any> {
    const { rows } = await pool.query(
      `SELECT * FROM vehicles WHERE vehicle_number = $1;`,
      [vehicleNumber]
    );
    return rows[0];
  }

    static async createVehicle(input: { vehicle_number: string; vehicle_type: string; vehicle_make: string; vehicle_model: string; vehicle_color: string; vehicle_year: number; vehicle_capacity: string; vehicle_owner: string; vehicle_owner_contact: string; vehicle_registration_date: Date; vehicle_insurance_expiry: Date; vehicle_last_service_date: Date; vehicle_next_service_date: Date; vehicle_status: string; }): Promise<any> {
    const { vehicle_number, vehicle_type, vehicle_make, vehicle_model, vehicle_color, vehicle_year, vehicle_capacity, vehicle_owner, vehicle_owner_contact, vehicle_registration_date, vehicle_insurance_expiry, vehicle_last_service_date, vehicle_next_service_date, vehicle_status } = input;
    const { rows } = await pool.query(
        `INSERT INTO vehicles (vehicle_number, vehicle_type, vehicle_make, vehicle_model, vehicle_color, vehicle_year, vehicle_capacity, vehicle_owner, vehicle_owner_contact, vehicle_registration_date, vehicle_insurance_expiry, vehicle_last_service_date, vehicle_next_service_date, vehicle_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;`,
        [vehicle_number, vehicle_type, vehicle_make, vehicle_model, vehicle_color, vehicle_year, vehicle_capacity, vehicle_owner, vehicle_owner_contact, vehicle_registration_date, vehicle_insurance_expiry, vehicle_last_service_date, vehicle_next_service_date, vehicle_status]
    );
    return rows[0];
  }
}

export default TripModel;
