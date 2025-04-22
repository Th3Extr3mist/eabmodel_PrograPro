"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Las casillas deben completarse");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales inválidas");
        return;
      }

      router.push("/eventos");
    } catch (err) {
      console.error("Error al hacer login:", err);
      setError("Error al conectarse al servidor");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Iniciar Sesión</h1>
        <div>
          <button
            onClick={() => router.push("/register")}
            className="bg-blue-500 text-white px-4 py-1 rounded mx-2 hover:bg-blue-600"
          >
            Registrarse
          </button>
          <button
            onClick={() => router.push("/organize")}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Organizador
          </button>
        </div>
      </nav>

      {/* Formulario de Login */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="w-full p-2 border rounded mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="w-full p-2 border rounded mb-4 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}