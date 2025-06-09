'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Carga dinámica del MapPicker para evitar errores de SSR
const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });

type Location = {
  location_id: number;
  address: string;
};

type Organizer = {
  organizer_id: number;
  organizer_name: string;
};

export default function EventoForm() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [evento, setEvento] = useState({
    event_name: '',
    event_date: '',
    description: '',
    start_time: '',
    end_time: '',
    organizer_id: 0,
    location_id: 0,
    price: '',
    availability: '',
    lat: 0,
    lng: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch(() => setError('Error al cargar ubicaciones'));

    fetch('/api/organizers')
      .then((res) => res.json())
      .then((data) => setOrganizers(data))
      .catch(() => setError('Error al cargar organizadores'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEvento((prev) => ({
      ...prev,
      [name]:
        name === 'organizer_id' || name === 'location_id'
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleMapChange = (lat: number, lng: number) => {
    setEvento((prev) => ({ ...prev, lat, lng }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      for (const key in evento) {
        formData.append(key, String((evento as any)[key]));
      }
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      alert('✅ Evento guardado correctamente!');
      router.push('/eventos');
    } catch (err: any) {
      console.error('Error al guardar evento:', err);
      setError(err.message || 'Error desconocido al guardar el evento');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Registro de Evento</h1>
        <button
          onClick={() => router.push('/login')}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </nav>

      <div className="flex justify-center items-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Crear Evento</h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="event_name"
              type="text"
              placeholder="Nombre del Evento"
              className="w-full p-2 border rounded"
              value={evento.event_name}
              onChange={handleChange}
              required
            />
            <input
              name="event_date"
              type="date"
              className="w-full p-2 border rounded"
              value={evento.event_date}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Descripción"
              className="w-full p-2 border rounded"
              value={evento.description}
              onChange={handleChange}
              required
            />
            <input
              name="start_time"
              type="time"
              className="w-full p-2 border rounded"
              value={evento.start_time}
              onChange={handleChange}
              required
            />
            <input
              name="end_time"
              type="time"
              className="w-full p-2 border rounded"
              value={evento.end_time}
              onChange={handleChange}
              required
            />
            <select
              name="organizer_id"
              className="w-full p-2 border rounded"
              value={evento.organizer_id}
              onChange={handleChange}
              required
            >
              <option value={0}>-- Elige un organizador --</option>
              {organizers.map((org) => (
                <option key={org.organizer_id} value={org.organizer_id}>
                  {org.organizer_name}
                </option>
              ))}
            </select>
            <select
              name="location_id"
              className="w-full p-2 border rounded"
              value={evento.location_id}
              onChange={handleChange}
              required
            >
              <option value={0}>-- Elige una ubicación --</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.address}
                </option>
              ))}
            </select>
            <label className="block relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                $
              </span>
              <input
                name="price"
                type="text"
                placeholder="0"
                className="w-full pl-7 p-2 border rounded"
                value={evento.price}
                onChange={handleChange}
                pattern="^\d+(\.\d{1,2})?$"
                required
              />
            </label>
            <input
              name="availability"
              type="text"
              placeholder="Disponibilidad"
              className="w-full p-2 border rounded"
              value={evento.availability}
              onChange={handleChange}
              pattern="\d+"
              required
            />

            {/* Map Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona la ubicación del evento:
              </label>
              <MapPicker lat={evento.lat} lng={evento.lng} onChange={handleMapChange} />
              <p className="text-xs text-gray-600 mt-1">
                Latitud: {evento.lat}, Longitud: {evento.lng}
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Guardar Evento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
