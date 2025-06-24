import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/app/backend/middleware/AuthMiddleware";
import prisma from "@/app/backend/config/prisma";

export async function GET(req: NextRequest) {
  try {
    const { user_id } = getUserFromToken(req);

    const reservations = await prisma.reservation.findMany({
      where: { user_id },
      include: { eventinfo: true },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or internal error" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id } = getUserFromToken(req);
    const { eventId } = await req.json();

    const reservation = await prisma.reservation.create({
      data: {
        event_id: eventId,
        user_id,
        ticket_quantity: 1,
        reservation_date: new Date(),
        status: "active",
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user_id } = getUserFromToken(req);
    const { eventId } = await req.json();

    await prisma.reservation.deleteMany({
      where: {
        user_id,
        event_id: eventId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
  }
}