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
    /*genera un diseño de color en gradiente (morado a naranja) de esquina izq-superior a esquina der-inferior*/
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-orange-600"> 
      <form 
        //onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-white font-semibold text-lg">AppName</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
          <span 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <a href="#" className="text-sm text-blue-500 hover:underline mb-4 block">¿Olvidaste tu contraseña?</a>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Login
        </button>

        <button 
          type="button"
          onClick={() => router.push("/register")}
          className="w-full mt-2 border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50"
        >
          Registrate
        </button>
      </form>
      <footer className="w-full text-center py-4 text-white text-sm bg-opacity-80 fixed bottom-0">
         © {new Date().getFullYear()} AppName. Todos los derechos reservados. Creado por EABMODEL
      </footer>
    </div>
  );
  
}