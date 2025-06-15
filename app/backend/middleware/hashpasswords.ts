// hashPasswords.ts
import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function isHashed(password: string): Promise<boolean> {
  return password.startsWith("$2b$") || password.startsWith("$2a$") || password.startsWith("$2y$");
}

async function hashExistingPasswords() {
  try {
    const res = await pool.query(`SELECT user_id, user_password FROM "appuser"`);

    for (const row of res.rows) {
      const { user_id, user_password } = row;

      if (await isHashed(user_password)) {
        console.log(`Usuario ${user_id}: ya tiene contraseña hasheada.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user_password, 10);

      await pool.query(
        `UPDATE "appuser" SET user_password = $1 WHERE user_id = $2`,
        [hashedPassword, user_id]
      );

      console.log(`✅ Usuario ${user_id}: contraseña hasheada correctamente.`);
    }
  } catch (error) {
    console.error("❌ Error actualizando contraseñas:", error);
  } finally {
    await pool.end();
  }
}

hashExistingPasswords();