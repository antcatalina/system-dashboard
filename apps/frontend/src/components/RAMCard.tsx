import { motion } from 'framer-motion';
import type { RAMMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { Sparkline } from './Sparkline';

interface RAMCardProps {
  ram: RAMMetrics;
  history: MetricHistory[];
}

export function RAMCard({ ram, history }: RAMCardProps) {
  const ramHistory = history.map((h) => h.ramUsed);
  const color = ram.usedPercent > 85 ? '#ff3d57' : ram.usedPercent > 65 ? '#ffb300' : '#00ff9d';

  return (
    <motion.div
      className="card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <span className="label-text">RAM</span>
        <span className="font-mono text-xs" style={{ color }}>{ram.usedPercent.toFixed(1)}%</span>
      </div>

      {/* Liquid fill visual */}
      <div className="relative h-24 rounded-lg border border-surface-border overflow-hidden bg-white/[0.02]">
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{ backgroundColor: color, opacity: 0.15 }}
          animate={{ height: `${ram.usedPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 2, backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
          animate={{ bottom: `${ram.usedPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-white">{ram.used.toFixed(1)}</span>
          <span className="label-text">of {ram.total.toFixed(1)} GB</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Used</span>
            <span className="stat-value">{ram.used.toFixed(1)} GB</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} animate={{ width: `${ram.usedPercent}%` }} />
          </div>
        </div>
        {ram.swapTotal > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="label-text">Swap</span>
              <span className="stat-value">{ram.swapUsed.toFixed(1)} / {ram.swapTotal.toFixed(1)} GB</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-accent-purple" animate={{ width: `${(ram.swapUsed / ram.swapTotal) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      <div>
        <span className="label-text mb-1 block">Usage History</span>
        <Sparkline data={ramHistory} color={color} />
      </div>
    </motion.div>
  );
}
