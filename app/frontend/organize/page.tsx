// app/frontend/organize/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizeEventPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    event_name: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    address: '',
    price: '',
    availability: '',
    lat: '',
    lng: '',
    image: '',
    preference_1: '',
    preference_2: '',
    preference_3: '',
    weather_preference: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/frontend/eventos');
    } else {
      alert('Error al crear el evento');
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Organizar Evento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="event_name"
          placeholder="Nombre del evento"
          className="w-full border p-2 rounded"
          value={form.event_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="event_date"
          className="w-full border p-2 rounded"
          value={form.event_date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="start_time"
          className="w-full border p-2 rounded"
          value={form.start_time}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="end_time"
          className="w-full border p-2 rounded"
          value={form.end_time}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Dirección del evento"
          className="w-full border p-2 rounded"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={handleChange}
        />
        <input
          type="number"
          name="availability"
          placeholder="Cupos disponibles"
          className="w-full border p-2 rounded"
          value={form.availability}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lat"
          placeholder="Latitud"
          className="w-full border p-2 rounded"
          value={form.lat}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lng"
          placeholder="Longitud"
          className="w-full border p-2 rounded"
          value={form.lng}
          onChange={handleChange}
        />
        <input
          name="image"
          placeholder="Imagen (base64 o URL)"
          className="w-full border p-2 rounded"
          value={form.image}
          onChange={handleChange}
        />
        <input
          name="preference_1"
          placeholder="Preferencia 1"
          className="w-full border p-2 rounded"
          value={form.preference_1}
          onChange={handleChange}
        />
        <input
          name="preference_2"
          placeholder="Preferencia 2"
          className="w-full border p-2 rounded"
          value={form.preference_2}
          onChange={handleChange}
        />
        <input
          name="preference_3"
          placeholder="Preferencia 3"
          className="w-full border p-2 rounded"
          value={form.preference_3}
          onChange={handleChange}
        />
        <select
          name="weather_preference"
          className="w-full border p-2 rounded"
          value={form.weather_preference}
          onChange={handleChange}
        >
          <option value="">Clima preferido</option>
          <option value="soleado">Soleado</option>
          <option value="lluvia">Lluvia</option>
          <option value="indiferente">Indiferente</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Crear evento
        </button>
      </form>
    </main>
  );
}