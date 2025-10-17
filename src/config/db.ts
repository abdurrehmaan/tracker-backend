import { Pool, PoolClient } from "pg"; // Import only necessary methods and types
require("dotenv").config();

// Main connection pool for queries
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10), // Ensure DB port is a number
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 100000,
});
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || '5432', 10), // Ensure DB port is a number
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: false,  // Handle SSL for secure connections
//   },
//   connectionTimeoutMillis: 10000,
//   idleTimeoutMillis: 100000,
// });

// Dedicated connection for LISTEN/NOTIFY
const notificationPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  }, // Only one connection needed for notifications
});

// Log successful connection
pool.on("connect", (client: PoolClient) => {
  console.log("✅ Connected to PostgreSQL database");
});

// Log errors
pool.on("error", (err: Error, client: any) => {
  console.error("❌ Database connection error:", err);
});

// Graceful shutdown when the app is stopped
process.on("SIGINT", async () => {
  console.log("🔄 Closing database connections...");
  await pool.end();
  await notificationPool.end();
  process.exit(0);
});

// Exporting the pool and notificationPool to be used in other files
export { pool, notificationPool };
