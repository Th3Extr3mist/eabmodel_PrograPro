import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Clave secreta JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

if (!process.env.JWT_SECRET_KEY) {
  console.warn("ADVERTENCIA: Se está usando una clave JWT por defecto. Esto es inseguro en producción.");
}

// Manejo de la petición POST (registro)
export async function POST(request: Request) {
  try {
    const {
      user_name,
      email,
      user_password,
      preference_1,
      preference_2,
      preference_3,
    } = await request.json();

    if (!email || !user_password || !user_name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Verifica si el email ya está registrado
      const checkUser = await client.query(
        "SELECT * FROM AppUser WHERE email = $1",
        [email]
      );

      if (checkUser.rows.length > 0) {
        return NextResponse.json(
          { error: "El correo ya está registrado" },
          { status: 400 }
        );
      }

      // Hashea la contraseña
      const hashedPassword = await bcrypt.hash(user_password, 10);

      // Inserta el nuevo usuario con preferencias
      const insertUser = await client.query(
        `INSERT INTO AppUser (
          user_name, email, user_password,
          preference_1, preference_2, preference_3
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, email`,
        [user_name, email, hashedPassword, preference_1, preference_2, preference_3]
      );

      const newUser = insertUser.rows[0];

      // Genera el token JWT
      const token = jwt.sign(
        { user_id: newUser.user_id, email: newUser.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Configura la cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60, // 1 hora
        path: "/",
      };

      const serializedToken = serialize("authToken", token, cookieOptions);

      // Devuelve la respuesta con la cookie
      const response = NextResponse.json(
        {
          success: true,
          token,
          user: {
            id: newUser.user_id,
            email: newUser.email,
          }
        },
        { status: 201 }
      );

      response.headers.append("Set-Cookie", serializedToken);
      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
