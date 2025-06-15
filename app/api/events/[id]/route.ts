// app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { EventController } from "../../../backend/controllers/event_controller";

// Solución 1: Usar NextRequest en lugar de Request
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  return EventController.getById(id);
}

// Solución 2: Definir una interfaz personalizada para el contexto
interface RouteHandlerContext {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, context: RouteHandlerContext) {
  const { id } = context.params;
  return EventController.update(id, req);
}

export async function DELETE(req: NextRequest, context: RouteHandlerContext) {
  const { id } = context.params;
  return EventController.delete(id);
}