// pages/eventos/nuevo.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { TextField, Button } from '@mui/material';
import { parse, format } from 'date-fns';
import type { LatLng } from '../components/MapPicker';

const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });
const MobileTimePicker = dynamic<React.ComponentType<any>>(
  () =>
    import('@mui/x-date-pickers/MobileTimePicker').then(
      (mod) => mod.MobileTimePicker ?? (mod as any).default
    ),
  { ssr: false }
);

type Location = { location_id: number; address: string };
type Organizer = { organizer_id: number; organizer_name: string };

export default function EventoForm() {
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
    fetch('/api/locations')
      .then(r => r.json())
      .then(setLocations);
    fetch('/api/organizers')
      .then(r => r.json())
      .then(setOrganizers);
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setEvento(prev => ({
      ...prev,
      [name]: ['organizer_id', 'location_id'].includes(name)
        ? parseInt(value, 10) || 0
        : value,
    }));
  };

  const stringToDate = (time: string) =>
    parse(time, 'HH:mm', new Date());

  const dateToString = (date: Date) =>
    format(date, 'HH:mm');

  const handleTime = (field: 'start_time' | 'end_time') => (newDate: Date | null) => {
    if (newDate) {
      const timeStr = dateToString(newDate);
      setEvento(prev => ({ ...prev, [field]: timeStr }));
    }
  };

  const handleMap = (lat: number, lng: number) => {
    setEvento(prev => ({ ...prev, lat, lng }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(evento.start_time) ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(evento.end_time)) {
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
      setTimeout(() => router.push('/eventos'), 2000);
    }
  };

  return (
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

          {mounted && (
            <div className="flex space-x-4">
              <MobileTimePicker
                label="Hora inicio"
                value={stringToDate(evento.start_time)}
                onChange={handleTime('start_time')}
                renderInput={params => <TextField {...params} fullWidth />}
              />
              <MobileTimePicker
                label="Hora término"
                value={stringToDate(evento.end_time)}
                onChange={handleTime('end_time')}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </div>
          )}

          <select
            name="organizer_id"
            className="w-full p-2 border rounded"
            value={evento.organizer_id}
            onChange={handleChange}
            required
          >
            <option value={0}>-- Organizador --</option>
            {organizers.map(o => (
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
            {locations.map(l => (
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

          <MapPicker lat={evento.lat} lng={evento.lng} onChange={handleMap} />

          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full p-2 border rounded"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ backgroundColor: '#16A34A' }}
          >
            Guardar Evento
          </Button>
        </form>
      </div>
    </div>
  );
}
