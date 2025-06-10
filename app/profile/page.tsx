"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import GoogleMaps, { MarkerLatLng } from "../components/GoogleMaps";


interface EventStore {
  attending: Record<number, boolean>;
  toggleAttendance: (id: number) => void;
}

const useEventStore = create<EventStore>((set) => ({
  attending: {},
  toggleAttendance: (id) =>
    set((state) => ({
      attending: {
        ...state.attending,
        [id]: !state.attending[id],
      },
    })),
}));


export default function EventList() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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
  // Estado para eventos y carga desde API
  
  const [user, setUser] = useState<{
    nombre: string;
    email: string;
    biografia: string;
    intereses: string[];
  } | null>(null);
  
  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setError(null); // Borra error si carga bien
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar usuario");
        setUser(null); // Esto va *solo* en el catch
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Mis Planes</h1>
     {/* Botón para abrir menú */}
     {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="top-7 right-6 z-50 bg-white-800 text-gray px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
        >
        ☰ Menú
        </button>
      )}
      {/* Sidebar */}
      <div
        ref={sidebarRef} // 
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
          <button onClick={() => { router.push("/profile"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
          <button onClick={() => { router.push("/save-events"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
          <button onClick={() => { router.push("/my-plans"); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
          <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
        </nav>
      </div>
      </nav>
      <h1 className="w-full text-xl font-bold mt-6 mb-6 text-gray-800"></h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
            <Image
            src="/images/avatar-placeholder.png" // Usa una imagen por defecto o dinámica si ya tienes auth
            alt="Foto de perfil"
            width={80}
            height={80}
            className="rounded-full object-cover"
            />
            <div>
            <h2 className="text-2xl font-semibold text-gray-800">{user?.nombre ?? "Cargando..."}</h2>
            <p className="text-gray-600">{user?.email ?? ""}</p>
            </div>
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Biografía</h3>
            <p className="text-gray-600">
                {user?.biografia ?? "Sin biografía disponible"}
            </p>
            </div>

            <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Intereses</h3>
            <ul className="list-disc list-inside text-gray-600">
                {(user?.intereses ?? []).map((interes, idx) => (
                <li key={idx}>{interes}</li>
                ))}
            </ul>
            </div>
        </div>
    </div>
  );
}