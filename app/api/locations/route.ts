// app/api/locations/route.ts
import { NextResponse } from "next/server";
import prisma from "../../backend/config/prisma";  // ajusta si tu prisma.ts está en otra ruta

export async function GET() {
  try {
    const locations = await prisma.eventlocation.findMany({
      select: { location_id: true, address: true }
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error GET /api/locations:", error);
    return NextResponse.json(
      { message: "Error al obtener ubicaciones" },
      { status: 500 }
    );
  }
}
