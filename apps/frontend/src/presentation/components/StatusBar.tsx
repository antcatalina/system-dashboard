import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/components/StatusBar.css';
import { ThemeSelector } from './ThemeSelector';

export function StatusBar({ connected }: { connected: boolean }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="status-bar">

      {/*
        Scan line rendered LAST so it's on top visually but isolated from flex layout.
        Using CSS animation instead of Framer Motion to avoid will-change/transform
        stacking context that would trap the ThemeSelector dropdown.
      */}
      <div className="status-bar__scan-line" />

      {/* Logo block */}
      <div className="status-bar__logo">
        <div className="status-bar__icon">
          <motion.div className="absolute inset-0 border border-accent-cyan/40"
            animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute inset-1.5 border border-accent-cyan/20"
            animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
          <div className="status-bar__icon-dot" />
        </div>
        <div>
          <span className="status-bar__title">
            SYS<span className="status-bar__title-highlight">PULSE</span>
          </span>
          <p className="status-bar__subtitle">REAL-TIME MONITOR</p>
        </div>
      </div>

      {/* Status block */}
      <div className="status-bar__status">
        <div className="relative">
          <div className={`status-bar__dot ${connected ? 'status-bar__dot--live' : 'status-bar__dot--offline'}`} />
          {connected && (
            <motion.div className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'var(--color-green)' }}
              animate={{ scale: [1, 3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        <span className={`status-bar__label ${connected ? 'status-bar__label--live' : 'status-bar__label--offline'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
        {connected && <span className="status-bar__refresh">1s REFRESH</span>}
      </div>

      {/* Center: tick ruler */}
      <div className="status-bar__center">
        <div className="status-bar__ruler">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i} className="status-bar__tick"
              style={{
                height: i % 10 === 0 ? 20 : i % 5 === 0 ? 14 : 8,
                backgroundColor: connected
                  ? `rgba(0,229,255,${0.08 + (i % 10 === 0 ? 0.35 : i % 5 === 0 ? 0.15 : 0)})`
                  : 'rgba(255,255,255,0.06)',
              }}
              animate={connected ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.03 }}
            />
          ))}
        </div>
      </div>

      {/* Clock block */}
      <div className="status-bar__clock">
        <div className="status-bar__time">
          <p className="status-bar__date">{dateStr}</p>
          <p className="status-bar__timevalue">{timeStr}</p>
        </div>
      </div>

      {/* Theme selector */}
      <div className="status-bar__theme-selector">
        <ThemeSelector />
      </div>

    </div>
  );
}