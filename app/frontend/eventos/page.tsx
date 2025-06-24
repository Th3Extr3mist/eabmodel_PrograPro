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

  const filteredEvents = events.filter(e => !reservations.includes(e.event_id));

  const sections = {
    "Eventos Generales": filteredEvents.slice(0, 5),
    "Eventos Recomendados": filteredEvents.filter(e => [e.preference_1, e.preference_2, e.preference_3].some(p => userPreferences.includes(p))).slice(0, 5),
    "Eventos Para el Clima": filteredEvents.filter(e => e.weather_preference === currentWeather || e.weather_preference === "indiferente").slice(0, 5),
    "Eventos Próximos": [...filteredEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).slice(0, 5),
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
      {/* Navigation omitted for brevity */}

      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>
      {Object.entries(sections).map(([title, list]) => (
        <section key={title} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <div className="flex space-x-4 overflow-x-auto">
            {list.map(event => (
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
  );
}