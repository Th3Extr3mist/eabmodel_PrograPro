import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import fs from 'fs';
import path from 'path';
import { EventService } from '../services/event_service';
import { CreateEventDto, UpdateEventDto } from '../dtos/event_dto';
import { isIntString } from '../utils/validators';

export class EventController {
  /** POST /api/events */
  static async create(req: NextRequest) {
    try {
      const formData = await req.formData();
      const dtoRaw: Record<string, any> = {};
      // Define fields por tipo
      const strFields = ['event_name', 'event_date', 'description', 'start_time', 'end_time'];
      const intFields = ['organizer_id', 'location_id', 'availability'];
      const floatFields = ['price', 'lat', 'lng'];

      // Parse texto
      for (const field of strFields) {
        const val = formData.get(field);
        dtoRaw[field] = typeof val === 'string' ? val : '';
      }
      // Parse enteros
      for (const field of intFields) {
        const val = formData.get(field);
        dtoRaw[field] = val !== null ? parseInt(val.toString(), 10) : null;
      }
      // Parse flotantes
      for (const field of floatFields) {
        const val = formData.get(field);
        dtoRaw[field] = val !== null ? parseFloat(val.toString()) : null;
      }

      // Procesar imagen si existe
      const file = formData.get('image');
      if (file && typeof (file as any).arrayBuffer === 'function') {
        const imageFile = file as File;
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `${Date.now()}-${imageFile.name}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, buffer);
        dtoRaw.image = `/uploads/${filename}`;
      }

      // Validación DTO
      const dto = plainToInstance(CreateEventDto, dtoRaw);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map(e => ({ field: e.property, message: Object.values(e.constraints || {}).join(', ') }));
        return NextResponse.json({ message: 'Validación fallida', errors: msgs }, { status: 400 });
      }

      const ev = await EventService.create(dto);
      return NextResponse.json(ev, { status: 201 });
    } catch (error: any) {
      console.error('[EVENT_CONTROLLER] Create error:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: 'Violación de unique constraint' }, { status: 409 });
      }
      if (error.name === 'PrismaClientValidationError') {
        return NextResponse.json({ message: 'Error de validación en Prisma', details: error.message }, { status: 400 });
      }
      if (error.message === 'Organizador no existe' || error.message === 'Ubicación no existe') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
  }

  /** GET /api/events */
  static async getAll() {
    try {
      const all = await EventService.getAll();
      return NextResponse.json(all);
    } catch (error) {
      console.error('[EVENT_CONTROLLER] GetAll error:', error);
      return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
  }

  /** GET /api/events/:id */
  static async getById(idStr: string) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    try {
      const ev = await EventService.getById(+idStr);
      if (!ev) {
        return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
      }
      return NextResponse.json(ev);
    } catch (error) {
      console.error('[EVENT_CONTROLLER] GetById error:', error);
      return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
  }

  /** PATCH /api/events/:id */
  static async update(idStr: string, req: NextRequest) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    try {
      const body = await req.json();
      const dto = plainToInstance(UpdateEventDto, body);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map(e => ({ field: e.property, message: Object.values(e.constraints || {}).join(', ') }));
        return NextResponse.json({ message: 'Validación fallida', errors: msgs }, { status: 400 });
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
