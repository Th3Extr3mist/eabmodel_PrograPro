import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EventService } from '../services/event_service';
import { CreateEventDto, UpdateEventDto } from '../dtos/event_dto';
import { isIntString } from '../utils/validators';

export class EventController {
  /** POST /api/events */
  static async create(req: NextRequest) {
    try {
      const body = await req.json();
      const dto  = plainToInstance(CreateEventDto, body);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(', ')
        }));
        return NextResponse.json(
          { message: 'Validación fallida', errors: msgs },
          { status: 400 }
        );
      }
      const ev = await EventService.create(dto);
      return NextResponse.json(ev, { status: 201 });
    } catch (error: any) {
      console.error('[EVENT_CONTROLLER] Create error:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: 'Violación de unique constraint' }, { status: 409 });
      }
      if (error.name === 'PrismaClientValidationError') {
        return NextResponse.json(
          { message: 'Error de validación en Prisma', details: error.message },
          { status: 400 }
        );
      }
      // error lanzado por validateRelations (organizador/ubicación no existe)
      if (error.message === 'Organizador no existe' || error.message === 'Ubicación no existe') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
  }

  /** GET /api/events */
  static async getAll() {
    const all = await EventService.getAll();
    return NextResponse.json(all);
  }

  /** GET /api/events/:id */
  static async getById(idStr: string) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    const ev = await EventService.getById(+idStr);
    if (!ev) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(ev);
  }

  /** PATCH /api/events/:id */
  static async update(idStr: string, req: NextRequest) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    try {
      const body = await req.json();
      const dto  = plainToInstance(UpdateEventDto, body);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(', ')
        }));
        return NextResponse.json(
          { message: 'Validación fallida', errors: msgs },
          { status: 400 }
        );
      }
      const ev = await EventService.update(+idStr, dto);
      return NextResponse.json(ev);
    } catch (error) {
      console.error('[EVENT_CONTROLLER] Update error:', error);
      return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
  }

  /** DELETE /api/events/:id */
  static async delete(idStr: string) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    try {
      await EventService.delete(+idStr);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[EVENT_CONTROLLER] Delete error:', error);
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }
  }
}
