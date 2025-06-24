// components/EventDetail.tsx
import React from "react";

export interface EventDetailProps {
  event_id: number;
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  lat: number;
  lng: number;
  image?: string | null;
  price: string;
  availability?: number | null;
  eventlocation?: {
    location_id: number;
    name?: string;
    address?: string;
  };
}

export default function EventDetail({
  event_name,
  description,
  event_date,
  start_time,
  end_time,
  image,
  price,
  availability,
  eventlocation,
}: EventDetailProps) {
  const fechaStr = new Date(event_date).toLocaleDateString("es-CL", {
    timeZone: "America/Santiago",
  });

  const horaInicio = new Date(start_time).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Santiago",
  });

  const horaFin = new Date(end_time).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Santiago",
  });

  const isBase64Image = image && image.startsWith("data:image");

  return (
    <article className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {isBase64Image ? (
        <img src={image!} alt={`Imagen del evento: ${event_name}`} className="w-full h-64 object-cover rounded-md mb-4" />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
          Imagen no disponible
        </div>
      )}

      <h1 className="text-3xl font-semibold mb-2 text-gray-800">{event_name}</h1>

      <p className="text-gray-600 mb-1">
        <span className="font-medium">Fecha:</span> {fechaStr}
      </p>
      <p className="text-gray-600 mb-4">
        <span className="font-medium">Horario:</span> {horaInicio} - {horaFin}
      </p>

      {eventlocation && (
        <p className="text-gray-600 mb-4">
          <span className="font-medium">Ubicación:</span> {eventlocation.name ?? ""} {eventlocation.address ?? ""}
        </p>
      )}

      <div className="prose prose-lg mb-4">
        <p>{description}</p>
      </div>

      <p className="text-gray-700 mb-1">
        <span className="font-medium">Precio:</span> ${price}
      </p>
      {availability !== null && availability !== undefined && (
        <p className="text-gray-700 mb-4">
          <span className="font-medium">Disponibles:</span> {availability}
        </p>
      )}
    </article>
  );
}