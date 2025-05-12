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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-orange-400">
      <form 
        //onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-white font-semibold text-lg">AppName</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
        
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-md text-gray-800"
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-md text-gray-800"
            required
          />
          <span 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute top-3 right-4 cursor-pointer"
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
    </div>
  );
  
}