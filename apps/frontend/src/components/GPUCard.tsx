import { motion } from 'framer-motion';
import type { GPUMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { RadialGauge } from './RadialGauge';
import { Sparkline } from './Sparkline';

function tempColor(t: number) {
  if (t < 60) return '#00ff9d';
  if (t < 75) return '#ffb300';
  return '#ff3d57';
}

interface GPUCardProps { gpu: GPUMetrics; history: MetricHistory[]; }

export function GPUCard({ gpu, history }: GPUCardProps) {
  const vramPct = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const powerPct = (gpu.powerDraw / gpu.powerLimit) * 100;
  const tc = tempColor(gpu.temperature);
  const gpuHistory = history.map((h) => h.gpuUtil);

  return (
    <motion.div
      className="card-cyan h-full flex flex-col"
      style={{ color: '#00e5ff' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
    >
      {/* ── Header strip ── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.04)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="live-dot" style={{ backgroundColor: '#00e5ff', color: '#00e5ff' }} />
          <span className="label-text">GPU</span>
          <span className="badge" style={{ color: '#00e5ff', borderColor: 'rgba(0,229,255,0.3)' }}>NVIDIA</span>
          <span className="font-sans text-xl text-white/50 truncate ml-1">{gpu.model}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="label-text">DRV</span>
          <span className="font-mono text-xl text-white/30">{gpu.driverVersion}</span>
        </div>
      </div>

      {/* ── Gauges ── */}
      <div className="flex justify-around items-center px-4 py-5"
        style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <RadialGauge value={gpu.utilization} color="#00e5ff" label="UTILIZATION" size={250} />
        <RadialGauge value={gpu.temperature} max={110} color={tc} label="TEMP" unit="°C" size={250} />
        <RadialGauge value={gpu.fanSpeed} color="#b388ff" label="FAN SPEED" size={250} />
      </div>

      {/* ── VRAM + Power bars ── */}
      <div style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        {[
          { label: 'VRAM', value: `${gpu.memoryUsed.toFixed(0)} / ${gpu.memoryTotal.toFixed(0)} MB`, pct: vramPct, color: '#00e5ff' },
          { label: 'POWER', value: `${gpu.powerDraw.toFixed(0)}W / ${gpu.powerLimit.toFixed(0)}W`, pct: powerPct, color: powerPct > 90 ? '#ff3d57' : '#ffb300' },
        ].map(({ label, value, pct, color }) => (
          <div key={label} className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="label-text">{label}</span>
              <span className="stat-value" style={{ color }}>{value}</span>
            </div>
            <div className="h-2 rounded-none overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <motion.div className="h-full"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Clock tiles ── */}
      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <div className="px-5 py-4" style={{ borderRight: '1px solid rgba(0,229,255,0.08)', background: 'rgba(0,229,255,0.03)' }}>
          <span className="label-text block mb-2">CORE CLOCK</span>
          <span className="font-display text-5xl font-bold text-accent-cyan glow-cyan">
            {gpu.coreClock}<span className="font-mono text-xl ml-1.5 opacity-60">MHz</span>
          </span>
        </div>
        <div className="px-5 py-4" style={{ background: 'rgba(179,136,255,0.03)' }}>
          <span className="label-text block mb-2">MEM CLOCK</span>
          <span className="font-display text-5xl font-bold text-accent-purple glow-purple">
            {gpu.memoryClock}<span className="font-mono text-xl ml-1.5 opacity-60">MHz</span>
          </span>
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="flex-1 px-5 py-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="label-text">UTILIZATION HISTORY</span>
          <span className="font-mono text-2xl text-accent-cyan">{gpu.utilization.toFixed(0)}%</span>
        </div>
        <div className="flex-1" style={{ minHeight: 84 }}>
          <Sparkline data={gpuHistory} color="#00e5ff" height={84} />
        </div>
      </div>
    </motion.div>
  );
}