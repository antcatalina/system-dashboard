import { useWeather } from "../../hooks/useWeather";

export function Weather(): JSX.Element | null {
  const weather = useWeather();
  if (!weather) return null;

  return (
    <div className="status-bar__weather" title={weather.city ?? undefined}>
      <span className="status-bar__weather-icon">{weather.icon}</span>
      <div className="status-bar__weather-text">
        <span className="status-bar__weather-temp">{weather.tempF}°F</span>
        <span className="status-bar__weather-label">{weather.label}</span>
      </div>
    </div>
  );
}
