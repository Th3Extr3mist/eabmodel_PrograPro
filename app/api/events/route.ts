import { NextRequest, NextResponse } from 'next/server';
import { EventController } from '../../backend/controllers/event_controller';

export async function POST(req: NextRequest) {
  return EventController.create(req);
}

export async function GET(req: NextRequest) {
  return EventController.getAll();
}