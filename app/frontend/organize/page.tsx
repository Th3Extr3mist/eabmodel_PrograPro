'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TimePicker from '../../components/TimePicker';

const MapPicker = dynamic(() => import('../../components/MapPicker'), { ssr: false });

type Location = { location_id: number; name?: string; address?: string };
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
  preference_1: '',
  preference_2: '',
  preference_3: '',
  weather_preference: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/locations').then(r => r.json()).then(setLocations);
    fetch('/api/organizers').then(r => r.json()).then(setOrganizers);
    console.log(organizers);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/frontend/login');
  };

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

    // Validation for invalid organizer or location
    if (evento.organizer_id && !organizers.some(o => o.organizer_id === evento.organizer_id)) {
      setError('Organizador no válido');
      return;
    }

    if (evento.location_id && !locations.some(l => l.location_id === evento.location_id)) {
      setError('Ubicación no válida');
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
      alert('¡Evento creado correctamente!');
      setTimeout(() => router.push('/frontend/eventos'), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col min-h-screen bg-gray-100 p-6 text-gray-900">
        {/* NAVBAR */}
        <nav className="w-full bg-white border-b border-gray-300 py-3 px-6 rounded-lg shadow-lg flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold text-gray-900">Organizar Evento</h1>
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="top-7 right-6 z-50 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-200"
            >
              ☰ Menú
            </button>
          )}
          <div
            ref={sidebarRef}
            className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-600 text-2xl"
            >
              ×
            </button>
            <nav className="mt-16 flex flex-col items-start space-y-4 px-6 text-gray-800">
              <button onClick={() => { router.push('/frontend/eventos'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos</button>
              <button onClick={() => { router.push('/frontend/profile'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Perfil</button>
              <button onClick={() => { router.push('/frontend/save-events'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Eventos Guardados</button>
              <button onClick={() => { router.push('/frontend/my-plans'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Mis Planes</button>
              <button onClick={() => { router.push('/frontend/organize'); setIsSidebarOpen(false); }} className="hover:text-blue-600">Organizar Evento</button>
              <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="mt-4 text-red-600 hover:text-red-800 font-semibold">Cerrar Sesión</button>
            </nav>
          </div>
        </nav>

        {/* FORMULARIO */}
        <div className="flex items-center justify-center">
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
                placeholder="Clima preferente para el evento (despejado o lluvia)"
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
                Guardar Evento
              </Button>
            </form>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}
