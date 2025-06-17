"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  weather_preference: "soleado" | "lluvia" | "indiferente"; // ✅ aquí sí
  image?: string;
}
export default function EventList() {
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

  useEffect(() => {
  console.log("Intentando obtener el clima...");
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santiago,CL&appid=ec3b5c9883b52b8166d108472217ea8d&units=metric`)
    .then(res => res.json())
    .then(data => {
      console.log("Datos del clima:", data); // 👈 log para debug
      const weatherMain = data.weather[0].main.toLowerCase();

      if (weatherMain.includes("rain")) setCurrentWeather("lluvia");
      else if (weatherMain.includes("clear")) setCurrentWeather("soleado");
      else setCurrentWeather("indiferente");
    })
    
    .catch(err => {
      console.error("Error al obtener el clima:", err);
      setCurrentWeather("indiferente");
    });
    console.log("Clima actual definido como:", currentWeather);
}, []);

  const [currentWeather, setCurrentWeather] = useState<"soleado" | "lluvia" | "indiferente">("indiferente");
  const eventsGeneral = events.slice(0, 5);
  const eventsRecomen = events.slice(5, 15);
  console.log("Eventos disponibles:", events);
  console.log("Eventos que cumplen clima (soleado o indiferente):", events.filter(
  (e) =>
    e.weather_preference === "soleado" || e.weather_preference === "indiferente"
));
  const eventsweather = events.filter(
  (e) => e.weather_preference === "indiferente" || e.weather_preference === "indiferente"
  ).slice(0, 5); // los 5 eventos más cercanos
  const eventsclosecall = [...events]
  .filter(e => e.event_date) // opcional: filtra si algún evento no tiene fecha
  .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  .slice(0, 5); // los 5 eventos más cercanos

  const mapEvents = events
    .filter((e) => e.lat !== 0 && e.lng !== 0)
    .map((e) => ({
      id: e.event_id,
      title: e.event_name,
      description: e.description,
      image: e.image || "",
      lat: e.lat,
      lng: e.lng,
    }));

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/frontend/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

const renderSection = (titulo: string, eventos: FullEvent[]) => (
  <section className="w-full bg-white border-b border-gray-300 py-6 px-6 rounded-lg shadow-lg mb-6">
    {/* Título por encima */}
    <h2 className="text-xl font-semibold mb-4 text-left">{titulo}</h2>

    {/* Contenedor horizontal de tarjetas */}
    <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
      {eventos.map((event) => (
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
                src={event.image}
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
                  toggleAttendance(event.event_id);
                }}
                className={`mt-3 px-4 py-2 rounded font-medium transition-colors duration-200 ${
                  attending[event.event_id]
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                }`}
              >
                {attending[event.event_id] ? "Asistiendo ✅" : "Asistir"}
              </button>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  </section>
);
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos</h1>
     {/* Botón para abrir menú */}
     {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="top-7 right-6 z-50 bg-white-800 text-gray px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
        >
        ☰ Menú
        </button>
      )}
      {/* Sidebar */}
      <div
        ref={sidebarRef} // 
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
          <button onClick={() => { router.push('/frontend/eventos'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos</button>
          <button onClick={() => { router.push("/frontend/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
          <button onClick={() => { router.push("/frontend/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
          <button onClick={() => { router.push("/frontend/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
          <button onClick={() => { router.push("/frontend/organize"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Organizar Evento</button>
          <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
        </nav>
      </div>
      </nav>
      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="w-full px-6 py-4">
        {renderSection("Eventos Generales", eventsGeneral)}
        {renderSection("Eventos Recomendados", eventsRecomen)}
        {renderSection("Eventos Para el Clima", eventsweather)}
        {renderSection("Eventos Próximos", eventsclosecall)}
      </div>
    </div>
  );
}