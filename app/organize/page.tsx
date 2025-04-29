"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Definición de la estructura del objeto Evento
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
  // Estado para almacenar los datos del formulario sin el "id"
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

  // Maneja los cambios en los inputs y actualiza el estado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvento((prev) => ({
      ...prev,
      [name]: name === "precio" ? parseFloat(value) || 0 : value, // Convierte "precio" a número
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el recargo de página
    setError(null); // Limpia errores previos

    const newEvento: Evento = {
      id: crypto.randomUUID(), // Genera un ID único para el evento
      ...evento,
    };

    try {
      const response = await fetch("URL_DE_TU_API", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvento),
      });

      if (!response.ok) throw new Error("Error al guardar el evento");

      alert("✅ Evento guardado correctamente!");
      // Reinicia el formulario
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
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Registro de Evento</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenedor del formulario */}
      <div className="flex justify-center items-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Crear Evento</h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* Campos del formulario */}
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

            {/* Botón para enviar */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Guardar Evento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}