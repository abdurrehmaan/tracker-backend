// import { Request, Response, NextFunction } from "express";
// import { pool } from "../config/db";
// import User from "../models/user-model";
// import Role from "../models/role-model";

// class TripController {
//   static async driverexitandcreate(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       console.log("Fetching all users with roles...");
//       const users = await User.getAllWithRoles();

//       res.status(200).json({
//         success: true,
//         message: "Users retrieved successfully",
//         data: users,
//         count: users.length,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Function to check/create bonded carrier
//   static async checkOrCreateCarrier(carrierName: string): Promise<number> {
//     const client = await pool.connect();
//     try {
//       // Check if carrier exists by name
//       const existingCarrier = await client.query(
//         "SELECT id FROM carriers WHERE LOWER(name) = LOWER($1) LIMIT 1",
//         [carrierName]
//       );

//       if (existingCarrier.rows.length > 0) {
//         console.log(
//           `Carrier found: ${carrierName} with ID: ${existingCarrier.rows[0].id}`
//         );
//         return existingCarrier.rows[0].id;
//       }

//       // Generate a unique code for the carrier (you can modify this logic as needed)
//       const carrierCode =
//         carrierName
//           .toUpperCase()
//           .replace(/[^A-Z0-9]/g, "") // Remove special characters
//           .substring(0, 10) + Date.now().toString().slice(-4); // Add timestamp suffix

//       // Create new carrier if doesn't exist with required fields only
//       const newCarrier = await client.query(
//         `INSERT INTO carriers (name, code, contact_person, phone, email, address, city, region) 
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//         [
//           carrierName,
//           carrierCode,
//           "N/A", // contact_person
//           "N/A", // phone
//           "N/A", // email
//           "N/A", // address
//           "N/A", // city
//           "N/A", // region
//         ]
//       );

//       console.log(
//         `Created new carrier: ${carrierName} with ID: ${newCarrier.rows[0].id} and code: ${carrierCode}`
//       );
//       return newCarrier.rows[0].id;
//     } catch (error) {
//       console.error("Error in checkOrCreateCarrier:", error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   // Function to check/create driver
//   static async checkOrCreateDriver(
//     driverName: string,
//     driverPhone: string,
//     carrierId: number
//   ): Promise<number> {
//     const client = await pool.connect();
//     try {
//       // Check if driver exists by name and carrier_id
//       const existingDriver = await client.query(
//         "SELECT id FROM drivers WHERE LOWER(name) = LOWER($1) AND carrier_id = $2 LIMIT 1",
//         [driverName, carrierId]
//       );

//       if (existingDriver.rows.length > 0) {
//         console.log(
//           `Driver found: ${driverName} with ID: ${existingDriver.rows[0].id}`
//         );
//         return existingDriver.rows[0].id;
//       }

//       // Create new driver if doesn't exist
//       const newDriver = await client.query(
//         "INSERT INTO drivers (name, phone, carrier_id, cnic_number) VALUES ($1, $2, $3, $4) RETURNING id",
//         [driverName, driverPhone, carrierId, "N/A"]
//       );

//       console.log(
//         `Created new driver: ${driverName} with ID: ${newDriver.rows[0].id}`
//       );
//       return newDriver.rows[0].id;
//     } catch (error) {
//       console.error("Error in checkOrCreateDriver:", error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   // Function to search PMD devices by IMEI
//   static async searchPmdDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { q } = req.query;

//       // Validate search query
//       if (!q || typeof q !== "string") {
//         return res.status(400).json({
//           success: false,
//           message: "Search query (q) is required",
//         });
//       }

//       const client = await pool.connect();
//       try {
//         // Search PMD devices by IMEI from device_inventory table
//         const searchResults = await client.query(
//           `SELECT 
//                id, 
//             imei, 
//             device_id, 
//             device_type, 
//             created_at,
//             updated_at,
//             tracker_model,
//             purchase_date,
//             device_code
//            FROM device_inventory 
//            WHERE LOWER(device_type) = 'pmd' 
//            AND LOWER(imei) LIKE LOWER($1)
//            ORDER BY created_at DESC`,
//           [`%${q}%`]
//         );

//         return res.status(200).json({
//           success: true,
//           message: `Found ${searchResults.rows.length} PMD devices matching "${q}"`,
//           data: searchResults.rows,
//           count: searchResults.rows.length,
//           searchQuery: q,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in searchPmdDevices:", error);
//       next(error);
//     }
//   }

//   // Function to search CSD devices by IMEI
//   static async searchCsdDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { q } = req.query;

//       // Validate search query
//       if (!q || typeof q !== "string") {
//         return res.status(400).json({
//           success: false,
//           message: "Search query (q) is required",
//         });
//       }

//       const client = await pool.connect();
//       try {
//         // Search CSD devices by IMEI from device_inventory table
//         const searchResults = await client.query(
//           `SELECT 
//                 id, 
//             imei, 
//             device_id, 
//             device_type, 
//             iradium_imei,
//             created_at,
//             updated_at,
//             tracker_model,
//             purchase_date,
//             device_code
//            FROM device_inventory 
//            WHERE LOWER(device_type) = 'csd' 
//            AND LOWER(imei) LIKE LOWER($1)
//            ORDER BY created_at DESC`,
//           [`%${q}%`]
//         );

//         return res.status(200).json({
//           success: true,
//           message: `Found ${searchResults.rows.length} CSD devices matching "${q}"`,
//           data: searchResults.rows,
//           count: searchResults.rows.length,
//           searchQuery: q,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in searchCsdDevices:", error);
//       next(error);
//     }
//   }

//   // Function to get all PMD devices
//   static async getAllPmdDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const client = await pool.connect();
//       try {
//         // Get last 10 random PMD devices from device_inventory table
//         const pmdDevices = await client.query(
//           `SELECT 
//             id, 
//             imei, 
//             device_id, 
//             device_type, 
//             created_at,
//             updated_at,
//             tracker_model,
//             purchase_date,
//             device_code
//            FROM device_inventory 
//            WHERE LOWER(device_type) = 'pmd' 
//            ORDER BY RANDOM()
//            LIMIT 10`
//         );

//         return res.status(200).json({
//           success: true,
//           message: "PMD devices retrieved successfully",
//           data: pmdDevices.rows,
//           count: pmdDevices.rows.length,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in getAllPmdDevices:", error);
//       next(error);
//     }
//   }

//   // Function to get all CSD devices
//   static async getAllCsdDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const client = await pool.connect();
//       try {
//         // Get last 10 random CSD devices from device_inventory table
//         const csdDevices = await client.query(
//           `SELECT 
//              id, 
//             imei, 
//             device_id, 
//             device_type, 
//             iradium_imei,
//             created_at,
//             updated_at,
//             tracker_model,
//             purchase_date,
//             device_code
//            FROM device_inventory 
//            WHERE LOWER(device_type) = 'csd' 
//            ORDER BY RANDOM()
//            LIMIT 10`
//         );

//         return res.status(200).json({
//           success: true,
//           message: "CSD devices retrieved successfully",
//           data: csdDevices.rows,
//           count: csdDevices.rows.length,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in getAllCsdDevices:", error);
//       next(error);
//     }
//   }

//   // Function to get all eSeal devices
//   static async getAllEsealDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const client = await pool.connect();
//       try {
//         // Get 10 random eSeal devices from eseal_devices table
//         const esealDevices = await client.query(
//           `SELECT 
//             id, 
//             seal_number, 
//             qr_number, 
//             status_seal, 
//             created_at,
//             updated_at,
//             imei
//            FROM eseal_devices 
//            ORDER BY RANDOM()
//            LIMIT 10`
//         );

//         return res.status(200).json({
//           success: true,
//           message: "eSeal devices retrieved successfully",
//           data: esealDevices.rows,
//           count: esealDevices.rows.length,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in getAllEsealDevices:", error);
//       next(error);
//     }
//   }

//   // Function to search eSeal devices by seal number or QR number
//   static async searchEsealDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { q } = req.query;

//       // Validate search query
//       if (!q || typeof q !== "string") {
//         return res.status(400).json({
//           success: false,
//           message: "Search query (q) is required",
//         });
//       }

//       const client = await pool.connect();
//       try {
//         // Search eSeal devices by seal_number, qr_number, or imei
//         const searchResults = await client.query(
//           `SELECT 
//             id, 
//             seal_number, 
//             qr_number, 
//             status_seal, 
//             created_at,
//             updated_at,
//             imei
//            FROM eseal_devices 
//            WHERE LOWER(seal_number) LIKE LOWER($1) 
//            OR LOWER(qr_number) LIKE LOWER($1)
//            OR LOWER(imei) LIKE LOWER($1)
//            ORDER BY created_at DESC`,
//           [`%${q}%`]
//         );

//         return res.status(200).json({
//           success: true,
//           message: `Found ${searchResults.rows.length} eSeal devices matching "${q}"`,
//           data: searchResults.rows,
//           count: searchResults.rows.length,
//           searchQuery: q,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in searchEsealDevices:", error);
//       next(error);
//     }
//   }

//   // Function to check vehicle in pmd_devices table
//   static async checkVehicleInPmdDevices(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { vehicleNumber } = req.body;

//       // Validate required field
//       if (!vehicleNumber) {
//         return res.status(400).json({
//           success: false,
//           message: "Vehicle number is required",
//         });
//       }

//       const client = await pool.connect();
//       try {
//         // Step 1: First find the vehicle in vehicles table to get vehicle_id
//         const vehicleResult = await client.query(
//           "SELECT id, registration_number FROM vehicles WHERE LOWER(registration_number) = LOWER($1) LIMIT 1",
//           [vehicleNumber]
//         );

//         if (vehicleResult.rows.length === 0) {
//           return res.status(404).json({
//             success: false,
//             message: "Vehicle not found in vehicles table",
//             data: {
//               vehicleNumber,
//               exists: false,
//               step: "vehicle_lookup",
//             },
//           });
//         }

//         const vehicle = vehicleResult.rows[0];
//         const vehicleId = vehicle.id;

//         // Step 2: Check if vehicle_id exists in pmd_devices table and get complete device info
//         const deviceResult = await client.query(
//           `SELECT 
//             id,
//             imei,
//             sim1_number,
//             operator1,
//             sim2_number,
//             operator2,
//             tracker_model,
//             network,
//             firmware_version,
//             purchase_date,
//             next_invoice_date,
//             vehicle_id
//            FROM pmd_devices 
//            WHERE vehicle_id = $1 
//            LIMIT 1`,
//           [vehicleId]
//         );

//         if (deviceResult.rows.length > 0) {
//           const device = deviceResult.rows[0];
//           return res.status(200).json({
//             success: true,
//             message: "Vehicle found in both vehicles and PMD devices tables",
//             data: {
//               vehicleNumber: vehicle.registration_number,
//               vehicleId: vehicleId,
//               exists: true,
//               pmdDeviceExists: true,
//               deviceInfo: {
//                 deviceId: device.id,
//                 imei: device.imei,
//                 sim1: device.sim1_number,
//                 operator1: device.operator1,
//                 sim2: device.sim2_number,
//                 operator2: device.operator2,
//                 trackerModel: device.tracker_model,
//                 network: device.network,
//                 firmwareVersion: device.firmware_version,
//                 purchaseDate: device.purchase_date,
//                 nextInvoiceDate: device.next_invoice_date,
//                 readyToInstall: true, // Assuming if device exists in pmd_devices, it's ready to install
//               },
//             },
//           });
//         } else {
//           return res.status(200).json({
//             success: true,
//             message:
//               "Vehicle exists in vehicles table but not configured in PMD devices",
//             data: {
//               vehicleNumber: vehicle.registration_number,
//               vehicleId: vehicleId,
//               exists: true,
//               pmdDeviceExists: false,
//               deviceInfo: null,
//             },
//           });
//         }
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in checkVehicleInPmdDevices:", error);
//       next(error);
//     }
//   }

//   // Function to find vehicle in pmd_devices by vehicle_id
//   static async findVehicleInPmdDevices(req: Request, res: Response) {
//     try {
//       const { vehicle_id } = req.params;

//       // Validate required field
//       if (!vehicle_id) {
//         return res.status(400).json({
//           success: false,
//           message: "vehicle_id is required",
//         });
//       }

//       const client = await pool.connect();

//       try {
//         // Check if vehicle_id exists in pmd_devices table and get complete device info
//         const deviceResult = await client.query(
//           `SELECT 
//             pd.id,
//             pd.imei,
//             pd.sim1_number,
//             pd.operator1,
//             pd.sim2_number,
//             pd.operator2,
//             pd.tracker_model,
//             pd.network,
//             pd.firmware_version,
//             pd.purchase_date,
//             pd.next_invoice_date,
//             pd.vehicle_id,
//             pd.created_at,
//             pd.updated_at,
//             v.registration_number AS vehicle_registration
//            FROM pmd_devices pd
//            LEFT JOIN vehicles v ON pd.vehicle_id = v.id
//            WHERE pd.vehicle_id = $1 
//            LIMIT 1`,
//           [vehicle_id]
//         );

//         console.log(`Debug -===========>>> Query result rows: ${JSON.stringify(deviceResult.rows[0])}`);

//         if (deviceResult.rows.length > 0) {
//           const device = deviceResult.rows[0];
//           return res.status(200).json({
//             success: true,
//             exists: true,
//             message: "Vehicle foundl in PMD devices table",
//             data: {
//               deviceId: device.id,
//               imei: device.imei,
//               vehicleId: device.vehicle_id,
//               vehicleRegistration: device.vehicle_registration,
//               sim1Number: device.sim1_number,
//               operator1: device.operator1,
//               sim2Number: device.sim2_number,
//               operator2: device.operator2,
//               trackerModel: device.tracker_model,
//               network: device.network,
//               firmwareVersion: device.firmware_version,
//               purchaseDate: device.purchase_date,
//               nextInvoiceDate: device.next_invoice_date,
//               createdAt: device.created_at,
//               updatedAt: device.updated_at,
//             },
//           });
//         } else {
//           return res.status(200).json({
//             success: true,
//             exists: true,
//             message: "Vehicle not found in PMD devices table",
//             data: null,
//           });
//         }
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in findVehicleInPmdDevices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }

//   // Function to find container in CSD devices by container_id
//   static async findContainerInCSDDevices(req: Request, res: Response) {
//     try {
//       const { container_id } = req.params;

//       // Validate required field
//       if (!container_id) {
//         return res.status(400).json({
//           success: false,
//           message: "container_id is required",
//         });
//       }

//       const client = await pool.connect();

//       try {
//         // STEP 1: First check if container exists in containers table
//         console.log(
//           `Step 1: Checking if container ID ${container_id} exists in containers table...`
//         );
//         console.log(`Debug - Input container_id type: ${typeof container_id}`);
//         console.log(`Debug - Input container_id value: "${container_id}"`);
        
//         const containerCheck = await client.query(
//           `SELECT id, plate_number, type, capacity_tons, carrier_id, created_at, updated_at
//            FROM containers 
//            WHERE id = $1 
//            LIMIT 1`,
//           [container_id]
//         );
        
//         console.log(`Debug - Containers table query result: ${containerCheck.rows.length} rows found`);
//         if (containerCheck.rows.length > 0) {
//           console.log(`Debug - Found container:`, containerCheck.rows[0]);
//         }
        
//         // Let's also check what IDs exist in containers table
//         const sampleContainers = await client.query(
//           `SELECT id, plate_number FROM containers LIMIT 3`
//         );
//         console.log(`Debug - Sample container IDs from containers table:`, sampleContainers.rows);

//         if (containerCheck.rows.length === 0) {
//           // Container doesn't exist at all
//           console.log(
//             `Container ID ${container_id} not found in containers table`
//           );
//           return res.status(404).json({
//             success: false,
//             exists: false,
//             configured: false,
//             searchEnabled: false,
//             message: `Container with ID ${container_id} does not exist`,
//             data: null,
//             ui: {
//               allowSearch: false,
//               searchMessage:
//                 "Container does not exist. Please create the container first.",
//               disableActions: true,
//               configurationRequired: false,
//               suggestedAction: "Create container before configuring CSD device",
//             },
//           });
//         }

//         const container = containerCheck.rows[0];
//         console.log(
//           `✅ Container found: ${container.plate_number} (ID: ${container.id})`
//         );

//         // STEP 2: Now check if CSD is configured for this container
//         console.log(
//           `Step 2: Checking if CSD is configured for container ID ${container_id}...`
//         );
//         console.log(`Debug - container_id type: ${typeof container_id}`);
//         console.log(`Debug - container_id value: "${container_id}"`);
        
//         // First, let's see what container_ids exist in csd_devices table
//         const allCsdContainers = await client.query(
//           `SELECT DISTINCT container_id FROM csd_devices LIMIT 5`
//         );
//         console.log(`Debug - Available container_ids in csd_devices:`, allCsdContainers.rows);
        
//         const csdResult = await client.query(
//           `SELECT 
//       cd.id,
//       cd.imei,
//       cd.sim1_number,
//       cd.operator1,
//       cd.sim2_number,
//       cd.operator2,
//       cd.tracker_model,
//       cd.network,
//       cd.last_updated,
//       cd.container_id,
//       cd.created_at,
//       cd.updated_at,
//       cd.device_id,
//       cd.vts_id,
//       cd.firmware_version,
//       cd.purchase_date,
//       cd.next_invoice_date,
//       cd.configuration_date,
//       cd.ready_to_install
//     FROM csd_devices cd
//     WHERE cd.container_id = $1 
//     LIMIT 1`,
//           [container_id] // Ensure this is an array with the parameter
//         );
        
//         console.log(`Debug - CSD query result rows: ${csdResult.rows.length}`);

//         if (csdResult.rows.length > 0) {
//           // Container exists AND CSD is configured
//           const device = csdResult.rows[0];
//           console.log(
//             `✅ CSD configured for container: CSD Device ID ${device.id}, IMEI: ${device.imei}`
//           );

//           return res.status(200).json({
//             success: true,
//             exists: true, // CSD is configured, so exists = true
//             configured: true,
//             searchEnabled: true,
//             message: `Container found and CSD is configured for container ID: ${container_id}`,
//             data: {
//               // Container information
//               container: {
//                 containerId: container.id,
//                 plateNumber: container.plate_number,
//                 type: container.type,
//                 capacityTons: container.capacity_tons,
//                 carrierId: container.carrier_id,
//                 createdAt: container.created_at,
//                 updatedAt: container.updated_at,
//               },
//               // CSD device information
//               csdDevice: {
//                 csdDeviceId: device.id,
//                 imei: device.imei,
//                 sim1Number: device.sim1_number,
//                 operator1: device.operator1,
//                 sim2Number: device.sim2_number,
//                 operator2: device.operator2,
//                 trackerModel: device.tracker_model,
//                 network: device.network,
//                 lastUpdated: device.last_updated,
//                 deviceId: device.device_id,
//                 vtsId: device.vts_id,
//                 firmwareVersion: device.firmware_version,
//                 purchaseDate: device.purchase_date,
//                 nextInvoiceDate: device.next_invoice_date,
//                 configurationDate: device.configuration_date,
//                 readyToInstall: device.ready_to_install,
//                 createdAt: device.created_at,
//                 updatedAt: device.updated_at,
//               },
//             },
//             ui: {
//               allowSearch: true,
//               searchMessage: `CSD is configured for container ${container.plate_number}. You can search for CSD devices.`,
//               disableActions: false,
//             },
//           });
//         } else {
//           // Container exists BUT CSD is NOT configured
//           console.log(
//             `⚠️ Container exists but CSD is not configured for container ID ${container_id}`
//           );

//           return res.status(200).json({
//             success: true,
//             exists: true, // CSD is NOT configured, so exists = false
//             configured: false,
//             searchEnabled: false,
//             message: `Container exists but CSD is not configured for container ID: ${container_id}`,
//             data: {
//               container: {
//                 containerId: container.id,
//                 plateNumber: container.plate_number,
//                 type: container.type,
//                 capacityTons: container.capacity_tons,
//                 carrierId: container.carrier_id,
//                 createdAt: container.created_at,
//                 updatedAt: container.updated_at,
//               },
//               csdDevice: null,
//             },
//             ui: {
//               allowSearch: false,
//               searchMessage: `Container ${container.plate_number} exists but CSD is not configured. Please configure CSD device first.`,
//               disableActions: true,
//               configurationRequired: true,
//               suggestedAction: `Configure CSD device for container ${container.plate_number} (ID: ${container_id}) to enable search functionality`,
//             },
//           });
//         }
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in findContainerInCSDDevices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }

//   // Function to check/create route
//   static async checkOrCreateRoute(
//     origin: string,
//     destination: string
//   ): Promise<number> {
//     const client = await pool.connect();
//     try {
//       console.log(`=== checkOrCreateRoute DEBUG ===`);
//       console.log(`Checking route: "${origin}" ➔ "${destination}"`);

//       // Check if route exists by origin and destination
//       const existingRoute = await client.query(
//         "SELECT id, origin, destination FROM routes WHERE LOWER(origin) = LOWER($1) AND LOWER(destination) = LOWER($2) LIMIT 1",
//         [origin, destination]
//       );

//       if (existingRoute.rows.length > 0) {
//         const route = existingRoute.rows[0];
//         console.log(
//           `Route found: ID ${route.id} | "${route.origin}" ➔ "${route.destination}"`
//         );
//         console.log(
//           `Input match: "${origin}" === "${route.origin}" && "${destination}" === "${route.destination}"`
//         );
//         return route.id;
//       }

//       // Create new route if doesn't exist
//       const routeName = `${origin} ➔ ${destination}`;
//       console.log(`Creating new route: "${routeName}"`);

//       const newRoute = await client.query(
//         "INSERT INTO routes (name, origin, destination, route_type) VALUES ($1, $2, $3, $4) RETURNING id",
//         [routeName, origin, destination, "original"]
//       );

//       console.log(
//         `Created new route: ${routeName} with ID: ${newRoute.rows[0].id}`
//       );
//       return newRoute.rows[0].id;
//     } catch (error) {
//       console.error("Error in checkOrCreateRoute:", error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   // Main function to handle route checking and creation
//   static async processRoute(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { origin, destination } = req.body;

//       // Debug logging for input validation
//       console.log("=== ROUTE PROCESSING DEBUG ===");
//       console.log("Received origin:", `"${origin}"`);
//       console.log("Received destination:", `"${destination}"`);

//       // Validate required fields
//       if (!origin || !destination) {
//         return res.status(400).json({
//           success: false,
//           message: "Origin and destination are required",
//           debug: {
//             receivedOrigin: origin,
//             receivedDestination: destination,
//           },
//         });
//       }

//       const client = await pool.connect();
//       try {
//         // First, let's check for any similar routes for debugging
//         console.log("Searching for similar routes...");
//         const similarRoutes = await client.query(
//           `SELECT id, name, origin, destination FROM routes 
//            WHERE LOWER(origin) LIKE '%' || LOWER($1) || '%' 
//            OR LOWER(destination) LIKE '%' || LOWER($2) || '%'
//            OR LOWER($1) LIKE '%' || LOWER(origin) || '%'
//            OR LOWER($2) LIKE '%' || LOWER(destination) || '%'`,
//           [origin, destination]
//         );

//         console.log(`Found ${similarRoutes.rows.length} similar routes:`);
//         similarRoutes.rows.forEach((route) => {
//           console.log(
//             `  - ID: ${route.id}, Origin: "${route.origin}", Destination: "${route.destination}"`
//           );
//         });

//         // Check if route exists by exact origin and destination match
//         console.log("Checking for exact match...");
//         const routeResult = await client.query(
//           `SELECT 
//             id,
//             name,
//             origin,
//             destination,
//             route_type,
//             created_at,
//             updated_at
//            FROM routes 
//            WHERE LOWER(origin) = LOWER($1) AND LOWER(destination) = LOWER($2) 
//            LIMIT 1`,
//           [origin, destination]
//         );

//         console.log(
//           `Exact match query result: ${routeResult.rows.length} rows`
//         );

//         if (routeResult.rows.length > 0) {
//           const route = routeResult.rows[0];
//           console.log(
//             `Route Found - ID: ${route.id}, Origin: "${route.origin}", Destination: "${route.destination}"`
//           );

//           return res.status(200).json({
//             success: true,
//             message: "Route exists in database",
//             data: {
//               routeExists: true,
//               routeId: route.id,
//               origin: route.origin,
//               destination: route.destination,
//               routeName: `${route.origin} ➔ ${route.destination}`,
//               routeType: route.route_type,
//               createdAt: route.created_at,
//               updatedAt: route.updated_at,
//             },
//             debug: {
//               searchedOrigin: origin,
//               searchedDestination: destination,
//               matchedOrigin: route.origin,
//               matchedDestination: route.destination,
//               similarRoutesFound: similarRoutes.rows.length,
//             },
//           });
//         } else {
//           // Create new route
//           console.log(
//             `No exact match found. Creating new route: "${origin}" ➔ "${destination}"`
//           );
//           const routeName = `${origin} ➔ ${destination}`;
//           const newRoute = await client.query(
//             `INSERT INTO routes (name, origin, destination, route_type) 
//              VALUES ($1, $2, $3, $4) RETURNING id, name, origin, destination, route_type, created_at, updated_at`,
//             [routeName, origin, destination, "original"]
//           );

//           const route = newRoute.rows[0];
//           console.log(`Route Created - ID: ${route.id}, Name: "${route.name}"`);

//           return res.status(201).json({
//             success: true,
//             message: "Route created successfully",
//             data: {
//               routeExists: false,
//               routeCreated: true,
//               routeId: route.id,
//               routeName: route.name,
//               origin: route.origin,
//               destination: route.destination,
//               routeType: route.route_type,
//               createdAt: route.created_at,
//               updatedAt: route.updated_at,
//             },
//             debug: {
//               searchedOrigin: origin,
//               searchedDestination: destination,
//               similarRoutesFound: similarRoutes.rows.length,
//             },
//           });
//         }
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in processRoute:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }

//   // Function to check/create vehicle
//   static async checkOrCreateVehicle(
//     vehicleNumber: string,
//     carrierId: number
//   ): Promise<number> {
//     const client = await pool.connect();
//     try {
//       // Check if vehicle exists by registration number and carrier_id
//       const existingVehicle = await client.query(
//         "SELECT id FROM vehicles WHERE LOWER(registration_number) = LOWER($1) AND carrier_id = $2 LIMIT 1",
//         [vehicleNumber, carrierId]
//       );

//       if (existingVehicle.rows.length > 0) {
//         console.log(
//           `Vehicle found: ${vehicleNumber} with ID: ${existingVehicle.rows[0].id}`
//         );
//         return existingVehicle.rows[0].id;
//       }

//       // Create new vehicle if doesn't exist
//       const newVehicle = await client.query(
//         `INSERT INTO vehicles (registration_number, make, model, year, color, chassis_number, engine_number, carrier_id) 
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//         [
//           vehicleNumber, // registration_number
//           "N/A", // make
//           "N/A", // model
//           2020, // year (default year)
//           "N/A", // color
//           "N/A", // chassis_number
//           "N/A", // engine_number
//           carrierId, // carrier_id
//         ]
//       );

//       console.log(
//         `Created new vehicle: ${vehicleNumber} with ID: ${newVehicle.rows[0].id}`
//       );
//       return newVehicle.rows[0].id;
//     } catch (error) {
//       console.error("Error in checkOrCreateVehicle:", error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   // Main function to handle carrier and vehicle creation
//   static async processCarrierAndVehicle(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { vehicleNumber, bondedCarrierName } = req.body;

//       // Validate required fields
//       if (!vehicleNumber || !bondedCarrierName) {
//         return res.status(400).json({
//           success: false,
//           message: "Vehicle number and bonded carrier name are required",
//         });
//       }

//       // Step 1: Check/Create Bonded Carrier
//       const carrierId = await TripController.checkOrCreateCarrier(
//         bondedCarrierName
//       );

//       // Step 2: Check/Create Vehicle
//       const vehicleId = await TripController.checkOrCreateVehicle(
//         vehicleNumber,
//         carrierId
//       );

//       res.status(200).json({
//         success: true,
//         message: "Carrier and vehicle processed successfully",
//         data: {
//           carrierId,
//           vehicleId,
//           carrierName: bondedCarrierName,
//           vehicleNumber,
//         },
//       });
//     } catch (error) {
//       console.error("Error in processCarrierAndVehicle:", error);
//       next(error);
//     }
//   }

//   // Main function to handle carrier and driver creation
//   static async processCarrierAndDriver(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { driverName, driverPhone, bondedCarrierName } = req.body;

//       // Validate required fields
//       if (!driverName || !driverPhone || !bondedCarrierName) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Driver name, driver phone, and bonded carrier name are required",
//         });
//       }

//       // Step 1: Check/Create Bonded Carrier
//       const carrierId = await TripController.checkOrCreateCarrier(
//         bondedCarrierName
//       );

//       // Step 2: Check/Create Driver
//       const driverId = await TripController.checkOrCreateDriver(
//         driverName,
//         driverPhone,
//         carrierId
//       );

//       res.status(200).json({
//         success: true,
//         message: "Carrier and driver processed successfully",
//         data: {
//           carrierId,
//           driverId,
//           carrierName: bondedCarrierName,
//           driverName,
//           driverPhone,
//         },
//       });
//     } catch (error) {
//       console.error("Error in processCarrierAndDriver:", error);
//       next(error);
//     }
//   }

//   // Progress Container - check if container exists by plate number, if not create new one
//   static async progressContainer(req: Request, res: Response) {
//     try {
//       // Get plate_number from params
//       const { plate_number, carrier_id } = req.body;

//       // Validate required field
//       if (!plate_number) {
//         return res.status(400).json({
//           success: false,
//           message: "plate_number is required as path parameter",
//         });
//       }

//       // Get optional fields from body for creating new container

//       const client = await pool.connect();

//       try {
//         // Check if container exists by plate_number
//         const existingContainer = await client.query(
//           `SELECT 
//             id, 
//             plate_number, 
//             carrier_id, 
//             created_at, 
//             updated_at 
//            FROM containers 
//            WHERE LOWER(plate_number) = LOWER($1) 
//            LIMIT 1`,
//           [plate_number]
//         );

//         if (existingContainer.rows.length > 0) {
//           const container = existingContainer.rows[0];
//           console.log(
//             `Container found: ${plate_number} with ID: ${container.id}`
//           );

//           return res.status(200).json({
//             success: true,
//             exists: true,
//             message: "Container already exists",
//             data: {
//               containerId: container.id,
//               plateNumber: container.plate_number,
//               type: container.type,
//               capacityTons: container.capacity_tons,
//               carrierId: container.carrier_id,
//               createdAt: container.created_at,
//               updatedAt: container.updated_at,
//             },
//           });
//         } else {
//           // Container doesn't exist, create new one
//           console.log(
//             `Container not found. Creating new container with plate number: ${plate_number}`
//           );

//           const newContainer = await client.query(
//             `INSERT INTO containers (
//               plate_number, 
//               type, 
//               capacity_tons, 
//               carrier_id, 
//               created_at, 
//               updated_at
//             ) VALUES ($1, $2, $3, $4, NOW(), NOW()) 
//             RETURNING id, plate_number, type, capacity_tons, carrier_id, created_at, updated_at`,
//             [plate_number, "Standard", 20, carrier_id || null]
//           );

//           const container = newContainer.rows[0];
//           console.log(`✅ Container created with ID: ${container.id}`);

//           return res.status(201).json({
//             success: true,
//             exists: false,
//             created: true,
//             message: "Container created successfully",
//             data: {
//               containerId: container.id,
//               plateNumber: container.plate_number,
//               type: container.type,
//               capacityTons: container.capacity_tons,
//               carrierId: container.carrier_id,
//               createdAt: container.created_at,
//               updatedAt: container.updated_at,
//             },
//           });
//         }
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error in progressContainer:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }
//   // Main function to create a new trip
//   // static async createTrip(req: Request, res: Response, next: NextFunction) {
//   //   const startTime = Date.now();
//   //   const requestId = `trip_${startTime}_${Math.random()
//   //     .toString(36)
//   //     .substr(2, 9)}`;

//   //   try {
//   //     const form = req.body;
//   //     const transformedForm = { ...form };
      
//   //     // Validate required fields
//   //     const required = [
//   //       "pmd_id",
//   //       "csd_id",
//   //       "eseal_id",
//   //       "route_id",
//   //       "departure_time",
//   //       "expected_arrival",
//   //     ];
//   //     const missing = required.filter((field) => {
//   //       const value = transformedForm[field];
//   //       const isEmpty =
//   //         !value || value === "" || value === null || value === undefined;
//   //       if (isEmpty) {
//   //         console.log(`❌ Missing field: ${field} (value: ${value})`);
//   //       } else {
//   //         console.log(`✅ Field present: ${field} = ${value}`);
//   //       }
//   //       return isEmpty;
//   //     });

//   //     console.log(
//   //       `📊 Validation Summary: ${required.length - missing.length}/${
//   //         required.length
//   //       } required fields present`
//   //     );

//   //     if (missing.length > 0) {
//   //       console.log(
//   //         `\n🚫 VALIDATION FAILED - Missing ${missing.length} required fields:`
//   //       );
//   //       missing.forEach((field) => console.log(`   • ${field}`));

//   //       return res.status(400).json({
//   //         success: false,
//   //         message: `Missing fields: ${missing.join(", ")}`,
//   //         missingFields: missing,
//   //         receivedData: form,
//   //         requestId: requestId,
//   //       });
//   //     }

//   //     console.log("✅ All required fields validated successfully");

//   //       console.log("\n🔌 STEP 2: DATABASE CONNECTION");
//   //     console.log("=========================================");
//   //     const client = await pool.connect();
//   //     console.log("✅ Database connection established");

//   //     // Set replica identity for eseal_devices table if not already set
//   //     try {
//   //       await client.query('ALTER TABLE eseal_devices REPLICA IDENTITY FULL');
//   //       console.log("✅ Replica identity set for eseal_devices table");
//   //     } catch (error) {
//   //       const pgError = error as { message?: string };
//   //       console.log("ℹ️ Replica identity might already be set:", pgError.message || "Unknown error");
//   //       // Continue with the process as the table might already have replica identity set
//   //     }      // Variables to track for rollback
//   //     let assignmentId: number | null = null;
//   //     let tripId: number | null = null;
//   //     let vdaId: number | null = null;

//   //     try {
//   //       // Start transaction
//   //       console.log("\n💾 STEP 3: TRANSACTION MANAGEMENT");
//   //       console.log("=========================================");
//   //       await client.query("BEGIN");
//   //       console.log("✅ Database transaction started");

//   //       // VALIDATION: Check if all device IDs exist before creating assignment
//   //       console.log("\n🔍 STEP 4: DEVICE VALIDATION & AUTO-CONFIGURATION");
//   //       console.log("=========================================");

//   //       // First, let's check what tables exist
//   //       console.log("\n📊 STEP 4.0: DATABASE SCHEMA VERIFICATION");
//   //       console.log("-----------------------------------------");
//   //       try {
//   //         const tableCheck = await client.query(`
//   //           SELECT table_name 
//   //           FROM information_schema.tables 
//   //           WHERE table_schema = 'public' 
//   //           AND table_name IN ('pmd_devices', 'csd_devices', 'eseal_devices', 'device_inventory', 'routes', 'containers')
//   //           ORDER BY table_name
//   //         `);
//   //         const availableTables = tableCheck.rows.map((r) => r.table_name);
//   //         console.log("✅ Database tables verified:");
//   //         availableTables.forEach((table) => console.log(`   • ${table}`));

//   //         // Check table record counts for context
//   //         for (const table of availableTables) {
//   //           try {
//   //             const countResult = await client.query(
//   //               `SELECT COUNT(*) as count FROM ${table}`
//   //             );
//   //             console.log(
//   //               `   📈 ${table}: ${countResult.rows[0].count} records`
//   //             );
//   //           } catch (countError) {
//   //             console.log(`   ⚠️  ${table}: Unable to count records`);
//   //           }
//   //         }
//   //       } catch (error) {
//   //         console.log("❌ Error checking database schema:", error);
//   //         throw new Error(`Database schema verification failed: ${error}`);
//   //       }

//   //       // Check PMD device exists
//   //       console.log("\n🔍 STEP 4.1: PMD DEVICE VALIDATION");
//   //       console.log("-----------------------------------------");
//   //       console.log(`🎯 Target PMD ID: ${transformedForm.pmd_id}`);
//   //       console.log(`📊 Data Type: ${typeof transformedForm.pmd_id}`);

//   //       let pmdDeviceId = transformedForm.pmd_id;

//   //       console.log("🔍 Querying pmd_devices table...");
//   //       const pmdCheck = await client.query(
//   //         "SELECT id, imei, vehicle_id FROM pmd_devices WHERE id = $1",
//   //         [transformedForm.pmd_id]
//   //       );
//   //       console.log(
//   //         `📊 PMD devices query result: ${pmdCheck.rows.length} rows found`
//   //       );

//   //       if (pmdCheck.rows.length > 0) {
//   //         console.log("✅ PMD device found in pmd_devices table:");
//   //         console.log(`   • ID: ${pmdCheck.rows[0].id}`);
//   //         console.log(`   • IMEI: ${pmdCheck.rows[0].imei}`);
//   //         console.log(`   • Vehicle ID: ${pmdCheck.rows[0].vehicle_id}`);
//   //       }

//   //       if (pmdCheck.rows.length === 0) {
//   //         console.log(
//   //           "⚠️  PMD not found in pmd_devices table, checking device_inventory..."
//   //         );

//   //         // Find PMD in device_inventory
//   //         const pmdInventoryCheck = await client.query(
//   //           "SELECT * FROM device_inventory WHERE id = $1 AND LOWER(device_type) = $2",
//   //           [transformedForm.pmd_id, "pmd"]
//   //         );

//   //         console.log(
//   //           `📊 PMD inventory query result: ${pmdInventoryCheck.rows.length} rows found`
//   //         );

//   //         if (pmdInventoryCheck.rows.length === 0) {
//   //           console.log("❌ PMD device not found in either table");
//   //           console.log(
//   //             `   • Searched pmd_devices for ID: ${transformedForm.pmd_id}`
//   //           );
//   //           console.log(
//   //             `   • Searched device_inventory for ID: ${transformedForm.pmd_id} with type: pmd`
//   //           );

//   //           await client.query("ROLLBACK");
//   //           return res.status(404).json({
//   //             success: false,
//   //             message: `PMD device not found in device_inventory: ${transformedForm.pmd_id}`,
//   //             errorType: "DEVICE_NOT_FOUND",
//   //             deviceType: "PMD",
//   //             deviceId: transformedForm.pmd_id,
//   //           });
//   //         }

//   //         const pmdInventoryData = pmdInventoryCheck.rows[0];
//   //         console.log("Found PMD in device_inventory:", pmdInventoryData.imei);

//   //         // Get vehicle_id from the request (should be provided)
//   //         const vehicleId = transformedForm.vehicle_id;
//   //         if (!vehicleId) {
//   //           await client.query("ROLLBACK");
//   //           return res.status(400).json({
//   //             success: false,
//   //             message: "vehicle_id is required to configure PMD device",
//   //             errorType: "MISSING_VEHICLE_ID",
//   //           });
//   //         }

//   //         // Create PMD device in pmd_devices table
//   //         console.log(
//   //           `Creating PMD device in pmd_devices table with vehicle_id: ${vehicleId}`
//   //         );
//   //         const newPmdDevice = await client.query(
//   //           `INSERT INTO pmd_devices (
//   //             id, imei, sim1_number, operator1, sim2_number, operator2, 
//   //             tracker_model, network, firmware_version, purchase_date, 
//   //             next_invoice_date, vehicle_id, created_at, updated_at
//   //           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) 
//   //           RETURNING id`,
//   //           [
//   //             pmdInventoryData.id,
//   //             pmdInventoryData.imei,
//   //             pmdInventoryData.sim1_number, // sim1_number
//   //             pmdInventoryData.operator1, // operator1
//   //             "N/A", // sim2_number
//   //             "N/A", // operator2
//   //             pmdInventoryData.tracker_model || "N/A",
//   //             pmdInventoryData.network, // network
//   //             "N/A", // firmware_version
//   //             pmdInventoryData.purchase_date || new Date(),
//   //             null, // next_invoice_date
//   //             vehicleId,
//   //           ]
//   //         );

//   //         pmdDeviceId = newPmdDevice.rows[0].id;
//   //         console.log(
//   //           `✅ PMD device created in pmd_devices with ID: ${pmdDeviceId}`
//   //         );
//   //       } else {
//   //         console.log(
//   //           `✅ PMD device ${transformedForm.pmd_id} exists in pmd_devices`
//   //         );
//   //       }

//   //       // Check CSD device exists and configure if needed
//   //       console.log(`Step 0.2: Checking CSD device: ${transformedForm.csd_id}`);
//   //       let csdDeviceId = transformedForm.csd_id;

//   //       const csdCheck = await client.query(
//   //         "SELECT id FROM csd_devices WHERE id = $1",
//   //         [transformedForm.csd_id]
//   //       );
//   //       console.log(`CSD query result: ${csdCheck.rows.length} rows found`);

//   //       if (csdCheck.rows.length === 0) {
//   //         console.log(
//   //           "CSD not found in csd_devices table, checking device_inventory..."
//   //         );

//   //         // Find CSD in device_inventory
//   //         const csdInventoryCheck = await client.query(
//   //           "SELECT * FROM device_inventory WHERE id = $1 AND LOWER(device_type) = $2",
//   //           [transformedForm.csd_id, "csd"]
//   //         );

//   //         if (csdInventoryCheck.rows.length === 0) {
//   //           await client.query("ROLLBACK");
//   //           return res.status(404).json({
//   //             success: false,
//   //             message: `CSD device not found in device_inventory: ${transformedForm.csd_id}`,
//   //             errorType: "DEVICE_NOT_FOUND",
//   //             deviceType: "CSD",
//   //             deviceId: transformedForm.csd_id,
//   //           });
//   //         }

//   //         const csdInventoryData = csdInventoryCheck.rows[0];
//   //         console.log("Found CSD in device_inventory:", csdInventoryData.imei);

//   //         // Step 0.2.1: Handle container information
//   //         console.log("Step 0.2.1: Checking/Creating container...");
//   //         let containerId = null;

//   //         // Check if container information is provided in the request
//   //         const containerPlateNumber =
//   //           transformedForm.container_plate_number ||
//   //           transformedForm.plate_number;
//   //         const containerType = transformedForm.container_type || "Standard";
//   //         const capacityTons = transformedForm.capacity_tons || 20;
//   //         const carrierId = transformedForm.carrier_id;

//   //         if (containerPlateNumber) {
//   //           console.log(
//   //             `Checking container with plate number: ${containerPlateNumber}`
//   //           );

//   //           // Check if container exists
//   //           const containerCheck = await client.query(
//   //             "SELECT id FROM containers WHERE LOWER(plate_number) = LOWER($1)",
//   //             [containerPlateNumber]
//   //           );

//   //           if (containerCheck.rows.length > 0) {
//   //             containerId = containerCheck.rows[0].id;
//   //             console.log(`✅ Container found with ID: ${containerId}`);
//   //           } else {
//   //             // Create new container
//   //             console.log(
//   //               `Creating new container with plate number: ${containerPlateNumber}`
//   //             );
//   //             const newContainer = await client.query(
//   //               `INSERT INTO containers (
//   //                 plate_number, type, capacity_tons, carrier_id, created_at, updated_at
//   //               ) VALUES ($1, $2, $3, $4, NOW(), NOW()) 
//   //               RETURNING id`,
//   //               [
//   //                 containerPlateNumber,
//   //                 containerType,
//   //                 capacityTons,
//   //                 carrierId || null,
//   //               ]
//   //             );

//   //             containerId = newContainer.rows[0].id;
//   //             console.log(`✅ Container created with ID: ${containerId}`);
//   //           }
//   //         } else {
//   //           console.log(
//   //             "No container plate number provided, creating CSD without container assignment"
//   //           );
//   //         }

//   //         // Create CSD device with container assignment
//   //         console.log(
//   //           `Creating CSD device in csd_devices table with container_id: ${containerId}`
//   //         );
//   //         const newCsdDevice = await client.query(
//   //           `INSERT INTO csd_devices (
//   //             id, imei, sim1_number, operator1, sim2_number, operator2, 
//   //             tracker_model, network, last_updated, container_id, created_at, 
//   //             updated_at, device_id, vts_id, firmware_version, purchase_date, 
//   //             next_invoice_date, configuration_date, ready_to_install
//   //           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, NOW(), NOW(), 
//   //             $10, $11, $12, $13, $14, $15, $16) 
//   //           RETURNING id`,
//   //           [
//   //             csdInventoryData.id,
//   //             csdInventoryData.imei,
//   //             csdInventoryData.sim1_number || "N/A", // sim1_number
//   //             csdInventoryData.operator1 || "N/A", // operator1
//   //             "N/A", // sim2_number
//   //             "N/A", // operator2
//   //             csdInventoryData.tracker_model || "N/A",
//   //             csdInventoryData.network || "N/A", // network
//   //             containerId, // container_id - now properly assigned
//   //             csdInventoryData.device_id || "N/A",
//   //             null, // vts_id
//   //             "N/A", // firmware_version
//   //             csdInventoryData.purchase_date || new Date(),
//   //             null, // next_invoice_date
//   //             new Date(), // configuration_date
//   //             true, // ready_to_install
//   //           ]
//   //         );

//   //         csdDeviceId = newCsdDevice.rows[0].id;
//   //         console.log(
//   //           `✅ CSD device created in csd_devices with ID: ${csdDeviceId}`
//   //         );
//   //       } else {
//   //         console.log(
//   //           `✅ CSD device ${transformedForm.csd_id} exists in csd_devices`
//   //         );
//   //       }

//   //       // Check eSeal device exists
//   //       const esealCheck = await client.query(
//   //         "SELECT id FROM eseal_devices WHERE id = $1",
//   //         [transformedForm.eseal_id]
//   //       );
//   //       if (esealCheck.rows.length === 0) {
//   //         await client.query("ROLLBACK");
//   //         return res.status(404).json({
//   //           success: false,
//   //           message: `eSeal device not found: ${transformedForm.eseal_id}`,
//   //           errorType: "DEVICE_NOT_FOUND",
//   //           deviceType: "ESEAL",
//   //           deviceId: transformedForm.eseal_id,
//   //         });
//   //       }
//   //       console.log(`✅ eSeal device ${transformedForm.eseal_id} exists`);

//   //       // Check route exists
//   //       const routeCheck = await client.query(
//   //         "SELECT id FROM routes WHERE id = $1",
//   //         [transformedForm.route_id]
//   //       );
//   //       if (routeCheck.rows.length === 0) {
//   //         await client.query("ROLLBACK");
//   //         return res.status(404).json({
//   //           success: false,
//   //           message: `Route not found: ${transformedForm.route_id}`,
//   //           errorType: "ROUTE_NOT_FOUND",
//   //           routeId: transformedForm.route_id,
//   //         });
//   //       }
//   //       console.log(`✅ Route ${transformedForm.route_id} exists`);

//   //       console.log("✅ All device and route validations passed");

//   //       // 1) INSERT into pmd_csd_assignments - use configured device IDs
//   //       console.log("Step 1: Creating PMD-CSD assignment...");

//   //       const assignmentCols = [
//   //         "pmd_id",
//   //         "csd_id",
//   //         "eseal_id",
//   //         "route_id",
//   //         "departure_time",
//   //         "expected_arrival",
//   //       ];

//   //       // Add optional fields if present
//   //       if (transformedForm.assigned_at) assignmentCols.push("assigned_at");
//   //       if (transformedForm.detached_at) assignmentCols.push("detached_at");

//   //       // Use the configured device IDs
//   //       const assignmentData: any = {
//   //         pmd_id: pmdDeviceId,
//   //         csd_id: csdDeviceId,
//   //         eseal_id: transformedForm.eseal_id,
//   //         route_id: transformedForm.route_id,
//   //         departure_time: transformedForm.departure_time,
//   //         expected_arrival: transformedForm.expected_arrival,
//   //         assigned_at: transformedForm.assigned_at,
//   //         detached_at: transformedForm.detached_at,
//   //       };

//   //       const colsPresent = assignmentCols.filter(
//   //         (col) => assignmentData[col] !== undefined
//   //       );
//   //       const valsPresent = colsPresent.map((col) => assignmentData[col]);
//   //       const placeholders = colsPresent
//   //         .map((_, index) => `$${index + 1}`)
//   //         .join(", ");

//   //       console.log("Assignment data:", {
//   //         pmdDeviceId,
//   //         csdDeviceId,
//   //         eseal_id: transformedForm.eseal_id,
//   //       });

//   //       const insertAssignmentQuery = `
//   //         INSERT INTO pmd_csd_assignments (${colsPresent.join(", ")})
//   //         VALUES (${placeholders})
//   //         RETURNING id
//   //       `;

//   //       const assignmentResult = await client.query(
//   //         insertAssignmentQuery,
//   //         valsPresent
//   //       );
//   //       assignmentId = assignmentResult.rows[0].id;
//   //       console.log(`Assignment created with ID: ${assignmentId}`);

//   //       // Special case: closing the e-seal
//   //       if (transformedForm.eseal_id) {
//   //         await client.query(
//   //           "UPDATE eseal_devices SET status_seal = $1 WHERE id = $2",
//   //           ["Closed", transformedForm.eseal_id]
//   //         );
//   //         console.log(
//   //           `E-seal ${transformedForm.eseal_id} status updated to Closed`
//   //         );
//   //       }

//   //       // 2) INSERT into trips
//   //       console.log("Step 2: Creating trip record...");

//   //       const tripCols = [
//   //         "paired_assignment",
//   //         "route_id",
//   //         "departure_time",
//   //         "expected_arrival",
//   //         "status",
//   //         "note",
//   //         "bl_number",
//   //         "gd_number",
//   //         "vir_number",
//   //       ];
//   //       const tripVals = [
//   //         assignmentId,
//   //         transformedForm.route_id,
//   //         transformedForm.departure_time,
//   //         transformedForm.expected_arrival,
//   //         transformedForm.status || "planned",
//   //         transformedForm.note || "",
//   //         transformedForm.trm_data.bl_number || null,
//   //         transformedForm.trm_data.gd_number || null,
//   //         transformedForm.trm_data.vir_number || null,
//   //       ];

//   //       const tripPlaceholders = tripVals
//   //         .map((_, index) => `$${index + 1}`)
//   //         .join(", ");
//   //       const insertTripQuery = `
//   //         INSERT INTO trips (${tripCols.join(", ")})
//   //         VALUES (${tripPlaceholders})
//   //         RETURNING id
//   //       `;

//   //       const tripResult = await client.query(insertTripQuery, tripVals);
//   //       tripId = tripResult.rows[0].id;
//   //       console.log(`Trip created with ID: ${tripId}`);

//   //       // 3) ASSIGN DRIVER TO VEHICLE
//   //       console.log("Step 3: Processing driver-vehicle assignment...");

//   //       let vehicleId = null;

//   //       // Check if vehicle_id was provided directly, otherwise get from PMD
//   //       if (transformedForm.vehicle_id) {
//   //         vehicleId = transformedForm.vehicle_id;
//   //         console.log(`Using provided vehicle ID: ${vehicleId}`);
//   //       } else {
//   //         // Get vehicle_id from PMD record
//   //         const vehicleResult = await client.query(
//   //           "SELECT vehicle_id FROM pmd_devices WHERE id = $1",
//   //           [transformedForm.pmd_id]
//   //         );

//   //         if (!vehicleResult.rows.length || !vehicleResult.rows[0].vehicle_id) {
//   //           console.log(
//   //             `No vehicle linked to PMD ${transformedForm.pmd_id}, continuing without vehicle assignment`
//   //           );
//   //         } else {
//   //           vehicleId = vehicleResult.rows[0].vehicle_id;
//   //           console.log(`Found vehicle ID from PMD: ${vehicleId}`);
//   //         }
//   //       }

//   //       const driverId = transformedForm.driver_id;

//   //       // Only proceed if BOTH IDs are provided
//   //       if (vehicleId && driverId) {
//   //         // Check if vehicle already has an active driver
//   //         const activeVehicleDriver = await client.query(
//   //           "SELECT 1 FROM vehicle_driver_assignments WHERE vehicle_id = $1 AND end_time IS NULL",
//   //           [vehicleId]
//   //         );

//   //         if (activeVehicleDriver.rows.length > 0) {
//   //           await client.query("ROLLBACK");
//   //           return res.status(409).json({
//   //             success: false,
//   //             message: `Vehicle ${vehicleId} already has an active driver assignment`,
//   //           });
//   //         }

//   //         // Check if driver is already assigned elsewhere
//   //         const activeDriverVehicle = await client.query(
//   //           "SELECT 1 FROM vehicle_driver_assignments WHERE driver_id = $1 AND end_time IS NULL",
//   //           [driverId]
//   //         );

//   //         if (activeDriverVehicle.rows.length > 0) {
//   //           await client.query("ROLLBACK");
//   //           return res.status(409).json({
//   //             success: false,
//   //             message: `Driver ${driverId} already has an active vehicle assignment`,
//   //           });
//   //         }

//   //         // Create new driver-vehicle assignment
//   //         const vdaResult = await client.query(
//   //           `INSERT INTO vehicle_driver_assignments 
//   //            (vehicle_id, driver_id, start_time, end_time)
//   //            VALUES ($1, $2, $3, $4)
//   //            RETURNING id`,
//   //           [
//   //             vehicleId,
//   //             driverId,
//   //             transformedForm.departure_time,
//   //             transformedForm.end_time || null,
//   //           ]
//   //         );
//   //         vdaId = vdaResult.rows[0].id;
//   //         console.log(`Driver-vehicle assignment created with ID: ${vdaId}`);
//   //       } else {
//   //         console.log(
//   //           `Skipping driver-vehicle assignment. Vehicle ID: ${vehicleId}, Driver ID: ${driverId}`
//   //         );
//   //       }

//   //       // 4) INSERT trip halts
//   //       console.log("Step 4: Processing trip halts...");

//   //       const haltsRaw = transformedForm.halts || form.halts || "[]";
//   //       let halts: any[] = [];

//   //       try {
//   //         halts =
//   //           typeof haltsRaw === "string" ? JSON.parse(haltsRaw) : haltsRaw;
//   //       } catch (error) {
//   //         console.log("No valid halts data provided, continuing without halts");
//   //         halts = [];
//   //       }

//   //       for (const halt of halts) {
//   //         await client.query(
//   //           `INSERT INTO trip_halts 
//   //            (trip_id, route_stop_id, scheduled_halt_duration, actual_halt_duration)
//   //            VALUES ($1, $2, $3, $4)`,
//   //           [
//   //             tripId,
//   //             halt.route_stop_id,
//   //             halt.scheduled_halt_duration,
//   //             halt.actual_halt_duration || "00:00:00",
//   //           ]
//   //         );
//   //       }
//   //       console.log(`${halts.length} trip halts created`);

//   //       // 5) Create trip log entry
//   //       console.log("Step 5: Creating trip log...");

//   //       // Fetch assignment details for logging
//   //       const assignmentDetails = await client.query(
//   //         `SELECT assigned_at, detached_at, pmd_img_url, csd_img_url, eseal_img_url
//   //          FROM pmd_csd_assignments WHERE id = $1`,
//   //         [assignmentId]
//   //       );

//   //       const {
//   //         assigned_at,
//   //         detached_at,
//   //         pmd_img_url,
//   //         csd_img_url,
//   //         eseal_img_url,
//   //       } = assignmentDetails.rows[0];

//   //       const logCols = [
//   //         "assignment_id",
//   //         "pmd_id",
//   //         "csd_id",
//   //         "eseal_id",
//   //         "route_id",
//   //         "departure_time",
//   //         "expected_arrival",
//   //         "assigned_at",
//   //         "detached_at",
//   //         "pmd_img_url",
//   //         "csd_img_url",
//   //         "eseal_img_url",
//   //         "trip_id",
//   //         "status",
//   //         "note",
//   //         "vehicle_id",
//   //         "driver_id",
//   //         "vda_id",
//   //         "driver_start",
//   //         "driver_end",
//   //       ];

//   //       const logVals = [
//   //         assignmentId,
//   //         transformedForm.pmd_id,
//   //         transformedForm.csd_id,
//   //         transformedForm.eseal_id,
//   //         transformedForm.route_id,
//   //         transformedForm.departure_time,
//   //         transformedForm.expected_arrival,
//   //         assigned_at,
//   //         detached_at,
//   //         pmd_img_url,
//   //         csd_img_url,
//   //         eseal_img_url,
//   //         tripId,
//   //         transformedForm.status || "planned",
//   //         transformedForm.note || "",
//   //         vehicleId || null,
//   //         transformedForm.driver_id || null,
//   //         vdaId || null,
//   //         transformedForm.departure_time || null,
//   //         transformedForm.end_time || null,
//   //       ];

//   //       const logPlaceholders = logVals
//   //         .map((_, index) => `$${index + 1}`)
//   //         .join(", ");
//   //       const tripLogResult = await client.query(
//   //         `INSERT INTO trip_logs (${logCols.join(
//   //           ", "
//   //         )}) VALUES (${logPlaceholders})
//   //         RETURNING id`,
//   //         logVals
//   //       );
//   //       const tripLogId = tripLogResult.rows[0].id;
//   //       console.log(`Trip log created with ID: ${tripLogId}`);

//   //       // Insert into public.add_trip_col
//   //       console.log("Step 5.1: Creating add_trip_col record...");
//   //       const addTripColQuery = `
//   //         INSERT INTO public.add_trip_col (
//   //           container_id,
//   //           carrier_id,
//   //           trip_log_id,
//   //           gd_no,
//   //           trip_type
//   //         ) VALUES ($1, $2, $3, $4, $5)
//   //         RETURNING id
//   //       `;

//   //       const addTripColVals = [
//   //         transformedForm.container_id || null,
//   //         transformedForm.carrier_id || null,
//   //         tripLogId,  // Now using the correct trip_log_id
//   //         transformedForm.trm_data.gd_number || null,
//   //         transformedForm.trm_data.declaration_type || null
//   //       ];

//   //       await client.query(addTripColQuery, addTripColVals);
//   //       console.log('✅ Additional trip columns created in add_trip_col table');

//   //       // Commit transaction
//   //       await client.query("COMMIT");
//   //       console.log("Trip creation completed successfully");

//   //       return res.status(201).json({
//   //         success: true,
//   //         message: "Trip created successfully",
//   //         data: {
//   //           assignment_id: assignmentId,
//   //           trip_id: tripId,
//   //           vehicle_driver_assignment_id: vdaId,
//   //           vehicle_id: vehicleId,
//   //           driver_id: transformedForm.driver_id || null,
//   //         },
//   //       });
//   //     } catch (error) {
//   //       // Rollback transaction
//   //       console.log("\n🚨 TRANSACTION ROLLBACK INITIATED");
//   //       console.log("=========================================");

//   //       try {
//   //         await client.query("ROLLBACK");
//   //         console.log("✅ Transaction rolled back successfully");
//   //       } catch (rollbackError) {
//   //         console.log("❌ Error during rollback:", rollbackError);
//   //       }

//   //       const pgError = error as { 
//   //         constraint?: string;
//   //         detail?: string;
//   //         hint?: string;
//   //       };

//   //       if (pgError.constraint) {
//   //         console.log(`   • Constraint Violation: ${pgError.constraint}`);
//   //       }

//   //       if (pgError.detail) {
//   //         console.log(`   • Error Detail: ${pgError.detail}`);
//   //       }

//   //       if (pgError.hint) {
//   //         console.log(`   • Error Hint: ${pgError.hint}`);
//   //       }


//   //       // Log current state for debugging
//   //       console.log("\n📊 DEBUG STATE INFORMATION");
//   //       console.log("=========================================");
//   //       console.log(`   • Assignment ID: ${assignmentId}`);
//   //       console.log(`   • Trip ID: ${tripId}`);
//   //       console.log(`   • VDA ID: ${vdaId}`);
//   //       console.log(`   • Request ID: ${requestId}`);

//   //       throw error;
//   //     } finally {
//   //       client.release();
//   //     }
//   //   } catch (error) {
//   //     console.error("Error in createTrip:", error);
//   //     return res.status(500).json({
//   //       success: false,
//   //       message: "Internal server error",
//   //       error:
//   //         error instanceof Error ? error.message : "Unknown error occurred",
//   //     });
//   //   }
//   // }

//   // New function to get configured PMD devices
//   static async getConfiguredPMDDevices(req: Request, res: Response) {
//     try {
//       const client = await pool.connect();
//       const result = await client.query(
//         `SELECT pd.id, pd.imei, pd.sim1_number, pd.operator1, pd.sim2_number, pd.operator2,
//                 pd.tracker_model, pd.network, pd.firmware_version, pd.purchase_date,
//                 pd.next_invoice_date, pd.vehicle_id, v.registration_number AS vehicle_registration,
//                 pd.created_at, pd.updated_at
//         FROM pmd_devices pd
//         LEFT JOIN vehicles v ON pd.vehicle_id = v.id
//         ORDER BY pd.id
//          LIMIT 10`
//       );
//       client.release();
//       return res.status(200).json({
//         success: true,
//         count: result.rows.length,
//         data: result.rows,
//       });
//     } catch (error) {
//       console.error("Error fetching configured PMD devices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }

//   static async getConfiguredCSDDevices(req: Request, res: Response) {
//     try {
//       const client = await pool.connect();
//       const result = await client.query(
//         `SELECT cd.id, cd.imei, cd.sim1_number, cd.operator1, cd.sim2_number, cd.operator2,
//                 cd.tracker_model, cd.network, cd.last_updated, cd.container_id,
//                 c.plate_number AS container_plate, c.type AS container_type,
//                 cd.created_at, cd.updated_at, cd.device_id, cd.vts_id,
//                 cd.firmware_version, cd.purchase_date, cd.next_invoice_date,
//                 cd.configuration_date, cd.ready_to_install
//         FROM csd_devices cd
//         LEFT JOIN containers c ON cd.container_id = c.id
//         ORDER BY cd.id
//          LIMIT 10`
//       );
//       client.release();
//       return res.status(200).json({
//         success: true,
//         count: result.rows.length,
//         data: result.rows,
//       });
//     } catch (error) {
//       console.error("Error fetching configured CSD devices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }
//   // Search configured PMD devices
//   static async searchConfiguredPMDDevices(req: Request, res: Response) {
//     try {
//       // Accept imei either as a query parameter (?imei=...) or as a path param (/search/:imei)
//       const imei = (req.query.imei || req.params.imei) as string | undefined;

//       // Validate search parameter
//       if (!imei || typeof imei !== "string") {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Search parameter 'imei' is required (query ?imei= or path /:imei) and must be a string",
//         });
//       }

//       const client = await pool.connect();

//       try {
//         let query = `SELECT pd.id, pd.imei, pd.sim1_number, pd.operator1, pd.sim2_number, pd.operator2,
//                      pd.tracker_model, pd.network, pd.firmware_version, pd.purchase_date,
//                      pd.next_invoice_date, pd.vehicle_id, v.registration_number AS vehicle_registration,
//                      pd.created_at, pd.updated_at
//              FROM pmd_devices pd
//              LEFT JOIN vehicles v ON pd.vehicle_id = v.id`;

//         const conditions = [];
//         const values = [];
//         let paramIndex = 1;

//         if (imei) {
//           conditions.push(`pd.imei ILIKE $${paramIndex}`);
//           values.push(`%${imei}%`);
//           paramIndex++;
//         }

//         if (conditions.length > 0) {
//           query += " WHERE " + conditions.join(" AND ");
//         }

//         query += " ORDER BY pd.id";

//         // Debug logging
//         console.log("PMD Search Debug:");
//         console.log("IMEI parameter:", imei);
//         console.log("SQL Query:", query);
//         console.log("Query values:", values);

//         const result = await client.query(query, values);

//         console.log("Query result rows:", result.rows.length);
//         if (result.rows.length > 0) {
//           console.log("First row IMEI:", result.rows[0].imei);
//         }

//         return res.status(200).json({
//           success: true,
//           count: result.rows.length,
//           data: result.rows,
//           searchQuery: imei,
//           message:
//             result.rows.length > 0
//               ? `Found ${result.rows.length} configured PMD devices matching "${imei}"`
//               : `No configured PMD devices found matching "${imei}"`,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error searching configured PMD devices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }

//   // Search configured CSD devices
//   static async searchConfiguredCSDDevices(req: Request, res: Response) {
//     try {
//       // Accept imei either as a query parameter (?imei=...) or as a path param (/search/:imei)
//       const imei = (req.query.imei || req.params.imei) as string | undefined;

//       // Validate search parameter
//       if (!imei || typeof imei !== "string") {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Search parameter 'imei' is required (query ?imei= or path /:imei) and must be a string",
//         });
//       }

//       const client = await pool.connect();

//       try {
//         let query = `SELECT cd.id, cd.imei, cd.sim1_number, cd.operator1, cd.sim2_number, cd.operator2,
//                      cd.tracker_model, cd.network, cd.last_updated, cd.container_id,
//                      c.plate_number AS container_plate, c.type AS container_type,
//                      cd.created_at, cd.updated_at, cd.device_id, cd.vts_id,
//                      cd.firmware_version, cd.purchase_date, cd.next_invoice_date,
//                      cd.configuration_date, cd.ready_to_install
//              FROM csd_devices cd
//              LEFT JOIN containers c ON cd.container_id = c.id`;

//         const conditions = [];
//         const values = [];
//         let paramIndex = 1;

//         if (imei) {
//           conditions.push(`cd.imei ILIKE $${paramIndex}`);
//           values.push(`%${imei}%`);
//           paramIndex++;
//         }

//         if (conditions.length > 0) {
//           query += " WHERE " + conditions.join(" AND ");
//         }

//         query += " ORDER BY cd.id";

//         // Debug logging
//         console.log("CSD Search Debug:");
//         console.log("IMEI parameter:", imei);
//         console.log("SQL Query:", query);
//         console.log("Query values:", values);

//         const result = await client.query(query, values);

//         console.log("Query result rows:", result.rows.length);
//         if (result.rows.length > 0) {
//           console.log("First row IMEI:", result.rows[0].imei);
//         }

//         return res.status(200).json({
//           success: true,
//           count: result.rows.length,
//           data: result.rows,
//           searchQuery: imei,
//           message:
//             result.rows.length > 0
//               ? `Found ${result.rows.length} configured CSD devices matching "${imei}"`
//               : `No configured CSD devices found matching "${imei}"`,
//         });
//       } finally {
//         client.release();
//       }
//     } catch (error) {
//       console.error("Error searching configured CSD devices:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     }
//   }
// }

// export default TripController;
