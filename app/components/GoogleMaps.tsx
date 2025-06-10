'use client';

import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface MapEvent {
  id: number;
  title: string;
  lat: number;
  lng: number;
}

export default function GoogleMaps({ events }: { events: MapEvent[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key no está definida');
      return;
    }

    if (!mapRef.current || events.length === 0) return;

    const loader = new Loader({ apiKey, version: 'weekly' });

    loader.load()
      .then(() => {
        // Inicializa el mapa centrado en el primer evento
        const map = new window.google.maps.Map(mapRef.current as HTMLDivElement, {
          center: { lat: events[0].lat, lng: events[0].lng },
          zoom: 12,
          mapId: 'NEXT_MAPS_TUTS',
        });

        // Agrega marcadores para cada evento
        events.forEach(({ id, title, lat, lng }) => {
          const marker = new window.google.maps.Marker({
            map,
            position: { lat, lng },
            title,
          });
          // Opcional: puedes guardar referencias a los marcadores si necesitas interactividad
        });
      })
      .catch((err) => console.error('Error al cargar Google Maps:', err));
  }, [apiKey, events]);

  return (
    <div
      ref={mapRef}
      className="h-[600px] w-full rounded-lg shadow"
    />
  );
}