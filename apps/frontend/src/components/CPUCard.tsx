import { motion } from 'framer-motion';
import type { CPUMetrics } from '@system-dashboard/shared';
import type { MetricHistory } from '../hooks/useMetrics';
import { RadialGauge } from './RadialGauge';
import { Sparkline } from './Sparkline';

function loadColor(l: number) {
  if (l < 50) return '#00ff9d';
  if (l < 80) return '#ffb300';
  return '#ff3d57';
}
function tempColor(t: number) {
  if (t === 0) return 'rgba(255,255,255,0.2)';
  if (t < 65) return '#00ff9d';
  if (t < 85) return '#ffb300';
  return '#ff3d57';
}

interface CPUCardProps { cpu: CPUMetrics; history: MetricHistory[]; }

export function CPUCard({ cpu, history }: CPUCardProps) {
  const lc = loadColor(cpu.load);
  const tc = tempColor(cpu.temperature);
  const cpuHistory = history.map((h) => h.cpuLoad);
  const freqPct = cpu.maxFrequency > 0 ? (cpu.frequency / cpu.maxFrequency) * 100 : 0;
  const ghz = (cpu.frequency / 1000).toFixed(2);

  return (
    <motion.div
      className="card-green h-full flex flex-col"
      style={{ color: '#00ff9d' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.06 }}
    >
      {/* ── Header strip ── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(0,255,157,0.12)', background: 'rgba(0,255,157,0.04)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="live-dot" style={{ backgroundColor: '#00ff9d', color: '#00ff9d' }} />
          <span className="label-text">CPU</span>
          <span className="badge" style={{ color: '#00ff9d', borderColor: 'rgba(0,255,157,0.3)' }}>
            {cpu.cores}C / {cpu.threads}T
          </span>
          <span className="font-sans text-xl text-white/50 truncate ml-1">{cpu.model}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="label-text">FREQ</span>
          <span className="font-display text-xl font-bold text-accent-green glow-green">
            {ghz}<span className="font-mono text-sm ml-1 opacity-60">GHz</span>
          </span>
        </div>
      </div>

      {/* ── Gauges ── */}
      <div className="flex justify-around items-center px-4 py-5"
        style={{ borderBottom: '1px solid rgba(0,255,157,0.08)' }}>
        <RadialGauge value={cpu.load} color={lc} label="LOAD" size={224} />
        <RadialGauge value={cpu.temperature} max={110} color={tc} label="TEMP" unit="°C" size={224} />
        <RadialGauge value={freqPct} color="#b388ff" label="BOOST" unit={`${ghz}G`} decimals={0} size={224} />
      </div>

      {/* ── Core bars ── */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,255,157,0.08)' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="label-text">CORE ACTIVITY</span>
          <span className="font-mono text-2xl" style={{ color: lc }}>{cpu.load.toFixed(1)}% AVG</span>
        </div>
        <div className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(cpu.perCore.length || 8, 16)}, 1fr)` }}>
          {(cpu.perCore.length > 0
            ? cpu.perCore
            : Array.from({ length: 16 }, (_, i) => ({ core: i, load: 0, frequency: 0 }))
          ).map((core) => {
            const cc = loadColor(core.load);
            return (
              <div key={core.core} className="flex flex-col items-center gap-1">
                <div className="w-full overflow-hidden flex flex-col-reverse"
                  style={{ height: 128, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <motion.div className="w-full"
                    style={{ backgroundColor: cc, boxShadow: `0 0 6px ${cc}70` }}
                    animate={{ height: `${core.load}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="font-mono text-[9px] text-white/20">{core.core}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Frequency bar ── */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,255,157,0.08)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="label-text">FREQUENCY</span>
          <span className="stat-value text-accent-purple">{ghz} / {(cpu.maxFrequency / 1000).toFixed(1)} GHz</span>
        </div>
        <div className="h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div className="h-full"
            style={{ backgroundColor: '#b388ff', boxShadow: '0 0 8px #b388ff60' }}
            animate={{ width: `${freqPct}%` }} transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="flex-1 px-5 py-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="label-text">LOAD HISTORY</span>
          <span className="font-mono text-2xl" style={{ color: lc }}>{cpu.load.toFixed(1)}%</span>
        </div>
        <div className="flex-1" style={{ minHeight: 60 }}>
          <Sparkline data={cpuHistory} color={lc} height={60} />
        </div>
      </div>
    </motion.div>
  );
}