import { NextRequest, NextResponse } from 'next/server';
import { EventController } from '../../../backend/controllers/event_controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return EventController.getById(params.id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return EventController.update(params.id, req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return EventController.delete(params.id);
}