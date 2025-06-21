// app/events/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import EventDetail, { EventDetailProps } from '../../../components/EventDetail';
import EventMapClient from '../../../components/EventMapClient';

interface Params {
  params: { id: string };
}

export default async function EventByIdPage({ params }: Params) {
  const resolvedParams = await params; 
  const id = resolvedParams.id;
  const res = await fetch(`http://localhost:3000/api/events/${id}`, { cache: 'no-store' });

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error(`Error al solicitar el evento ${id}: ${res.status}`);

  const data = (await res.json()) as EventDetailProps;

  const mapEvent = {
    id: data.event_id,
    title: data.event_name || 'Sin título',
    description: data.description || '',
    image: data.image || '',
    lat: data.lat,
    lng: data.lng,
  };

  return (
<main className="px-4 py-8 bg-gray-100 min-h-screen flex flex-col items-center space-y-8">
  <section className="w-full max-w-4xl">
    <EventDetail {...data} />
  </section>

  <section className="w-full max-w-4xl">
   <div className="w-full max-w-4xl rounded-lg shadow overflow-hidden h-[400px] sm:h-[500px] md:h-[600px]">
  <EventMapClient events={[mapEvent]} />
</div>

  </section>
</main>




  );
}