"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter(); 

  // Función para manejar el envío del formulario
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true); 

    try {
      // Enviar solicitud de login a la API
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include", // Incluir cookies en la solicitud
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Verificación secundaria de autenticación
        const authCheck = await fetch("/api/auth/check");
        if (authCheck.ok) {
          router.push("/eventos"); // Redirige a la página de eventos
          router.refresh(); // Refresca para asegurar que el estado se actualiza
        } else {
          setError("Error al establecer la sesión");
        }
      } else {
        const error = await res.json();
        setError(error.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar superior */}
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

      {/* Formulario de inicio de sesión */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Iniciar Sesión</h2>

        {/* Mensaje de error si lo hay */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleLogin}>
          {/* Campo de correo */}
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="w-full p-2 border rounded mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Campo de contraseña con botón para mostrar/ocultar */}
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
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {/* Botón de enviar */}
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