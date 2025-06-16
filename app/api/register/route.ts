import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Configura la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Clave secreta para JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

if (!process.env.JWT_SECRET_KEY) {
  console.warn("ADVERTENCIA: Se está usando una clave JWT por defecto. Esto es inseguro en producción.");
}

// Maneja peticiones POST para registro
export async function POST(request: Request) {
  try {
    const { user_name, email, user_password } = await request.json();

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

      // Encripta la contraseña
      const hashedPassword = await bcrypt.hash(user_password, 10);

      // Inserta el nuevo usuario
      const insertUser = await client.query(
        `INSERT INTO AppUser (user_name, email, user_password)
         VALUES ($1, $2, $3)
         RETURNING user_id, email`,
        [user_name, email, hashedPassword]
      );

      const newUser = insertUser.rows[0];

      // Genera el token JWT
      const token = jwt.sign(
        { userId: newUser.user_id, email: newUser.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60,
        path: "/",
      };

      const serializedToken = serialize("authToken", token, cookieOptions);

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
