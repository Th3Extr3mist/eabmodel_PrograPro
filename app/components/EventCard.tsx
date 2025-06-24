'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Tipo completo de evento
export interface FullEvent {
  event_id: number;
  event_name: string;
  event_date: string;
  description: string;
  start_time: string;
  end_time: string;
  organizer_id: number;
  location_id: number;
  price: string;
  availability: string;
  lat: number;
  lng: number;
  preference_1: string;
  preference_2: string;
  preference_3: string;
  weather_preference: 'soleado' | 'lluvia' | 'indiferente';
  image?: string;
}

interface EventCardProps {
  event: FullEvent;
  attending: boolean;
  onToggleAttendance: (eventId: number) => void;
}

export default function EventCard({ event, attending, onToggleAttendance }: EventCardProps) {
  return (
    <Link
      href={`/frontend/eventos/${event.event_id}`}
      key={event.event_id}
      className="min-w-[350px] max-w-[350px] bg-white rounded-lg shadow-md flex-shrink-0"
    >
      <motion.div
        className="cursor-pointer flex flex-col"
        whileHover={{ scale: 1.02 }}
      >
        {event.image && (
          <Image
            src={event.image} // ya es base64 o ruta absoluta
            alt={event.event_name}
            width={350}
            height={400}
            className="rounded-t-lg object-cover h-[180px] w-full"
          />
        )}
        <div className="p-4 flex flex-col justify-between h-full">
          <h3 className="text-lg font-semibold text-gray-900">
            {event.event_name}
          </h3>
          <p className="text-gray-600 line-clamp-2">{event.description}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleAttendance(event.event_id);
            }}
            className={`mt-3 px-4 py-2 rounded font-medium transition-colors duration-200 ${
              attending
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
            }`}
          >
            {attending ? 'Asistiendo ✅' : 'Asistir'}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
