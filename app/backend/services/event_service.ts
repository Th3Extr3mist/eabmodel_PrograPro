import prisma from '../config/prisma';
import { CreateEventDto, UpdateEventDto } from '../dtos/event_dto';

export const EventService = {
  /** Crea un nuevo evento */
  async create(dto: CreateEventDto) {
    await this.validateRelations(dto);

    return prisma.eventinfo.create({
      data: {
        event_name: dto.event_name,
        description: dto.description,
        event_date: new Date(dto.event_date),
        start_time: new Date(`1970-01-01T${dto.start_time}:00Z`), 
        end_time: new Date(`1970-01-01T${dto.end_time}:00Z`),
        price: dto.price,
        availability: dto.availability ?? 0,
        preference_1: dto.preference_1,
        preference_2: dto.preference_2,
        preference_3: dto.preference_3,
        weather_preference: dto.weather_preference,
        lat: (dto.lat !== undefined && !isNaN(dto.lat)) ? dto.lat : 0,
        lng: (dto.lng !== undefined && !isNaN(dto.lng)) ? dto.lng : 0,
        image: dto.image ?? undefined,

        organizer: {
          connect: { organizer_id: dto.organizer_id },
        },
        eventlocation: {
          connect: { location_id: dto.location_id },
        },
      }
    });
  },

  /** Lista todos los eventos */
  async getAll() {
    return prisma.eventinfo.findMany({
      include: {
        organizer: true,
        eventlocation: true
      }
    });
  },

  /** Obtiene un evento por su ID */
  async getById(eventId: number) {
    return prisma.eventinfo.findUnique({
      where: { event_id: eventId },
      include: {
        organizer: true,
        eventlocation: true
      }
    });
  },

  /** Actualiza un evento */
  async update(eventId: number, dto: UpdateEventDto) {
    await this.validateRelations(dto);

    const data: any = {
      ...(dto.event_name && { event_name: dto.event_name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.preference_1 && {preference_1: dto.preference_1}),
      ...(dto.preference_2 && {preference_2: dto.preference_2}),
      ...(dto.preference_3 && {preference_3: dto.preference_3}),
      ...(dto.weather_preference && {weather_preference: dto.weather_preference}),
      ...(dto.event_date && { event_date: new Date(dto.event_date) }),
      ...(dto.start_time && { start_time: `1970-01-01T${dto.start_time}:00Z`}),
      ...(dto.end_time && { end_time: `1970-01-01T${dto.end_time}:00Z` }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.availability !== undefined && { availability: dto.availability }),
      ...(dto.lat !== undefined && !isNaN(dto.lat) && { lat: dto.lat }),
      ...(dto.lng !== undefined && !isNaN(dto.lng) && { lng: dto.lng }),
      ...(dto.image && { image: dto.image }),
    };

    // Relaciones anidadas
    if (dto.organizer_id !== undefined) {
      data.organizer = {
        connect: { organizer_id: dto.organizer_id }
      };
    }

    if (dto.location_id !== undefined) {
      data.eventlocation = {
        connect: { location_id: dto.location_id }
      };
    }

    return prisma.eventinfo.update({
      where: { event_id: eventId },
      data,
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
