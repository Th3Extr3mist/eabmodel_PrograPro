"use client";

import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import EventCard, { FullEvent } from "../../components/EventCard";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<FullEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<"soleado" | "lluvia" | "indiferente">("indiferente");
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }
    if (isSidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.ok ? res.json() : Promise.reject("No se pudieron cargar los eventos"))
      .then((data: FullEvent[]) => setEvents(data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar eventos");
      });
  }, []);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.ok ? res.json() : Promise.reject("No autenticado"))
      .then((data) => Array.isArray(data.intereses) && setUserPreferences(data.intereses))
      .catch((err) => console.error("Error al obtener preferencias:", err));
  }, []);

  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santiago,CL&appid=ec3b5c9883b52b8166d108472217ea8d&units=metric`)
      .then(res => res.json())
      .then(data => {
        const weatherMain = data.weather[0].main.toLowerCase();
        setCurrentWeather(weatherMain.includes("rain") ? "lluvia" : weatherMain.includes("clear") ? "soleado" : "indiferente");
      })
      .catch(err => {
        console.error("Error al obtener el clima:", err);
        setCurrentWeather("indiferente");
      });
  }, []);

  const eventsGeneral = events.slice(0, 5);
  const eventsRecomen = events.filter((event) => [event.preference_1, event.preference_2, event.preference_3].some((pref) => userPreferences.includes(pref))).slice(0, 5);
  const eventsweather = events.filter((e) => e.weather_preference === currentWeather || e.weather_preference === "indiferente").slice(0, 5);
  const eventsclosecall = [...events].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).slice(0, 5);

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
      <h2 className="text-xl font-semibold mb-4 text-left">{titulo}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
        {eventos.map((event) => (
          <EventCard
            key={event.event_id}
            event={event}
            attending={!!attending[event.event_id]}
            onToggleAttendance={toggleAttendance}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos</h1>
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="top-7 right-6 z-50 bg-white-800 text-gray px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700">
            ☰ Menú
          </button>
        )}
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-600 text-2xl">×</button>
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
