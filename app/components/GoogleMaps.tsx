'use client';

import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Event {
  id: number;
  title: string;
  lat: number;
  lng: number;
}

export default function GoogleMaps({ events }: { events: Event[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        version: 'quartely',
      });

      const { Map } = await loader.importLibrary('maps');
      const { Marker } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

      const center = {
        lat: events[0]?.lat || 0,
        lng: events[0]?.lng || 0,
      };

      const map = new Map(mapRef.current as HTMLDivElement, {
        center,
        zoom: 12,
        mapId: 'NEXT_MAPS_TUTS',
      });

      events.forEach((event) => {
        new Marker({
          map,
          position: { lat: event.lat, lng: event.lng },
          title: event.title,
        });
      });
    };

    initializeMap();
  }, [events]);

  return <div className="h-[600px] w-full rounded-lg shadow" ref={mapRef} />;
}
