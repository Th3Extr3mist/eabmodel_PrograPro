// backend/controllers/event_controller.ts

import { NextResponse } from "next/server";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";
import { EventService } from "../services/event_service";
import { CreateEventDto, UpdateEventDto } from "../dtos/event_dto";
import { isIntString } from "../utils/validators";

export class EventController {
  /** POST /api/events */
  static async create(req: Request) {
    try {
      const formData = await req.formData();
      const dtoRaw: Record<string, any> = {};

      // Campos de tipo string
      const strFields = ["event_name", "event_date", "description", "preference_1", "preference_2", "preference_3", "weather_preference", "start_time", "end_time"];
      // Campos de tipo entero
      const intFields = ["organizer_id", "location_id", "availability"];
      // Campos de tipo flotante
      const floatFields = ["price", "lat", "lng"];

      // Parseo de campos string
      for (const field of strFields) {
        const val = formData.get(field);
        dtoRaw[field] = typeof val === "string" ? val : "";
      }

      // Parseo de campos enteros (solo si están presentes)
      for (const field of intFields) {
        const val = formData.get(field);
        if (val !== null && val !== "") {
          dtoRaw[field] = parseInt(val.toString(), 10);
        }
      }

      // Parseo de campos flotantes (solo si están presentes)
      for (const field of floatFields) {
        const val = formData.get(field);
        if (val !== null && val !== "") {
          dtoRaw[field] = parseFloat(val.toString());
        }
      }

      // Procesar imagen si existe
      const file = formData.get("image");
      if (file && typeof (file as any).arrayBuffer === "function") {
        const imageFile = file as File;
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `${Date.now()}-${imageFile.name}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, buffer);
        dtoRaw.image = `/uploads/${filename}`;
      }

      // Validación de campos obligatorios manuales
      if (!dtoRaw.organizer_id || !dtoRaw.location_id) {
        return NextResponse.json({
          message: "organizer_id y location_id son requeridos"
        }, { status: 400 });
      }

      // Validación del DTO
      const dto = plainToInstance(CreateEventDto, dtoRaw);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map((e) => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(", "),
        }));
        return NextResponse.json({ message: "Validación fallida", errors: msgs }, { status: 400 });
      }

      // Llamada al servicio para crear el evento
      const ev = await EventService.create(dto);
      return NextResponse.json(ev, { status: 201 });
    } catch (error: any) {
      console.error("[EVENT_CONTROLLER] Create error:", error);
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Violación de unique constraint" }, { status: 409 });
      }
      if (error.name === "PrismaClientValidationError") {
        return NextResponse.json({ message: "Error de validación en Prisma", details: error.message }, { status: 400 });
      }
      if (error.message === "Organizador no existe" || error.message === "Ubicación no existe") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
  }

  /** GET /api/events */
  static async getAll() {
    try {
      const all = await EventService.getAll();
      return NextResponse.json(all);
    } catch (error) {
      console.error("[EVENT_CONTROLLER] GetAll error:", error);
      return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
  }

  /** GET /api/events/:id */
  static async getById(idStr: string) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    try {
      const idNum = +idStr;
      const ev = await EventService.getById(idNum);
      if (!ev) {
        return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
      }
      return NextResponse.json(ev);
    } catch (error) {
      console.error("[EVENT_CONTROLLER] GetById error:", error);
      return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
  }

  /** PATCH /api/events/:id */
  static async update(idStr: string, req: Request) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    try {
      const formData = await req.formData();
      const dtoRaw: Record<string, any> = {};

      // Campos de tipo string
      const strFields = ["event_name", "event_date", "description", "preference_1", "preference_2", "preference_3", "weather_preference", "start_time", "end_time"];
      // Campos de tipo entero
      const intFields = ["organizer_id", "location_id", "availability"];
      // Campos de tipo flotante
      const floatFields = ["price", "lat", "lng"];

      // Parseo de campos string
      for (const field of strFields) {
        const val = formData.get(field);
        dtoRaw[field] = typeof val === "string" ? val : "";
      }

      // Parseo de campos enteros (solo si están presentes)
      for (const field of intFields) {
        const val = formData.get(field);
        if (val !== null && val !== "") {
          dtoRaw[field] = parseInt(val.toString(), 10);
        }
      }

      // Parseo de campos flotantes (solo si están presentes)
      for (const field of floatFields) {
        const val = formData.get(field);
        if (val !== null && val !== "") {
          dtoRaw[field] = parseFloat(val.toString());
        }
      }

      // Procesar imagen si existe
      const file = formData.get("image");
      if (file && typeof (file as any).arrayBuffer === "function") {
        const imageFile = file as File;
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `${Date.now()}-${imageFile.name}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, buffer);
        dtoRaw.image = `/uploads/${filename}`;
      }

      // Validación de campos obligatorios manuales
      if (!dtoRaw.organizer_id || !dtoRaw.location_id) {
        return NextResponse.json({
          message: "organizer_id y location_id son requeridos"
        }, { status: 400 });
      }

      // Validación del DTO
      const dto = plainToInstance(UpdateEventDto, dtoRaw);
      const errors = await validate(dto);
      if (errors.length) {
        const msgs = errors.map((e) => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(", "),
        }));
        return NextResponse.json({ message: "Validación fallida", errors: msgs }, { status: 400 });
      }

      const idNum = +idStr;
      const ev = await EventService.update(idNum, dto);
      return NextResponse.json(ev);
    } catch (error) {
      console.error("[EVENT_CONTROLLER] Update error:", error);
      return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
  }

  /** DELETE /api/events/:id */
  static async delete(idStr: string) {
    if (!isIntString(idStr)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    try {
      const idNum = +idStr;
      await EventService.delete(idNum);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error("[EVENT_CONTROLLER] Delete error:", error);
      return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
    }
  }
}
