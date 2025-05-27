"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import GoogleMaps, { MarkerLatLng } from "../components/GoogleMaps";


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


export default function EventList() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
  // Estado para eventos y carga desde API
  const [events, setEvents] = useState<{
    id: number;
    title: string;
    description: string;
    image: string;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los eventos");
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar eventos");
      });
  }, []);

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
 {/* Botón para abrir menú */}
 <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
      >
        ☰ Menú
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef} // ✅ esto es esencial
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
          <button onClick={() => { router.push("/perfil"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
          <button onClick={() => { router.push("/eventos-guardados"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
          <button onClick={() => { router.push("/mis-viajes"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Viajes</button>
          <button
            onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
            className="mt-4 text-red-600 hover:text-red-800 font-semibold"
          >
            Cerrar Sesión
          </button>
        </nav>
      </div>
      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {events.map((event) => (
        <motion.div
          key={event.id}
          className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src={event.image}
            alt={event.title}
            width={400}
            height={200}
            className="rounded-lg object-cover"
          />
          <h2 className="text-xl font-semibold mt-2 text-gray-800">
            {event.title}
          </h2>
          <p className="text-gray-600">{event.description}</p>
          <p className="text-sm text-blue-700 mt-1">
            Ubicación: {event.lat}, {event.lng}
          </p>
          <button
            onClick={() => toggleAttendance(event.id)}
            className={`mt-2 px-4 py-2 rounded font-medium transition-colors duration-200 ${
              attending[event.id]
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-900 hover:bg-gray-400"
            }`}
          >
            {attending[event.id] ? "Asistiendo ✅" : "Asistir"}
          </button>
        </motion.div>
      ))}

      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Ubicaciones de los Eventos</h2>
        <GoogleMaps events={events} />
      </div>
    </div>
  );
}