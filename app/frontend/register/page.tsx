"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() { 
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [error, setError] = useState(""); 
  const router = useRouter(); 

  const handleRegister = async (e: React.FormEvent) => { 
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) { // Verifica que todos los campos estén llenos
      setError("Todos los campos son obligatorios"); // Muestra error si algún campo falta
      return;
    }

    if (password !== confirmPassword) { // Verifica que las contraseñas coincidan
      setError("Las contraseñas no coinciden"); // Muestra error si no coinciden
      return;
    }

    try {
      const res = await fetch("/api/register", { // Hace una petición POST al backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: username, 
          email, 
          user_password: password, 
        }),
      });

      const data = await res.json(); //Realiza un request a la base de datos para saber si el registro fue guardado

      if (!res.ok) { 
        setError(data.error || "Error al registrar"); 
        return;
      }

      if (data.token) { // Si se recibe un token
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60}`; // Guarda el token como cookie por 1 hora
      }

      window.location.assign("/frontend/eventos"); // Redirige a la página de eventos
    } catch (err) {
      console.error(err); 
      setError("Error de conexión con el servidor"); 
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Registro</h1>
        <button 
          onClick={() => router.push("/frontend/login")} 
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Volver al Login
        </button>
      </nav>
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Crear Cuenta</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre de Usuario"
            className="w-full p-2 border rounded mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
              className="w-full p-2 border rounded mb-2 pr-10"
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
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              className="w-full p-2 border rounded mb-4 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Crear Usuario
          </button>
        </form>
      </div>
    </div>
  );
}
