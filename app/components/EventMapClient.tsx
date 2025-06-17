'use client';

import React from 'react';
import GoogleMaps, { MapEvent } from './GoogleMaps';

interface Props {
  events: MapEvent[];
}

export default function EventMapClient({ events }: Props) {
  return <GoogleMaps events={events} />;
}
