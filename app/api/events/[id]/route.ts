// app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { EventController } from "../../../backend/controllers/event_controller";

// Usamos los parámetros sin necesidad de `await`
// El `context.params` ya contiene el id
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;  // Se agrega el 'await' para obtener el parámetro correctamente
  return EventController.getById(id);  // Llamada al controlador con el ID
}

interface RouteHandlerContext {
  params: {
    id: string;
  };
}

// Update handler
export async function PUT(req: NextRequest, context: RouteHandlerContext) {
  const { id } = context.params;
  return EventController.update(id, req);
}

// Delete handler
export async function DELETE(req: NextRequest, context: RouteHandlerContext) {
  const { id } = context.params;
  return EventController.delete(id);
}
