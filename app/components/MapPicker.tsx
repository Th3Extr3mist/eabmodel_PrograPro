'use client';

import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map>();
  const markerRef = useRef<google.maps.Marker>();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader.load().then(() => {
      const position = { lat, lng };

      const map = new window.google.maps.Map(mapRef.current!, {
        center: position,
        zoom: 13,
      });

      const marker = new window.google.maps.Marker({
        position,
        map,
        draggable: true,
      });

      marker.addListener('dragend', (event) => {
        const newLat = event.latLng?.lat();
        const newLng = event.latLng?.lng();
        if (newLat && newLng) {
          onChange(newLat, newLng);
        }
      });

      map.addListener('click', (e) => {
        const clickedLat = e.latLng?.lat();
        const clickedLng = e.latLng?.lng();
        if (clickedLat && clickedLng) {
          marker.setPosition({ lat: clickedLat, lng: clickedLng });
          onChange(clickedLat, clickedLng);
        }
      });

      mapInstance.current = map;
      markerRef.current = marker;
    });
  }, []);

  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      const newPosition = { lat, lng };
      mapInstance.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-64 rounded border" />;
}