"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Evento {
  id: string;
  nombre_evento: string;
  fecha: string;
  descripcion: string;
  hora_inicio: string;
  hora_cierre: string;
  ubicacion: string;
  precio: number;
}

export default function EventoForm() {
  const [evento, setEvento] = useState<Omit<Evento, "id">>({
    nombre_evento: "",
    fecha: "",
    descripcion: "",
    hora_inicio: "",
    hora_cierre: "",
    ubicacion: "",
    precio: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvento((prev) => ({
      ...prev,
      [name]: name === "precio" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newEvento: Evento = {
      id: crypto.randomUUID(),
      ...evento,
    };

    console.log("Datos del evento:", newEvento);

    try {
      const response = await fetch("URL_DE_TU_API", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvento),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el evento");
      }

      alert("✅ Evento guardado correctamente!");
      setEvento({
        nombre_evento: "",
        fecha: "",
        descripcion: "",
        hora_inicio: "",
        hora_cierre: "",
        ubicacion: "",
        precio: 0,
      });
    } catch (error) {
      console.error("Error:", error);
      setError("❌ Hubo un error al guardar el evento");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="w-full bg-blue-500 text-white py-3 px-6 flex justify-between">
        <h1 className="text-lg font-bold">Registro de Evento</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-blue-500 px-4 py-1 rounded"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Formulario */}
      <div className="flex justify-center items-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Crear Evento</h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre_evento"
              placeholder="Nombre del Evento"
              className="w-full p-2 border rounded mb-2"
              value={evento.nombre_evento}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="fecha"
              className="w-full p-2 border rounded mb-2"
              value={evento.fecha}
              onChange={handleChange}
              required
            />

            <textarea
              name="descripcion"
              placeholder="Descripción"
              className="w-full p-2 border rounded mb-2"
              value={evento.descripcion}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="hora_inicio"
              className="w-full p-2 border rounded mb-2"
              value={evento.hora_inicio}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="hora_cierre"
              className="w-full p-2 border rounded mb-2"
              value={evento.hora_cierre}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="ubicacion"
              placeholder="Ubicación"
              className="w-full p-2 border rounded mb-2"
              value={evento.ubicacion}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="precio"
              placeholder="Precio"
              className="w-full p-2 border rounded mb-4"
              value={evento.precio}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Guardar Evento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
