// app/events/page.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import GoogleMaps, { MapEvent } from "../components/GoogleMaps";

interface EventStore {
  attending: Record<number, boolean>;
  toggleAttendance: (id: number) => void;
}

const useEventStore = create<EventStore>((set) => ({
  attending: {},
  toggleAttendance: (id) =>
    set((state) => ({
      attending: {
        ...state.attending,
        [id]: !state.attending[id],
      },
    })),
}));

interface FullEvent {
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
}

export default function EventList() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter();

  const [events, setEvents] = useState<FullEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los eventos");
        return res.json();
      })
      .then((data: FullEvent[]) => setEvents(data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar eventos");
      });
  }, []);

  const mapEvents: MapEvent[] = events
    .filter((e) => e.lat !== 0 && e.lng !== 0)
    .map((e) => ({
      id: e.event_id,
      title: e.event_name,
      lat: e.lat,
      lng: e.lng,
    }));

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </nav>

      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {events.map((event) => (
        <Link
          href={`/eventos/${event.event_id}`} // ← usa exactamente event.event_id
          key={event.event_id}
          className="w-full max-w-md bg-white rounded-lg shadow-md mb-4"
        >
          <motion.div className="cursor-pointer" whileHover={{ scale: 1.02 }}>
            {event.image && (
              <Image
                src={event.image}
                alt={event.event_name}
                width={200}
                height={100}
                className="rounded-lg object-cover"
              />
            )}

            <h2 className="text-xl font-semibold mt-2 text-gray-800">
              {event.event_name}
            </h2>
            <p className="text-gray-600">{event.description}</p>

            {event.lat && event.lng && (
              <p className="text-sm text-blue-700 mt-1">
                Ubicación: {event.lat}, {event.lng}
              </p>
            )}

            <button
              onClick={(e) => {
                e.preventDefault(); // evita que el Link se dispare
                toggleAttendance(event.event_id);
              }}
              className={`mt-2 px-4 py-2 rounded font-medium transition-colors duration-200 ${
                attending[event.event_id]
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-900 hover:bg-gray-400"
              }`}
            >
              {attending[event.event_id] ? "Asistiendo ✅" : "Asistir"}
            </button>
          </motion.div>
        </Link>
      ))}

      {mapEvents.length > 0 && (
        <div className="w-full max-w-4xl mt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Ubicaciones de los Eventos
          </h2>
          <GoogleMaps events={mapEvents} />
        </div>
      )}
    </div>
  );
}
