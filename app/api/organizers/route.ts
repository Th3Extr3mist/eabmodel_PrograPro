// app/api/organizers/route.ts
import { NextResponse } from "next/server";
import prisma from "../../backend/config/prisma";

export async function GET() {
  try {
    const organizers = await prisma.organizer.findMany({
      select: { organizer_id: true, organizer_name: true }
    });
    return NextResponse.json(organizers);
  } catch (error) {
    console.error("Error GET /api/organizers:", error);
    return NextResponse.json(
      { message: "No se pudieron cargar organizadores" },
      { status: 500 }
    );
  }
}
