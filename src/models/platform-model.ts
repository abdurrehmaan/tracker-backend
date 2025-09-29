import { pool } from "../config/db"; // ✅ named import

type DbPlatform = {
  id: number;
  code: string;
  name: string;
};

export class Platform {
  static async getPlatformByName(name: string): Promise<DbPlatform | null> {
    const { rows } = await pool.query(
      "SELECT * FROM platforms WHERE name = $1 LIMIT 1",
      [name]
    );
    return rows[0] ?? null;
  }

  static async getPlatformByCode(code: string): Promise<DbPlatform | null> {
    const { rows } = await pool.query(
      "SELECT * FROM platforms WHERE code = $1 LIMIT 1",
      [code]
    );
    return rows[0] ?? null;
  }

  static async createPlatform(input: { code: string; name: string }) {
    const { code, name = true } = input;
    const { rows } = await pool.query(
      `INSERT INTO platforms (code, name)
       VALUES ($1, $2)
       RETURNING *;`,
      [code, name]
    );
    return rows[0];
  }

  static async updatePlatform(
    id: number,
    input: { code: string; name: string }
  ) {
    const { code, name } = input;
    const { rows } = await pool.query(
      `UPDATE platforms
       SET code = $1, name = $2
       WHERE id = $3
       RETURNING *;`,
      [code, name, id]
    );
    return rows[0];
  }

  static async deletePlatform(id: number) {
    const { rows } = await pool.query(
      `DELETE FROM platforms
       WHERE id = $1
       RETURNING *;`,
      [id]
    );
    return rows[0];
  }

  static async getAllPlatforms(): Promise<DbPlatform[]> {
    const { rows } = await pool.query(`SELECT * FROM platforms;`);
    return rows;
  }

  static async getPlatformById(id: number): Promise<DbPlatform | null> {
    const { rows } = await pool.query(
      `SELECT * FROM platforms WHERE id = $1 LIMIT 1;`,
      [id]
    );
    return rows[0] ?? null;
  }
}
export default Platform;
