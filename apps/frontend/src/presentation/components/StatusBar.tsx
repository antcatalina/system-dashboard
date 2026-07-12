import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "../styles/components/StatusBar.css";
import { ThemeSelector } from "./ThemeSelector";
import { Weather } from "./Weather";
import { LocationSearch } from "./LocationSearch";
import { useLocation } from "../../hooks/useLocation";

export function StatusBar({ connected }: { connected: boolean }): JSX.Element {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Reflect the selected location's timezone (city/ZIP), not the device's own.
  const timeZone = location?.timezone ?? undefined;
  const timeStr = time.toLocaleTimeString("en-US", { hour12: false, timeZone });
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  });

  return (
    <div className="status-bar">
      {/*
        Scan line rendered LAST so it's on top visually but isolated from flex layout.
        Using CSS animation instead of Framer Motion to avoid will-change/transform
        stacking context that would trap the ThemeSelector dropdown.
      */}
      <div className="status-bar__scan-line" />

      {/* Status block */}
      <div className="status-bar__status">
        <div className="relative">
          <div
            className={`status-bar__dot ${connected ? "status-bar__dot--live" : "status-bar__dot--offline"}`}
          />
          {connected && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "var(--color-green)" }}
                animate={{ scale: [1, 3.2], opacity: [0.8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "var(--color-green)" }}
                animate={{ scale: [1, 3.2], opacity: [0.8, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.7,
                }}
              />
            </>
          )}
        </div>
        <span
          className={`status-bar__label ${connected ? "status-bar__label--live" : "status-bar__label--offline"}`}
        >
          {connected ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {/*
        Portrait-only: animated tick ruler filling the top row between LIVE
        and the theme selector. Hidden in landscape.
      */}
      <div className="status-bar__pulse">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="status-bar__tick"
            style={{
              height: i % 10 === 0 ? 20 : i % 5 === 0 ? 14 : 8,
              backgroundColor: connected
                ? `rgba(0,229,255,${0.08 + (i % 10 === 0 ? 0.35 : i % 5 === 0 ? 0.15 : 0)})`
                : "rgba(255,255,255,0.06)",
            }}
            animate={connected ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.03 }}
          />
        ))}
      </div>

      {/*
        Portrait-only line break: forces the status/theme-selector row onto
        its own line, with clock/location/weather wrapping to the row below.
        Invisible in landscape (no flex-basis rule outside the portrait query).
      */}
      <div className="status-bar__row-break" />

      {/* Local weather (auto-located via IP) */}
      <Weather />

      {/* Center: live location — click to search a city or US ZIP */}
      <div className="status-bar__center">
        <LocationSearch />
      </div>

      {/* Clock block */}
      <div className="status-bar__clock">
        <div className="status-bar__time">
          <span className="status-bar__date">{dateStr}</span>
          <span className="status-bar__date status-bar__date--divider">·</span>
          <span className="status-bar__timevalue">{timeStr}</span>
        </div>
      </div>

      {/* Theme selector */}
      <div className="status-bar__theme-selector">
        <ThemeSelector />
      </div>
    </div>
  );
}
