import {pool} from "../config/db"; // ✅ your DB connection pool

export type DbTrmFile = {
  id: string; // UUID
  date: Date;
  iso: Date;
  filename: string;
  json_data: Record<string, any>;
};

export class TrmFileModel {
  // ➕ Create new TRM file record
  static async create(input: {
    date: Date;
    iso: Date;
    filename: string;
    json_data: Record<string, any>;
  }): Promise<DbTrmFile> {
    const { date, iso, filename, json_data } = input;
    const { rows } = await pool.query(
      `INSERT INTO trm_files (date, iso, filename, json_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [date, iso, filename, json_data]
    );
    return rows[0];
  }

  // ➕ Fetch all TRM file records
  static async findAll(): Promise<DbTrmFile[]> {
    const { rows } = await pool.query(`SELECT * FROM trm_files ORDER BY date DESC;`);
    return rows;
  }
  
}




export default TrmFileModel;
