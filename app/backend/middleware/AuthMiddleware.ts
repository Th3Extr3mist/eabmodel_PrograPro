// backend/middleware/AuthMiddleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function getUserFromToken(req: NextRequest) {
  // Obtener el token del encabezado de autorización
  const token = req.headers.get("authorization")?.split(" ")[1]; // Ejemplo: "Bearer <token>"
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    // Verificar y decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string); // Usamos la variable de entorno correcta
    return decoded;
  } catch (err) {
    console.error("Error al verificar el token:", err);
    throw new Error("Token inválido o expirado");
  }
}
