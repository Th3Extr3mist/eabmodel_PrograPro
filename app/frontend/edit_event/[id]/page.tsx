'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TimePicker from '../../../components/TimePicker';

const MapPicker = dynamic(() => import('../../../components/MapPicker'), { ssr: false });

type Location = { location_id: number; name?: string; address?: string };
type Organizer = { organizer_id: number; organizer_name: string };

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

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
    lat: -33.0245,
    lng: -71.5518,
    preference_1: '',
    preference_2: '',
    preference_3: '',
    weather_preference: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => {
          const normalizeTime = (time: string) => {
            if (!time) return '00:00';
            const match = time.match(/^(\d{2}):(\d{2})/);
            return match ? `${match[1]}:${match[2]}` : '00:00';
          };

          setEvento({
            ...data,
            start_time: normalizeTime(data.start_time),
            end_time: normalizeTime(data.end_time),
          });
        })
        .catch(err => console.error('Error al cargar evento:', err));
    }

    fetch('/api/locations').then(r => r.json()).then(setLocations);
    fetch('/api/organizers').then(r => r.json()).then(setOrganizers);
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEvento(prev => ({
      ...prev,
      [name]: ['organizer_id', 'location_id'].includes(name)
        ? parseInt(value, 10) || 0
        : value,
    }));
  };

  const handleTimeChange = (field: 'start_time' | 'end_time') => (newValue: string) => {
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

    const cleanTime = (time: string) => time.slice(0, 5);

    if (
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(cleanTime(evento.start_time)) ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(cleanTime(evento.end_time))
    ) {
      setError('Horas inválidas');
      return;
    }

    if (isNaN(evento.lat) || isNaN(evento.lng)) {
      setError('Selecciona ubicación');
      return;
    }

    if (evento.organizer_id && !organizers.some(o => o.organizer_id === evento.organizer_id)) {
      setError('Organizador no válido');
      return;
    }

    if (evento.location_id && !locations.some(l => l.location_id === evento.location_id)) {
      setError('Ubicación no válida');
      return;
    }

    const form = new FormData();
    Object.entries(evento).forEach(([k, v]) => {
      if (k === 'start_time' || k === 'end_time') {
        form.append(k, cleanTime(v as string));
      } else {
        form.append(k, String(v));
      }
    });
    if (imageFile) form.append('image', imageFile);

    const res = await fetch(`/api/events/${eventId}`, { method: 'PUT', body: form });
    if (!res.ok) {
      setError(await res.text());
    } else {
      setSuccess('Evento actualizado correctamente');
      alert('¡Evento actualizado correctamente!');
      setTimeout(() => router.push('/frontend/profileorga'), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col min-h-screen bg-gray-100 p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Evento</h2>
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
              <input
                name="preference_1"
                placeholder="Preferencia 1 (outdoor o indoor)"
                className="w-full p-2 border rounded"
                value={evento.preference_1}
                onChange={handleChange}
              />
              <input
                name="preference_2"
                placeholder="Preferencia 2 (geek o cultural)"
                className="w-full p-2 border rounded"
                value={evento.preference_2}
                onChange={handleChange}
              />
              <input
                name="preference_3"
                placeholder="Preferencia 3 (solo o grupo)"
                className="w-full p-2 border rounded"
                value={evento.preference_3}
                onChange={handleChange}
              />
              <input
                name="weather_preference"
                placeholder="Clima preferente (despejado o lluvia)"
                className="w-full p-2 border rounded"
                value={evento.weather_preference}
                onChange={handleChange}
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
                    {l.name ?? l.address}
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
                Editar Evento
              </Button>
            </form>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}
