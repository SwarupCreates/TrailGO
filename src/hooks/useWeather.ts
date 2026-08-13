import { useState, useEffect, useRef } from 'react';
import type { LiveLocation } from '../types/sensors';

export type WeatherData = {
  temperature: number;
  description: string;
  isRaining: boolean;
};

export function useWeather(location?: LiveLocation) {
  const [weather, setWeather] = useState<WeatherData | undefined>();
  const [error, setError] = useState<string>();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!location || fetchedRef.current) return;

    // Fetch once when location is acquired
    const fetchWeather = async () => {
      try {
        fetchedRef.current = true;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`
        );
        const data = await response.json();
        
        const temp = data.current?.temperature_2m ?? 0;
        const code = data.current?.weather_code ?? 0;
        
        let description = 'Clear';
        let isRaining = false;
        
        if (code >= 1 && code <= 3) description = 'Mostly Cloudy';
        else if (code >= 45 && code <= 48) description = 'Foggy';
        else if (code >= 51 && code <= 67) {
          description = 'Rainy';
          isRaining = true;
        } else if (code >= 71 && code <= 77) description = 'Snowing';
        else if (code >= 80 && code <= 82) {
          description = 'Rain Showers';
          isRaining = true;
        } else if (code >= 95) {
          description = 'Thunderstorm';
          isRaining = true;
        }

        setWeather({ temperature: temp, description, isRaining });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown weather error');
      }
    };

    fetchWeather();
  }, [location?.latitude, location?.longitude]);

  return { weather, error };
}
