"use strict";
const { Pool } = require("pg");
require("dotenv").config();
// Main connection pool for queries
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
    // ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 100000,
});
// Dedicated connection for LISTEN/NOTIFY
const notificationPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ssl: false
    ssl: {
        rejectUnauthorized: false,
    }, // Only one connection needed for notifications
});
pool.on("connect", (client) => {
    console.log("✅ Connected to PostgreSQL database");
});
pool.on("error", (err, client) => {
    console.error("❌ Database connection error:", err);
});
// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("🔄 Closing database connections...");
    await pool.end();
    await notificationPool.end();
    process.exit(0);
});
module.exports = {
    pool,
    notificationPool,
};
