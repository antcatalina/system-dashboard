import { useEffect, useState } from "react";
import { useLocation, type LocationData } from "./useLocation";

export interface WeatherData {
  tempF: number;
  label: string;
  icon: string;
  city: string | null;
}

const REFRESH_MS = 10 * 60 * 1000; // refresh weather every 10 minutes

// WMO weather interpretation codes → Windows-style label + icon.
function describe(
  code: number,
  isDay: boolean,
): { label: string; icon: string } {
  if (code === 0)
    return isDay
      ? { label: "Sunny", icon: "☀️" }
      : { label: "Clear", icon: "🌙" };
  if (code === 1)
    return isDay
      ? { label: "Mostly sunny", icon: "🌤️" }
      : { label: "Mostly clear", icon: "🌙" };
  if (code === 2) return { label: "Partly cloudy", icon: isDay ? "⛅" : "☁️" };
  if (code === 3) return { label: "Cloudy", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: "🌦️" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "🌨️" };
  if (code >= 95) return { label: "Thunderstorm", icon: "⛈️" };
  return { label: "—", icon: "🌡️" };
}

async function fetchWeather(geo: LocationData): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}` +
    `&longitude=${geo.longitude}` +
    `&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather request failed");
  const j = await res.json();
  const c = j.current;
  const { label, icon } = describe(c.weather_code, c.is_day === 1);
  return { tempF: Math.round(c.temperature_2m), label, icon, city: geo.city };
}

export function useWeather(): WeatherData | null {
  const location = useLocation();
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!location) return;
    let active = true;

    const load = async () => {
      try {
        const w = await fetchWeather(location);
        if (active) setData(w);
      } catch {
        // Keep the last good reading; ignore transient network errors.
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [location]);

  return data;
}
