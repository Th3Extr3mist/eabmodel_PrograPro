"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [user_name, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [preference_1, setPreference1] = useState("");
  const [preference_2, setPreference2] = useState("");
  const [preference_3, setPreference3] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // importante para cookies HTTP-only
        body: JSON.stringify({
          user_name,
          email,
          user_password: password,
          preference_1,
          preference_2,
          preference_3,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Error al registrar usuario");
        return;
      }

      router.push("/frontend/profile");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Hubo un problema al registrar. Intenta nuevamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Registro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="user_name"
              type="text"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label htmlFor="preference_1" className="block text-sm font-medium text-gray-700">
              Preferencia 1
            </label>
            <input
              id="preference_1"
              type="text"
              value={preference_1}
              onChange={(e) => setPreference1(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="preference_2" className="block text-sm font-medium text-gray-700">
              Preferencia 2
            </label>
            <input
              id="preference_2"
              type="text"
              value={preference_2}
              onChange={(e) => setPreference2(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="preference_3" className="block text-sm font-medium text-gray-700">
              Preferencia 3
            </label>
            <input
              id="preference_3"
              type="text"
              value={preference_3}
              onChange={(e) => setPreference3(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition duration-200"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
