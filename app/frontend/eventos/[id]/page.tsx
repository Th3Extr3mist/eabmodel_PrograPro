// frontend/eventos/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EventDetail, { EventDetailProps } from '../../../components/EventDetail';
import EventMapClient from '../../../components/EventMapClient';
import EventWeather from '../../../components/EventWeather';

export default function EventByIdPage() {
  const { id } = useParams() ?? {};
  const [eventData, setEventData] = useState<EventDetailProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/events/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: EventDetailProps) => {
        setEventData(data);

        // Convertir start_time a Date con zona horaria chilena
        const startDate = new Date(data.start_time);
        const localStartDate = new Date(
          startDate.toLocaleString('en-US', { timeZone: 'America/Santiago' })
        );
        const timestamp = Math.floor(localStartDate.getTime() / 1000);
        setStartTimestamp(timestamp);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo cargar el evento');
      });
  }, [id]);

  if (error) {
    return (
      <main className="p-8 text-center text-red-600">
        <p>{error}</p>
      </main>
    );
  }

  if (!eventData) {
    return (
      <main className="p-8 text-center">
        <p>Cargando evento...</p>
      </main>
    );
  }

  const dateStr = new Date(eventData.event_date).toLocaleDateString("es-CL", {
    timeZone: "America/Santiago",
  });

  const humanDateTime = `${dateStr} - ${new Date(eventData.start_time).toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const mapEvent = {
    id: eventData.event_id,
    title: eventData.event_name,
    description: eventData.description,
    image: eventData.image || '',
    lat: eventData.lat,
    lng: eventData.lng,
  };

  return (
    <main className="px-4 py-8 bg-gray-100 min-h-screen flex flex-col items-center space-y-8">
      <section className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        <div className="w-full bg-white rounded-lg shadow p-6">
          <EventDetail {...eventData} />
        </div>
        <div className="w-full lg:w-64 bg-white rounded-lg shadow p-4 h-fit">
          <h3 className="font-semibold text-lg mb-2">Clima</h3>
          <p className="text-sm mb-4 text-gray-800">{humanDateTime}</p>
          {startTimestamp ? (
            <EventWeather lat={eventData.lat} lng={eventData.lng} startTimestamp={startTimestamp} />
          ) : (
            <p className="text-center text-gray-500">Sin datos de clima</p>
          )}
        </div>
      </section>
      <section className="w-full max-w-5xl">
        <div className="w-full rounded-lg shadow overflow-hidden h-[400px] sm:h-[500px] md:h-[600px]">
          <EventMapClient events={[mapEvent]} />
        </div>
      </section>
    </main>
  );
}