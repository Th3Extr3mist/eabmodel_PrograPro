"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import EventCard, { FullEvent } from "../../components/EventCard";

export default function EventList() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<FullEvent[]>([]);
  const [reservations, setReservations] = useState<number[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [currentWeather, setCurrentWeather] = useState<"soleado" | "lluvia" | "indiferente">("indiferente");

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));

    fetch("/api/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data.map((r: any) => r.event_id)));

    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => setUserPreferences(data.intereses || []));

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santiago,CL&appid=ec3b5c9883b52b8166d108472217ea8d&units=metric`)
      .then((res) => res.json())
      .then((data) => {
        const main = data.weather[0].main.toLowerCase();
        setCurrentWeather(main.includes("rain") ? "lluvia" : main.includes("clear") ? "soleado" : "indiferente");
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/frontend/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggleAttendance = async (eventId: number) => {
    if (!reservations.includes(eventId)) {
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      setReservations([...reservations, eventId]);
    }
  };

  const filteredEvents = events.filter((e) => !reservations.includes(e.event_id));

  const sections = {
    "Eventos Generales": events,
    "Eventos Recomendados": filteredEvents.filter((e) =>
      [e.preference_1, e.preference_2, e.preference_3].some((p) => userPreferences.includes(p))
    ).slice(0, 5),
    "Eventos Para el Clima": filteredEvents.filter(
      (e) => e.weather_preference === currentWeather || e.weather_preference === "indiferente"
    ).slice(0, 5),
    "Eventos Próximos": [...filteredEvents]
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5),
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos</h1>
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
            <button onClick={() => { router.push("/frontend/eventos"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos</button>
            <button onClick={() => { router.push("/frontend/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
            <button onClick={() => { router.push("/frontend/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
            <button onClick={() => { router.push("/frontend/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
            <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
          </nav>
        </div>
      </nav>

      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>

      <div className="w-full px-6 py-4">
        {Object.entries(sections).map(([title, list]) => (
          <section key={title} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="flex space-x-4 overflow-x-auto">
              {list.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  attending={false}
                  onToggleAttendance={handleToggleAttendance}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
