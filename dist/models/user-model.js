"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
// Update the import path if necessary, for example:
const db_1 = require("../config/db"); // or the correct relative path to your db.ts file
const getAllUsers = async () => {
    const result = await db_1.pool.query('SELECT id, name, email FROM users');
    return result.rows;
};
exports.getAllUsers = getAllUsers;
