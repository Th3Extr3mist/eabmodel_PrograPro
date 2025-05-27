import prisma from '../config/prisma';
import { CreateEventDto, UpdateEventDto } from '../dtos/event_dto';

export const EventService = {
  /** Crea un nuevo evento */
  async create(dto: CreateEventDto) {
    await this.validateRelations(dto);
    return prisma.eventinfo.create({
      data: {
        event_name:   dto.event_name,
        description:  dto.description,
        // Convierte 'YYYY-MM-DD' → Date
        event_date:   new Date(dto.event_date),
        // Convierte 'HH:mm:ss' → Date ISO
        start_time:   new Date(`1970-01-01T${dto.start_time}Z`),
        end_time:     new Date(`1970-01-01T${dto.end_time}Z`),
        organizer_id: dto.organizer_id,
        location_id:  dto.location_id,
        price:        dto.price,
        availability: dto.availability ?? 0,
        lat: dto.lat,
        lng: dto.lng
      }
    });
  },

  /** Lista todos los eventos */
  async getAll() {
    return prisma.eventinfo.findMany({
      include: { organizer: true, eventlocation: true }
    });
  },

  /** Obtiene un evento por su ID */
  async getById(eventId: number) {
    return prisma.eventinfo.findUnique({
      where: { event_id: eventId },
      include: { organizer: true, eventlocation: true }
    });
  },

  /** Actualiza un evento */
  async update(eventId: number, dto: UpdateEventDto) {
    await this.validateRelations(dto);
    return prisma.eventinfo.update({
      where: { event_id: eventId },
      data: {
        // Solo actualiza los campos que vienen en el DTO
        ...(dto.event_name     && { event_name: dto.event_name     }),
        ...(dto.description    && { description: dto.description    }),
        ...(dto.event_date     && { event_date:   new Date(dto.event_date) }),
        ...(dto.start_time     && { start_time:   new Date(`1970-01-01T${dto.start_time}Z`) }),
        ...(dto.end_time       && { end_time:     new Date(`1970-01-01T${dto.end_time}Z`) }),
        ...(dto.organizer_id   && { organizer_id: dto.organizer_id   }),
        ...(dto.location_id    && { location_id:  dto.location_id    }),
        ...(dto.price          !== undefined && { price:        dto.price         }),
        ...(dto.availability   !== undefined && { availability: dto.availability  }),
        ...(dto.lat && {lat: dto.lat}),
        ...(dto.lng && {lnt: dto.lng})
      }
    });
  },

  /** Elimina un evento */
  async delete(eventId: number) {
    return prisma.eventinfo.delete({
      where: { event_id: eventId }
    });
  },

  /** Verifica que organizer_id y location_id existan */
  async validateRelations(dto: CreateEventDto | UpdateEventDto) {
    if (dto.organizer_id !== undefined) {
      const organizer = await prisma.organizer.findUnique({
        where: { organizer_id: dto.organizer_id }
      });
      if (!organizer) throw new Error('Organizador no existe');
    }
    if (dto.location_id !== undefined) {
      const location = await prisma.eventlocation.findUnique({
        where: { location_id: dto.location_id }
      });
      if (!location) throw new Error('Ubicación no existe');
    }
  }
};
