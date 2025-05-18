"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { create } from "zustand";
import { useRouter } from "next/navigation";
import GoogleMaps from "../components/GoogleMaps";

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

// Lista de eventos con coordenadas
const events = [
  {
    id: 1,
    title: "Encuentro Tech",
    description: "Un evento para entusiastas de la tecnología.",
    image: "/images/tech.jpg",
    lat: 19.432608,
    lng: -99.133209,
  },
  {
    id: 2,
    title: "Startup Night",
    description: "Presenta tu startup y conecta con inversores.",
    image: "/images/startup.jpg",
    lat: 19.45127,
    lng: -99.15488,
  },
  {
    id: 3,
    title: "Conferencia AI",
    description: "Descubre las últimas tendencias en IA.",
    image: "/images/ai.jpg",
    lat: 19.42847,
    lng: -99.12766,
  },
  {
    id: 4,
    title: "Networking Creativo",
    description: "Conecta con creativos de diferentes industrias.",
    image: "/images/creative.jpg",
    lat: 19.40033,
    lng: -99.16642,
  },
];

export default function EventList() {
  const { attending, toggleAttendance } = useEventStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">Eventos</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </nav>

      <h1 className="text-4xl font-bold mt-6 mb-6 text-gray-800">Eventos</h1>

      {events.map((event) => (
        <motion.div
          key={event.id}
          className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src={event.image}
            alt={event.title}
            width={400}
            height={200}
            className="rounded-lg object-cover"
          />
          <h2 className="text-xl font-semibold mt-2 text-gray-800">
            {event.title}
          </h2>
          <p className="text-gray-600">{event.description}</p>
          <p className="text-sm text-blue-700 mt-1">
            Ubicación: {event.lat}, {event.lng}
          </p>
          <button
            onClick={() => toggleAttendance(event.id)}
            className={`mt-2 px-4 py-2 rounded font-medium transition-colors duration-200 ${
              attending[event.id]
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-900 hover:bg-gray-400"
            }`}
          >
            {attending[event.id] ? "Asistiendo ✅" : "Asistir"}
          </button>
        </motion.div>
      ))}

      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Ubicaciones de los Eventos</h2>
        <GoogleMaps events={events} />
      </div>
    </div>
  );
}