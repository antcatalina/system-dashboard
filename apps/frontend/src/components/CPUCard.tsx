import { motion } from 'framer-motion';
import type { CPUMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { RadialGauge } from './RadialGauge';
import { Sparkline } from './Sparkline';

function tempColor(t: number) {
  if (t < 60) return '#00ff9d';
  if (t < 80) return '#ffb300';
  return '#ff3d57';
}

function loadColor(l: number) {
  if (l < 50) return '#00ff9d';
  if (l < 80) return '#ffb300';
  return '#ff3d57';
}

interface CPUCardProps {
  cpu: CPUMetrics;
  history: MetricHistory[];
}

export function CPUCard({ cpu, history }: CPUCardProps) {
  const cpuHistory = history.map((h) => h.cpuLoad);

  return (
    <motion.div
      className="card card-glow-green p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Header */}
      <div>
        <span className="label-text">CPU</span>
        <p className="font-sans text-sm text-white/70 mt-0.5 truncate">{cpu.model}</p>
        <p className="font-mono text-xs text-white/30 mt-0.5">{cpu.cores}C / {cpu.threads}T</p>
      </div>

      {/* Main gauges */}
      <div className="flex justify-around">
        <RadialGauge value={cpu.load} color={loadColor(cpu.load)} label="Load" size={110} />
        <RadialGauge value={cpu.temperature} max={110} color={tempColor(cpu.temperature)} label="Temp" unit="°C" size={110} />
        <RadialGauge value={(cpu.frequency / cpu.maxFrequency) * 100} color="#b388ff" label="Freq" unit={`${(cpu.frequency / 1000).toFixed(1)}G`} decimals={0} size={110} />
      </div>

      {/* Per-core grid */}
      <div>
        <span className="label-text mb-2 block">Per Core</span>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(cpu.perCore.length, 8)}, 1fr)` }}
        >
          {cpu.perCore.map((core) => (
            <div key={core.core} className="flex flex-col items-center gap-1">
              <div className="w-full bg-white/5 rounded-sm overflow-hidden" style={{ height: 40 }}>
                <motion.div
                  className="w-full rounded-sm"
                  style={{ backgroundColor: loadColor(core.load) }}
                  animate={{ height: `${core.load}%` }}
                  transition={{ duration: 0.4 }}
                  initial={{ height: '0%' }}
                />
              </div>
              <span className="font-mono text-[9px] text-white/30">{core.core}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <span className="label-text mb-1 block">Load History</span>
        <Sparkline data={cpuHistory} color="#00ff9d" />
      </div>
    </motion.div>
  );
}
