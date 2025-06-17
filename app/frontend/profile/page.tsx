"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface User {
  user_name: string;
  email: string;
  preference_1?: string;
  preference_2?: string;
  preference_3?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cerrar el menú lateral si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Obtener el usuario con el token al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Usuario no autenticado");
      return;
    }

    fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir token en los headers
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener usuario");
        return res.json();
      })
      .then((data) => {
        setUser(data); // Asignar los datos del usuario
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo obtener el perfil");
      });
  }, []);

  // Manejar la lógica de cierre de sesión
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      router.push("/frontend/login"); // Redirigir a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Preparar los intereses del usuario para su visualización
  const intereses = [user?.preference_1, user?.preference_2, user?.preference_3].filter(Boolean);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Perfil</h1>
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="top-7 right-6 z-50 bg-white-800 text-gray px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
          >
            ☰ Menú
          </button>
        )}
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-600 text-2xl"
          >
            ×
          </button>
          <nav className="mt-16 flex flex-col items-start space-y-4 px-6 text-gray-800">
            <button onClick={() => { router.push("/frontend/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
            <button onClick={() => { router.push("/frontend/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
            <button onClick={() => { router.push("/frontend/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
            <button onClick={() => { router.push("/frontend/organize"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Organizar Evento</button>
            <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
          </nav>
        </div>
      </nav>

      <h1 className="w-full text-xl font-bold mt-6 mb-6 text-gray-800">Bienvenido</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Mostrar mensaje de error si hay uno */}

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{user?.user_name ?? "Cargando..."}</h2>
            <p className="text-gray-600">{user?.email ?? ""}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Intereses</h3>
          <ul className="list-disc list-inside text-gray-600">
            {intereses.length === 0 ? (
              <li>No hay intereses definidos.</li>
            ) : (
              intereses.map((interes, idx) => (
                <li key={idx}>{interes}</li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
