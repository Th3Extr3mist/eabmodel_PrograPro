import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  // Rutas protegidas
  const protectedRoutes = ["/frontend/eventos", "/frontend/organize"];
  // Rutas de autenticación
  const authRoutes = ["/frontend/login", "/frontend/register"];

  // Si el usuario está autenticado y trata de acceder a login/register
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/frontend/eventos", request.url));
  }

  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/frontend/login", request.url));
  }

  return NextResponse.next();
}
﻿