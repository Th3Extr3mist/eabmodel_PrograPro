import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import bcrypt from "bcrypt";

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

// Maneja peticiones POST para login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const query = "SELECT user_id, email, user_password FROM AppUser WHERE email = $1";
      const result = await client.query(query, [email]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Credenciales incorrectas" },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.user_password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Credenciales incorrectas" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
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
          user: { 
            id: user.user_id, 
            email: user.email 
          } 
        },
        { status: 200 }
      );

      response.headers.append("Set-Cookie", serializedToken);
      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error al autenticar:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}