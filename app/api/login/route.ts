import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Configura la conexión a la base de datos en Neon 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Clave secreta para firmar los tokens JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

// Maneja peticiones POST al endpoint (login)
export async function POST(request: Request) {
  try {
    // Extrae el email y password enviados desde el frontend
    const { email, password } = await request.json();

    // Conecta a la base de datos
    const client = await pool.connect();

    // Busca el usuario por su email en la tabla AppUser
    const query = "SELECT * FROM AppUser WHERE email = $1";
    const result = await client.query(query, [email]);

    // Libera el cliente de la base de datos
    client.release();

    // Si no se encontró ningún usuario con ese email, devuelve error
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Compara la contraseña proporcionada con la almacenada (⚠️ debería usarse hash)
    if (password !== user.user_password) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Crea un token JWT con el ID y email del usuario, válido por 1 hora
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Serializa el token como una cookie segura
    const serializedToken = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/", 
    });

    // Prepara la respuesta incluyendo datos del usuario (sin la contraseña)
    const response = NextResponse.json(
      { success: true, user: { id: user.user_id, email: user.email } },
      { status: 200 }
    );

    // Añade la cookie de autenticación a la respuesta
    response.headers.set("Set-Cookie", serializedToken);
    return response;
  } catch (error) {
    // Maneja errores del servidor
    console.error("Error al autenticar:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}