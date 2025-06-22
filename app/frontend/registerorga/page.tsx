"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterOrgaPage() {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState("");
  const [contact, setContact] = useState("");
  const [organizerType, setOrganizerType] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/registerorga", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizer_name: organizerName, contact, organizer_type: organizerType }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al registrar organizador");
        return;
      }

      router.push("/frontend/profileorga");
    } catch (err) {
      setError("Hubo un problema al registrar. Intenta nuevamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro Organizador</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            type="text"
            placeholder="Nombre del Organizador"
            className="w-full p-2 border rounded"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tipo de Organizador"
            className="w-full p-2 border rounded"
            value={organizerType}
            onChange={(e) => setOrganizerType(e.target.value)}
          />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
