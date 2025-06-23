"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  event_id: number;
  event_name: string;
  description: string;
  event_date: string;
}

export default function OrganizerProfilePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/organizer-events", { credentials: "include" });
        if (!res.ok) throw new Error("Error al obtener eventos");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
        setError("No se pudieron cargar los eventos");
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (event_id: number) => {
  const confirm = window.confirm("¿Estás seguro de que deseas eliminar este evento?");
  if (!confirm) return;

  try {
    const res = await fetch(`/api/events/${event_id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 204) {
      setEvents(events.filter((ev) => ev.event_id !== event_id));
      return;
    }
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "No se pudo eliminar el evento");
      return;
    }

    setEvents(events.filter((ev) => ev.event_id !== event_id));
  } catch (err) {
    console.error("Error al eliminar:", err);
    setError("Hubo un error al eliminar el evento");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "authToken=; Max-Age=0; path=/";
    router.push("/frontend/loginorga");
  };

  const handleCreateEvent = () => {
    router.push("/frontend/organize");
  };

  const handleUpdate = (event_id: number) => {
    router.push(`/frontend/edit_event/${event_id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Perfil del Organizador</h1>
        <div className="space-x-2">
          <button
            onClick={handleCreateEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Crear Evento
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {events.length === 0 ? (
        <p>No has publicado eventos aún.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.event_id} className="bg-white p-4 shadow rounded">
              <h2 className="text-lg font-semibold">{event.event_name}</h2>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm text-gray-500">Fecha: {event.event_date}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleUpdate(event.event_id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => handleDelete(event.event_id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
