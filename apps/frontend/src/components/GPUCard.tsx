import { motion } from 'framer-motion';
import type { GPUMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { RadialGauge } from './RadialGauge';
import { Sparkline } from './Sparkline';
import clsx from 'clsx';

function tempColor(t: number) {
  if (t < 60) return '#00ff9d';
  if (t < 80) return '#ffb300';
  return '#ff3d57';
}

interface GPUCardProps {
  gpu: GPUMetrics;
  history: MetricHistory[];
}

export function GPUCard({ gpu, history }: GPUCardProps) {
  const vramPct = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const powerPct = (gpu.powerDraw / gpu.powerLimit) * 100;
  const gpuHistory = history.map((h) => h.gpuUtil);

  return (
    <motion.div
      className="card card-glow-cyan p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="label-text">GPU</span>
          <p className="font-sans text-sm text-white/70 mt-0.5 truncate max-w-[200px]">{gpu.model}</p>
        </div>
        <span className="font-mono text-xs text-white/30">v{gpu.driverVersion}</span>
      </div>

      {/* Main gauges */}
      <div className="flex justify-around">
        <RadialGauge value={gpu.utilization} color="#00e5ff" label="Util" size={110} />
        <RadialGauge value={gpu.temperature} max={110} color={tempColor(gpu.temperature)} label="Temp" unit="°C" size={110} />
        <RadialGauge value={gpu.fanSpeed} color="#b388ff" label="Fan" size={110} />
      </div>

      {/* VRAM bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="label-text">VRAM</span>
          <span className="stat-value">
            {gpu.memoryUsed.toFixed(0)} / {gpu.memoryTotal.toFixed(0)} MB
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent-cyan"
            style={{ boxShadow: '0 0 8px rgba(0,229,255,0.5)' }}
            animate={{ width: `${vramPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Power bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="label-text">Power</span>
          <span className="stat-value">{gpu.powerDraw.toFixed(0)}W / {gpu.powerLimit.toFixed(0)}W</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={clsx('h-full rounded-full', powerPct > 90 ? 'bg-accent-red' : 'bg-accent-amber')}
            animate={{ width: `${powerPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Clocks */}
      <div className="grid grid-cols-2 gap-2 border-t border-surface-border pt-3">
        <div>
          <span className="label-text">Core Clock</span>
          <p className="stat-value mt-0.5">{gpu.coreClock} MHz</p>
        </div>
        <div>
          <span className="label-text">Mem Clock</span>
          <p className="stat-value mt-0.5">{gpu.memoryClock} MHz</p>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <span className="label-text mb-1 block">Utilization History</span>
        <Sparkline data={gpuHistory} color="#00e5ff" />
      </div>
    </motion.div>
  );
}
