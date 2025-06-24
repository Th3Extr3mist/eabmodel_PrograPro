"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

interface FullEvent {
  event_id: number;
  event_name: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
}

export default function SavedEventsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [reservations, setReservations] = useState<FullEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarOpen(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      if (!res.ok) throw new Error("No se pudieron cargar las reservas");
      const data = await res.json();
      const formatted = data.map((r: any) => r.eventinfo).filter(Boolean);
      setReservations(formatted);
    } catch (err) {
      console.error(err);
      setError("Error al cargar tus eventos guardados.");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (eventId: number) => {
    try {
      await fetch("/api/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      // Remueve el evento del estado local
      setReservations((prev) => prev.filter((e) => e.event_id !== eventId));
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/frontend/login");
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
            <button onClick={() => { router.push("/frontend/eventos"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos</button>
            <button onClick={() => { router.push("/frontend/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
            <button onClick={() => { router.push("/frontend/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
            <button onClick={() => { router.push("/frontend/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
            <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
          </nav>
        </div>
      </nav>

      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Tus eventos guardados</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="w-full flex flex-wrap gap-6 justify-center">
        {reservations.length === 0 && (
          <p className="text-gray-600 mt-4">No tienes eventos guardados aún.</p>
        )}
        {reservations.map((event) => (
          <motion.div
            key={event.event_id}
            className="w-[300px] bg-white p-4 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src={event.image}
              alt={event.event_name}
              width={300}
              height={150}
              className="rounded-lg object-cover h-40"
            />
            <h2 className="text-xl font-semibold mt-2 text-gray-800">{event.event_name}</h2>
            <p className="text-gray-600 line-clamp-2">{event.description}</p>
            <button
              onClick={() => handleCancel(event.event_id)}
              className="mt-3 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Anular reserva ❌
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}