import { motion } from 'framer-motion';
import type { NetworkMetrics } from '@system-dashboard/shared';
import { Sparkline } from './Sparkline';

interface NetworkHistory { download: number; upload: number; }
interface NetworkCardProps { network: NetworkMetrics; history: NetworkHistory[]; }

function formatSpeed(mbps: number): { value: string; unit: string } {
  if (mbps >= 1000) return { value: (mbps / 1000).toFixed(2), unit: 'Gbps' };
  if (mbps >= 1)    return { value: mbps.toFixed(1), unit: 'Mbps' };
  return { value: (mbps * 1000).toFixed(0), unit: 'Kbps' };
}
function formatBytes(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  if (gb >= 1)    return `${gb.toFixed(2)} GB`;
  return `${(gb * 1024).toFixed(0)} MB`;
}
function latencyColor(ms: number) {
  if (ms === 0)  return 'rgba(255,255,255,0.2)';
  if (ms < 20)   return '#00ff9d';
  if (ms < 60)   return '#ffb300';
  return '#ff3d57';
}
function latencyLabel(ms: number) {
  if (ms === 0)  return '—';
  if (ms < 20)   return 'EXCELLENT';
  if (ms < 60)   return 'GOOD';
  if (ms < 100)  return 'FAIR';
  return 'POOR';
}

function SpeedBlock({ label, speed, color, arrow }: {
  label: string; speed: number; color: string; arrow: '↓' | '↑';
}) {
  const { value, unit } = formatSpeed(speed);
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-5 px-6"
      style={{ borderRight: arrow === '↓' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
      <span className="label-text mb-3">{label}</span>
      {/* Flow chevrons */}
      <div className="flex flex-col items-center gap-1 mb-3">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} style={{ width: 24, height: 5, backgroundColor: color, borderRadius: 2 }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: arrow === '↓' ? i * 0.2 : (2 - i) * 0.2 }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center" style={{ minHeight: 68 }}>
        <motion.span className="font-display font-bold tabular-nums leading-none"
          style={{ fontSize: 56, color, textShadow: `0 0 28px ${color}70` }}
          key={value}
          initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {value}
        </motion.span>
        <span className="font-mono text-xl mt-1.5 uppercase tracking-widest" style={{ color: `${color}70` }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export function NetworkCard({ network, history }: NetworkCardProps) {
  const dlHistory = history.map((h) => h.download);
  const ulHistory = history.map((h) => h.upload);
  const lc = latencyColor(network.latency);
  const primaryAdapter = network.adapters.find((a) => a.name === network.primaryAdapter) ?? network.adapters[0];

  return (
    <motion.div className="card-cyan flex"
      style={{ color: '#00e5ff', minHeight: 200 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>

      {/* ── Speed readouts ── */}
      <div className="flex" style={{ borderRight: '1px solid rgba(0,229,255,0.12)', minWidth: 380 }}>
        <SpeedBlock label="DOWNLOAD" speed={network.downloadSpeed} color="#00e5ff" arrow="↓" />
        <SpeedBlock label="UPLOAD" speed={network.uploadSpeed} color="#00ff9d" arrow="↑" />
      </div>

      {/* ── Sparklines ── */}
      <div className="flex-1 flex flex-col" style={{ borderRight: '1px solid rgba(0,229,255,0.12)' }}>
        <div className="flex-1 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="label-text">↓ DOWNLOAD</span>
            <span className="font-mono text-xl text-accent-cyan">
              {formatSpeed(network.downloadSpeed).value} {formatSpeed(network.downloadSpeed).unit}
            </span>
          </div>
          <Sparkline data={dlHistory} color="#00e5ff" height={56} />
        </div>
        <div className="flex-1 px-5 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="label-text">↑ UPLOAD</span>
            <span className="font-mono text-xl text-accent-green">
              {formatSpeed(network.uploadSpeed).value} {formatSpeed(network.uploadSpeed).unit}
            </span>
          </div>
          <Sparkline data={ulHistory} color="#00ff9d" height={56} />
        </div>
      </div>

      {/* ── Stats column ── */}
      <div className="flex flex-col" style={{ minWidth: 300, borderRight: '1px solid rgba(0,229,255,0.12)' }}>
        {/* Latency */}
        <div className="px-5 py-4 flex flex-col items-center justify-center flex-1"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.08)', background: `${lc}06` }}>
          <span className="label-text mb-2">LATENCY</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold tabular-nums"
              style={{ color: lc, textShadow: `0 0 20px ${lc}60` }}>
              {network.latency > 0 ? network.latency : '—'}
            </span>
            {network.latency > 0 && <span className="font-mono text-xl" style={{ color: `${lc}80` }}>ms</span>}
          </div>
          <span className="font-mono text-xl mt-1" style={{ color: lc }}>{latencyLabel(network.latency)}</span>
        </div>
        {/* Session totals */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
          <span className="label-text block mb-1">↓ SESSION</span>
          <span className="font-display text-2xl font-bold text-accent-cyan glow-cyan">{formatBytes(network.downloadTotal)}</span>
        </div>
        <div className="px-5 py-3">
          <span className="label-text block mb-1">↑ SESSION</span>
          <span className="font-display text-2xl font-bold text-accent-green glow-green">{formatBytes(network.uploadTotal)}</span>
        </div>
      </div>

      {/* ── Adapters ── */}
      <div className="flex flex-col" style={{ minWidth: 350 }}>
        <div className="px-5 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.04)' }}>
          <div className="live-dot" style={{ backgroundColor: '#00e5ff', color: '#00e5ff' }} />
          <span className="label-text">INTERFACES</span>
          {primaryAdapter && (
            <span className="badge ml-auto" style={{ color: '#00e5ff', borderColor: 'rgba(0,229,255,0.3)' }}>
              {primaryAdapter.type.toUpperCase()}
            </span>
          )}
        </div>
        {network.adapters.map((adapter) => {
          const isActive = adapter.name === network.primaryAdapter;
          return (
            <div key={adapter.name}
              className="flex items-center gap-3 px-5 py-3"
              style={{
                borderBottom: '1px solid rgba(0,229,255,0.06)',
                background: isActive ? 'rgba(0,229,255,0.04)' : 'transparent',
              }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? '#00e5ff' : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? '0 0 8px #00e5ff' : 'none' }} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xl truncate"
                  style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>
                  {adapter.name}
                </p>
                <p className="font-mono text-xl text-white/25">{adapter.ipv4}</p>
              </div>
              {adapter.speed > 0 && (
                <span className="font-mono text-xl flex-shrink-0"
                  style={{ color: isActive ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
                  {adapter.speed >= 1000 ? `${adapter.speed / 1000}G` : `${adapter.speed}M`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}