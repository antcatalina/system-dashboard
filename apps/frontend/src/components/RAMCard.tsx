import { motion } from 'framer-motion';
import type { RAMMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { Sparkline } from './Sparkline';

interface RAMCardProps { ram: RAMMetrics; history: MetricHistory[]; }

export function RAMCard({ ram, history }: RAMCardProps) {
  const ramHistory = history.map((h) => h.ramUsed);
  const color = ram.usedPercent > 85 ? '#ff3d57' : ram.usedPercent > 65 ? '#ffb300' : '#b388ff';
  const glowClass = ram.usedPercent > 85 ? 'glow-red' : ram.usedPercent > 65 ? 'glow-amber' : 'glow-purple';
  const segments = 24;

  return (
    <motion.div className="card-purple h-full flex flex-col"
      style={{ color: '#b388ff' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.12 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(179,136,255,0.12)', background: 'rgba(179,136,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="live-dot" style={{ backgroundColor: color, color }} />
          <span className="label-text">MEMORY</span>
          <span className="font-mono text-xl text-white/30">{ram.total.toFixed(0)} GB</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="label-text">PRESSURE</span>
          <span className={`font-display text-3xl font-bold tabular-nums ${glowClass}`} style={{ color }}>
            {ram.usedPercent.toFixed(1)}<span className="font-mono text-base ml-1 opacity-60">%</span>
          </span>
        </div>
      </div>

      {/* ── Segmented bar ── */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(179,136,255,0.08)' }}>
        <div className="flex gap-0.5 mb-1.5">
          {Array.from({ length: segments }).map((_, i) => {
            const threshold = ((i + 1) / segments) * 100;
            const active = threshold <= ram.usedPercent + (100 / segments);
            const sc = threshold > 85 ? '#ff3d57' : threshold > 65 ? '#ffb300' : '#b388ff';
            return (
              <motion.div key={i} className="flex-1"
                style={{ height: 20, backgroundColor: active ? sc : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? `0 0 4px ${sc}50` : 'none' }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.01 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between">
          <span className="label-text" style={{ fontSize: 10 }}>0</span>
          <span className="label-text" style={{ fontSize: 10 }}>{(ram.total / 2).toFixed(0)} GB</span>
          <span className="label-text" style={{ fontSize: 10 }}>{ram.total.toFixed(0)} GB</span>
        </div>
      </div>

      {/* ── Used / Free / Swap ── */}
      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(179,136,255,0.08)' }}>
        <div className="px-5 py-4" style={{ borderRight: '1px solid rgba(179,136,255,0.08)', background: `${color}08` }}>
          <span className="label-text block mb-1">USED</span>
          <span className="font-display text-2xl font-bold" style={{ color }}>
            {ram.used.toFixed(1)}<span className="font-mono text-sm ml-1 opacity-60">GB</span>
          </span>
        </div>
        <div className="px-5 py-4">
          <span className="label-text block mb-1">FREE</span>
          <span className="font-display text-2xl font-bold text-white/40">
            {ram.free.toFixed(1)}<span className="font-mono text-sm ml-1 opacity-30">GB</span>
          </span>
        </div>
      </div>

      {ram.swapTotal > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(179,136,255,0.08)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="label-text">PAGEFILE</span>
            <span className="stat-value text-accent-purple">{ram.swapUsed.toFixed(1)} / {ram.swapTotal.toFixed(1)} GB</span>
          </div>
          <div className="h-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div className="h-full"
              style={{ backgroundColor: '#b388ff', boxShadow: '0 0 8px #b388ff50' }}
              animate={{ width: `${(ram.swapUsed / ram.swapTotal) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* ── Sparkline ── */}
      <div className="flex-1 px-5 py-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="label-text">USAGE HISTORY</span>
          <span className="font-mono text-2xl" style={{ color }}>{ram.usedPercent.toFixed(1)}%</span>
        </div>
        <div className="flex-1" style={{ minHeight: 50 }}>
          <Sparkline data={ramHistory} color={color} height={50} />
        </div>
      </div>
    </motion.div>
  );
}