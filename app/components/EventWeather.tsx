'use client';

import React, { useEffect, useState } from 'react';

interface EventWeatherProps {
  lat: number;
  lng: number;
  startTimestamp: number;
}

export default function EventWeather({ lat, lng, startTimestamp }: EventWeatherProps) {
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startTimestamp) return;

    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) {
          setError('API Key no definida');
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if (!response.ok) {
          console.error(data);
          setError('Error al obtener los datos del clima');
          return;
        }

        const closest = data.list.reduce((prev: any, curr: any) =>
          Math.abs(curr.dt - startTimestamp) < Math.abs(prev.dt - startTimestamp) ? curr : prev
        );

        setWeatherData(closest);
      } catch (err) {
        console.error(err);
        setError('No se pudo obtener el clima');
      }
    };

    fetchWeather();
  }, [startTimestamp, lat, lng]);

  if (error) return <div className="text-center text-red-600"><p>{error}</p></div>;
  if (!weatherData) return <div className="text-center"><p>Cargando datos del clima...</p></div>;

  const temperature = weatherData.main?.temp ?? '--';
  const humidity = weatherData.main?.humidity ?? '--';
  const weatherDescription = weatherData.weather?.[0]?.description ?? 'Sin descripción';
  const weatherIcon = weatherData.weather?.[0]?.icon;
  const iconUrl = weatherIcon ? `https://openweathermap.org/img/wn/${weatherIcon}@2x.png` : '';

  const forecastTime = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(weatherData.dt * 1000));

  return (
    <div>
      <div className="text-center mb-4">
        {iconUrl && <img src={iconUrl} alt="Weather icon" className="w-16 h-16 mx-auto" />}
        <h4 className="text-xl font-semibold">{weatherDescription}</h4>
        <p className="text-lg">Temp: {temperature}°C</p>
        <p className="text-lg">Humedad: {humidity}%</p>
        <p className="text-sm text-gray-500">Pronóstico para: {forecastTime}</p>
      </div>
    </div>
  );
}