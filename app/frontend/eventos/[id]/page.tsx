// app/events/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import EventDetail, { EventDetailProps } from '../../../components/EventDetail';

interface Params {
  params: { id: string };
}

export default async function EventByIdPage({ params }: Params) {

  const res = await fetch(`http://localhost:3000/api/events/${params.id}`, { cache: 'no-store' });
  if (res.status === 404) {
    return notFound();
  }
  if (!res.ok) {
    throw new Error(`Error al solicitar el evento ${params.id}: ${res.status}`);
  }

  const data = (await res.json()) as EventDetailProps;
  return (
    <main className="px-4 py-8 bg-gray-100 min-h-screen">
      <EventDetail {...data} />
    </main>
  );
}
