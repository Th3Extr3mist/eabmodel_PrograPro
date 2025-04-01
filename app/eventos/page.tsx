"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation"; 

// Estado global para controlar asistencia a eventos
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

const events = [
  { id: 1, title: "Encuentro Tech", description: "Un evento para entusiastas de la tecnología.", image: "/images/tech.jpg" },
  { id: 2, title: "Startup Night", description: "Presenta tu startup y conecta con inversores.", image: "/images/startup.jpg" },
  { id: 3, title: "Conferencia AI", description: "Descubre las últimas tendencias en IA.", image: "/images/ai.jpg" },
  { id: 4, title: "Networking Creativo", description: "Conecta con creativos de diferentes industrias.", image: "/images/creative.jpg" },
];

export default function EventList() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter(); 

  const handleLogout = () => {
    router.push("/login"); // Redirigir al login
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Eventos</h1>

      {events.map((event) => (
        <motion.div
          key={event.id}
          className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Image src={event.image} alt={event.title} width={400} height={200} className="rounded-lg" />
          <h2 className="text-xl font-semibold mt-2">{event.title}</h2>
          <p className="text-gray-600">{event.description}</p>
          <button
            onClick={() => toggleAttendance(event.id)}
            className={`mt-2 px-4 py-2 rounded ${
              attending[event.id] ? "bg-green-500 text-white" : "bg-gray-300 text-black"
            }`}
          >
            {attending[event.id] ? "Asistiendo ✅" : "Asistir"}
          </button>
        </motion.div>
      ))}

      <button 
        onClick={handleLogout} 
        className="mt-6 px-6 py-3 bg-red-500 text-white font-bold rounded-lg"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}