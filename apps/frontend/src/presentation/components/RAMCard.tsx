import { motion } from 'framer-motion';
import type { RAM } from '../../domain';
import type { MetricHistory } from '../hooks/useMetrics';
import { Sparkline } from './Sparkline';
import { getMemoryColor } from '../../shared/utils/colors';

interface RAMCardProps {
  ram: RAM;
  history: MetricHistory[];
}

export function RAMCard({ ram, history }: RAMCardProps) {
  const ramHistory = history.map((h) => h.ramUsed);
  const color = getMemoryColor(ram.usedPercent);
  const glowClass =
    ram.usedPercent > 85
      ? 'glow-red'
      : ram.usedPercent > 65
      ? 'glow-amber'
      : 'glow-purple';
  const segments = 24;

  return (
    <motion.div className="ram-card h-full flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.12 }}>

      {/* ── Header ── */}
      <div className="ram-card__header">
        <div className="flex items-center gap-3">
          <div className="ram-card__dot" style={{ backgroundColor: color, color }} />
          <span className="ram-card__label">MEMORY</span>
          <span className="ram-card__badge">{ram.total.toFixed(0)} GB</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="ram-card__label">PRESSURE</span>
          <span className={`ram-card__pressure ${glowClass}`} style={{ color: color }}>
            {ram.usedPercent.toFixed(1)}<span className={`ram-card__pressure-unit`}>%</span>
          </span>
        </div>
      </div>

      {/* ── Segmented bar ── */}
      <div className="ram-card__bar-section">
        <div className="flex gap-0.5 mb-1.5">
          {Array.from({ length: segments }).map((_, i) => {
            const threshold = ((i + 1) / segments) * 100;
            const active = threshold <= ram.usedPercent + (100 / segments);
            const sc = threshold > 85 ? '#ff3d57' : threshold > 65 ? '#ffb300' : '#b388ff';
            return (
              <motion.div key={i} className="flex-1"
                style={{ height: 48, backgroundColor: active ? sc : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? `0 0 4px ${sc}50` : 'none' }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.01 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between">
          <span className="ram-card__label">0</span>
          <span className="ram-card__label">{(ram.total / 2).toFixed(0)} GB</span>
          <span className="ram-card__label">{ram.total.toFixed(0)} GB</span>
        </div>
      </div>

      {/* ── Used / Free / Swap ── */}
      <div className="ram-card__stats">
        <div className="ram-card__stat ram-card__stat--used">
          <span className="ram-card__label">USED</span>
          <span className={`ram-card__stat-value ${glowClass}`} style={{ color }}>
            {ram.used.toFixed(1)}<span className="ram-card__stat-unit">GB</span>
          </span>
        </div>
        <div className="ram-card__stat ram-card__stat--free">
          <span className="ram-card__label">FREE</span>
          <span className="ram-card__stat-value text-white/40">
            {ram.free.toFixed(1)}<span className="ram-card__stat-unit">GB</span>
          </span>
        </div>
      </div>

      {ram.swapTotal > 0 && (
        <div className="ram-card__swap">
          <div className="flex justify-between items-center mb-2">
            <span className="ram-card__label">PAGEFILE</span>
            <span className="ram-card__swap-value">{ram.swapUsed.toFixed(1)} / {ram.swapTotal.toFixed(1)} GB</span>
          </div>
          <div className="ram-card__swap-bar">
            <motion.div className="h-full"
              style={{ backgroundColor: '#b388ff', boxShadow: '0 0 8px #b388ff50' }}
              animate={{ width: `${(ram.swapUsed / ram.swapTotal) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* ── Sparkline ── */}
      <div className="ram-card__sparkline">
        <div className="flex justify-between items-center mb-3">
          <span className="ram-card__label">USAGE HISTORY</span>
          <span className="ram-card__sparkline-value" style={{ color }}>{ram.usedPercent.toFixed(1)}%</span>
        </div>
        <div className="ram-card__sparkline-chart">
          <Sparkline data={ramHistory} color={color} height={84} />
        </div>
      </div>
    </motion.div>
  );
}