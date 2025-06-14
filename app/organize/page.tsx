'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TimePicker from '../components/TimePicker';

const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });

type Location = { location_id: number; address: string };
type Organizer = { organizer_id: number; organizer_name: string };

export default function OrganizePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [evento, setEvento] = useState({
    event_name: '',
    event_date: '',
    description: '',
    start_time: '12:00',
    end_time: '13:00',
    organizer_id: 0,
    location_id: 0,
    price: '',
    availability: '',
    lat: 0,
    lng: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/locations').then(r => r.json()).then(setLocations);
    fetch('/api/organizers').then(r => r.json()).then(setOrganizers);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEvento(prev => ({
      ...prev,
      [name]: ['organizer_id', 'location_id'].includes(name)
        ? parseInt(value, 10) || 0
        : value,
    }));
  };

  const handleTimeChange = (field: 'start_time' | 'end_time') => (
    newValue: string
  ) => {
    setEvento(prev => ({ ...prev, [field]: newValue }));
  };

  const handleMapChange = (lat: number, lng: number) => {
    setEvento(prev => ({ ...prev, lat, lng }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(evento.start_time) ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(evento.end_time)
    ) {
      setError('Horas inválidas');
      return;
    }
    if (isNaN(evento.lat) || isNaN(evento.lng)) {
      setError('Selecciona ubicación');
      return;
    }

    const form = new FormData();
    Object.entries(evento).forEach(([k, v]) => form.append(k, String(v)));
    if (imageFile) form.append('image', imageFile);

    const res = await fetch('/api/events', { method: 'POST', body: form });
    if (!res.ok) {
      setError(await res.text());
    } else {
      setSuccess('Evento creado correctamente');
      alert('¡Evento creado correctamente!');  // Alerta al crear el evento
      setTimeout(() => router.push('/eventos'), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-lg p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Crear Evento</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="event_name"
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

            <div className="flex space-x-4">
              <TimePicker
                label="Hora inicio"
                value={evento.start_time}
                onChange={handleTimeChange('start_time')}
              />
              <TimePicker
                label="Hora término"
                value={evento.end_time}
                onChange={handleTimeChange('end_time')}
              />
            </div>

            <select
              name="organizer_id"
              className="w-full p-2 border rounded"
              value={evento.organizer_id}
              onChange={handleChange}
              required
            >
              <option value={0}>-- Organizador --</option>
              {organizers.map((o) => (
                <option key={o.organizer_id} value={o.organizer_id}>
                  {o.organizer_name}
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
              <option value={0}>-- Ubicación --</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.address}
                </option>
              ))}
            </select>

            <input
              name="price"
              placeholder="Precio"
              className="w-full p-2 border rounded"
              value={evento.price}
              onChange={handleChange}
              required
            />

            <input
              name="availability"
              type="number"
              placeholder="Disponibilidad"
              className="w-full p-2 border rounded"
              value={evento.availability}
              onChange={handleChange}
              required
            />

            <MapPicker lat={evento.lat} lng={evento.lng} onChange={handleMapChange} />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ backgroundColor: '#16A34A', color: 'white' }}
            >
              Guardar Evento
            </Button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
}
