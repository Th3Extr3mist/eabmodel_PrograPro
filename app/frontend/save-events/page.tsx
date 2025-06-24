"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface FullEvent {
  event_id: number;
  event_name: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
}

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState<FullEvent[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/reservations")
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((r: any) => r.event);
        setSavedEvents(mapped);
      });
  }, []);

  const handleCancelReservation = async (eventId: number) => {
    await fetch("/api/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setSavedEvents((prev) => prev.filter(e => e.event_id !== eventId));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Tus eventos guardados</h1>
      <div className="flex space-x-4 overflow-x-auto">
        {savedEvents.map(event => (
          <motion.div
            key={event.event_id}
            className="min-w-[300px] bg-white p-4 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src={event.image}
              alt={event.event_name}
              width={300}
              height={150}
              className="rounded-lg object-cover h-40"
            />
            <h2 className="text-xl font-semibold mt-2">{event.event_name}</h2>
            <p className="text-gray-600">{event.description}</p>
            <p className="text-sm text-blue-700 mt-1">
              Ubicación: {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
            </p>
            <button
              onClick={() => handleCancelReservation(event.event_id)}
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Anular Reserva
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}