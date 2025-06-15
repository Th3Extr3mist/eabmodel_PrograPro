"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import GoogleMaps from "../../components/GoogleMaps";

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
  image: string;
  lat: number;
  lng: number;
}

export default function SavedEventsPage() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<FullEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

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

  const eventsclosecall = events.slice(15, 20);
  const eventsGeneral = events.slice(10, 15);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("frontend/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos Guardados</h1>
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="top-7 right-6 z-50 bg-white-800 text-gray px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
          >
            ☰ Menú
          </button>
        )}
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-600 text-2xl"
          >
            ×
          </button>
          <nav className="mt-16 flex flex-col items-start space-y-4 px-6 text-gray-800">
            <button onClick={() => { router.push("/frontend/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
            <button onClick={() => { router.push("/frontend/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
            <button onClick={() => { router.push("/frontend/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
            <button onClick={() => { router.push("/frontend/organize"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Organizar Evento</button>
            <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
          </nav>
        </div>
      </nav>
      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Tus eventos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="w-full px-6 py-4">
        <div className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4 text-left w-full pl-2">Eventos Próximos</h2>
          <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
            {eventsclosecall.map((event) => (
              <motion.div
                key={event.event_id}
                className="min-w-[300px] bg-white p-4 rounded-lg shadow-md mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={event.image}
                  alt={event.event_name}
                  width={300}
                  height={150}
                  className="rounded-lg object-cover h-40"
                />
                <h2 className="text-xl font-semibold mt-2 text-gray-800">
                  {event.event_name}
                </h2>
                <p className="text-gray-600 line-clamp-2">{event.description}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Ubicación: {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                </p>
                <button
                  onClick={() => toggleAttendance(event.event_id)}
                  className={`mt-2 px-4 py-2 rounded font-medium transition-colors duration-200 ${
                    attending[event.event_id]
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                  }`}
                >
                  {attending[event.event_id] ? "Asistiendo ✅" : "Asistir"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4 text-left w-full pl-2">Eventos que vas a asistir</h2>
          <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
            {eventsGeneral.map((event) => (
              <motion.div
                key={event.event_id}
                className="min-w-[300px] bg-white p-4 rounded-lg shadow-md mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={event.image}
                  alt={event.event_name}
                  width={300}
                  height={150}
                  className="rounded-lg object-cover h-40"
                />
                <h2 className="text-xl font-semibold mt-2 text-gray-800">
                  {event.event_name}
                </h2>
                <p className="text-gray-600 line-clamp-2">{event.description}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Ubicación: {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                </p>
                <button
                  onClick={() => toggleAttendance(event.event_id)}
                  className={`mt-2 px-4 py-2 rounded font-medium transition-colors duration-200 ${
                    attending[event.event_id]
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                  }`}
                >
                  {attending[event.event_id] ? "Asistiendo ✅" : "Asistir"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}