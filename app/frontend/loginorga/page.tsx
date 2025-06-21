"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginOrgaPage() {
  const [organizerName, setOrganizerName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    document.cookie = "authToken=; Max-Age=0; path=/";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/loginorga", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer_name: organizerName, contact }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales inválidas");
      } else {
        if (data.token) localStorage.setItem("token", data.token);
        router.push("/frontend/profileorga");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900">
      <nav className="w-full bg-white py-3 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold">Login Organizador</h1>
        <div>
          <button onClick={() => router.push("/frontend/login")} className="bg-blue-500 text-white px-4 py-1 rounded mx-2 hover:bg-blue-600">
            Asistente
          </button>
          <button onClick={() => router.push("/frontend/registerorga")} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
            Registrarse
          </button>
        </div>
      </nav>

      <div className="bg-white p-6 rounded-lg shadow-lg w-80 mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center">Login Organizador</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Nombre del Organizador"
            className="w-full p-2 border rounded mb-2"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded mb-4"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white p-2 rounded ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isLoading ? "Cargando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
