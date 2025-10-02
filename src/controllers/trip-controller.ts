import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import User from '../models/user-model';
import Role from '../models/role-model';

class TripController {
  static async driverexitandcreate(req: Request, res: Response, next: NextFunction) {
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

  // Function to check/create bonded carrier
  static async checkOrCreateCarrier(carrierName: string): Promise<number> {
    const client = await pool.connect();
    try {
      // Check if carrier exists by name
      const existingCarrier = await client.query(
        'SELECT id FROM carriers WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [carrierName]
      );

      if (existingCarrier.rows.length > 0) {
        console.log(`Carrier found: ${carrierName} with ID: ${existingCarrier.rows[0].id}`);
        return existingCarrier.rows[0].id;
      }

      // Generate a unique code for the carrier (you can modify this logic as needed)
      const carrierCode = carrierName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') // Remove special characters
        .substring(0, 10) + Date.now().toString().slice(-4); // Add timestamp suffix

      // Create new carrier if doesn't exist with required fields only
      const newCarrier = await client.query(
        `INSERT INTO carriers (name, code, contact_person, phone, email, address, city, region) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          carrierName, 
          carrierCode, 
          'N/A',           // contact_person
          'N/A',           // phone 
          'N/A',           // email
          'N/A',           // address
          'N/A',           // city
          'N/A'            // region
        ]
      );

      console.log(`Created new carrier: ${carrierName} with ID: ${newCarrier.rows[0].id} and code: ${carrierCode}`);
      return newCarrier.rows[0].id;
    } catch (error) {
      console.error('Error in checkOrCreateCarrier:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Function to check/create driver
  static async checkOrCreateDriver(driverName: string, driverPhone: string, carrierId: number): Promise<number> {
    const client = await pool.connect();
    try {
      // Check if driver exists by name and carrier_id
      const existingDriver = await client.query(
        'SELECT id FROM drivers WHERE LOWER(name) = LOWER($1) AND carrier_id = $2 LIMIT 1',
        [driverName, carrierId]
      );

      if (existingDriver.rows.length > 0) {
        console.log(`Driver found: ${driverName} with ID: ${existingDriver.rows[0].id}`);
        return existingDriver.rows[0].id;
      }

      // Create new driver if doesn't exist
      const newDriver = await client.query(
        'INSERT INTO drivers (name, phone, carrier_id, cnic_number) VALUES ($1, $2, $3, $4) RETURNING id',
        [driverName, driverPhone, carrierId, 'N/A']
      );

      console.log(`Created new driver: ${driverName} with ID: ${newDriver.rows[0].id}`);
      return newDriver.rows[0].id;
    } catch (error) {
      console.error('Error in checkOrCreateDriver:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Main function to handle carrier and driver creation
  static async processCarrierAndDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverName, driverPhone, bondedCarrierName } = req.body;

      // Validate required fields
      if (!driverName || !driverPhone || !bondedCarrierName) {
        return res.status(400).json({
          success: false,
          message: 'Driver name, driver phone, and bonded carrier name are required'
        });
      }

      // Step 1: Check/Create Bonded Carrier
      const carrierId = await TripController.checkOrCreateCarrier(bondedCarrierName);

      // Step 2: Check/Create Driver
      const driverId = await TripController.checkOrCreateDriver(driverName, driverPhone, carrierId);

      res.status(200).json({
        success: true,
        message: 'Carrier and driver processed successfully',
        data: {
          carrierId,
          driverId,
          carrierName: bondedCarrierName,
          driverName,
          driverPhone
        }
      });
    } catch (error) {
      console.error('Error in processCarrierAndDriver:', error);
      next(error);
    }
  }
 
}

export default TripController;
