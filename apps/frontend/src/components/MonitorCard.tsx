import { motion } from 'framer-motion';
import type { MonitorInfo } from '@system-dashboard/shared';

interface MonitorCardProps { monitors: MonitorInfo[]; }

export function MonitorCard({ monitors }: MonitorCardProps) {
  return (
    <motion.div className="card-amber flex flex-col"
      style={{ color: '#ffb300' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.18 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,179,0,0.12)', background: 'rgba(255,179,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="live-dot" style={{ backgroundColor: '#ffb300', color: '#ffb300' }} />
          <span className="label-text">DISPLAYS</span>
        </div>
        <span className="badge" style={{ color: '#ffb300', borderColor: 'rgba(255,179,0,0.3)' }}>
          {monitors.length} CONNECTED
        </span>
      </div>

      {/* ── Monitor rows — each as a stat strip ── */}
      {monitors.map((m, idx) => (
        <div key={m.id}
          className="flex items-center gap-4 px-5 py-3"
          style={{
            borderBottom: idx < monitors.length - 1 ? '1px solid rgba(255,179,0,0.08)' : 'none',
            background: m.primary ? 'rgba(255,179,0,0.04)' : 'transparent',
          }}>
          {/* Mini monitor SVG */}
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="flex-shrink-0">
            <rect x="1" y="1" width="34" height="20" rx="1.5"
              stroke={m.primary ? '#ffb300' : 'rgba(255,255,255,0.15)'}
              strokeWidth="1.5"
              fill={m.primary ? 'rgba(255,179,0,0.06)' : 'rgba(255,255,255,0.02)'} />
            <rect x="14" y="21" width="8" height="4" fill={m.primary ? 'rgba(255,179,0,0.4)' : 'rgba(255,255,255,0.1)'} />
            <rect x="9" y="25" width="18" height="1.5" rx="0.75" fill={m.primary ? 'rgba(255,179,0,0.3)' : 'rgba(255,255,255,0.08)'} />
            {m.primary && <circle cx="18" cy="11" r="3" fill="rgba(255,179,0,0.15)" stroke="#ffb300" strokeWidth="0.75" />}
          </svg>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-xl truncate"
                style={{ color: m.primary ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>
                {m.name}
              </span>
              {m.primary && (
                <span className="badge" style={{ color: '#ffb300', borderColor: 'rgba(255,179,0,0.4)', fontSize: 10 }}>PRIMARY</span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-mono text-xl text-white/40">{m.width}×{m.height}</span>
              <span className="font-mono text-xl font-semibold"
                style={{ color: m.refreshRate >= 120 ? '#00ff9d' : m.refreshRate >= 60 ? '#ffb300' : 'rgba(255,255,255,0.3)' }}>
                {m.refreshRate}Hz
              </span>
              <span className="font-mono text-xl text-white/20 uppercase">{m.primary ? 'HDMI' : 'DP'}</span>
            </div>
          </div>

          {/* Refresh rate bar */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1" style={{ width: 48 }}>
            <span className="label-text" style={{ fontSize: 9 }}>HZ</span>
            <div className="w-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full"
                style={{
                  width: `${Math.min((m.refreshRate / 240) * 100, 100)}%`,
                  backgroundColor: m.refreshRate >= 120 ? '#00ff9d' : '#ffb300',
                  boxShadow: `0 0 6px ${m.refreshRate >= 120 ? '#00ff9d' : '#ffb300'}60`,
                }} />
            </div>
            <span className="font-mono text-xl text-white/30">{m.refreshRate}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}