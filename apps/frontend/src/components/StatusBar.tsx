import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface StatusBarProps {
  connected: boolean;
  timestamp?: number;
}

export function StatusBar({ connected, timestamp }: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-stretch border-b relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(0,229,255,0.05) 0%, rgba(0,229,255,0.02) 100%)',
        borderBottomColor: 'rgba(0,229,255,0.2)',
        minHeight: 64,
      }}>

      {/* Animated scan line */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #00e5ff 50%, transparent 100%)' }}
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Logo block */}
      <div className="flex items-center gap-3 px-6"
        style={{ borderRight: '1px solid rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.03)' }}>
        <div className="relative w-8 h-8 flex-shrink-0">
          <motion.div className="absolute inset-0 border border-accent-cyan/40"
            animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute inset-1.5 border border-accent-cyan/20"
            animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent-cyan" style={{ boxShadow: '0 0 10px #00e5ff' }} />
          </div>
        </div>
        <div>
          <span className="font-display text-xl font-bold tracking-[0.15em]">
            SYS<span className="text-accent-cyan glow-cyan">PULSE</span>
          </span>
          <p className="label-text" style={{ fontSize: 14, marginTop: 1 }}>REAL-TIME MONITOR</p>
        </div>
      </div>

      {/* Status block */}
      <div className="flex items-center gap-3 px-6"
        style={{ borderRight: '1px solid rgba(0,229,255,0.1)' }}>
        <div className="relative">
          <div className="w-2 h-2 rounded-full"
            style={{ backgroundColor: connected ? '#00ff9d' : '#ff3d57' }} />
          {connected && (
            <motion.div className="absolute inset-0 rounded-full"
              style={{ backgroundColor: '#00ff9d' }}
              animate={{ scale: [1, 3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        <span className="font-mono text-sm" style={{ color: connected ? '#00ff9d' : '#ff3d57' }}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
        {connected && <span className="font-mono text-xs text-white/20">1s REFRESH</span>}
      </div>

      {/* Center: tick ruler */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="flex items-end gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i}
              style={{
                width: 1.5,
                height: i % 10 === 0 ? 20 : i % 5 === 0 ? 14 : 8,
                backgroundColor: connected
                  ? `rgba(0,229,255,${0.08 + (i % 10 === 0 ? 0.35 : i % 5 === 0 ? 0.15 : 0)})`
                  : 'rgba(255,255,255,0.06)',
                borderRadius: 1,
              }}
              animate={connected ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.03 }}
            />
          ))}
        </div>
      </div>

      {/* Clock block */}
      <div className="flex items-center gap-4 px-6"
        style={{ borderLeft: '1px solid rgba(0,229,255,0.1)', background: 'rgba(0,229,255,0.02)' }}>
        <div className="text-right">
          <p className="font-mono text-sm text-white/30 uppercase tracking-widest">{dateStr}</p>
          <p className="font-display text-2xl font-bold tabular-nums"
            style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em' }}>
            {timeStr}
          </p>
        </div>
      </div>
    </div>
  );
}