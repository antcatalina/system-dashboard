import { motion } from 'framer-motion';
import type { Network } from '../../domain';
import type { MetricHistory } from '../hooks/useMetrics';
import { Sparkline } from './Sparkline';
import { formatSpeed, formatBytes } from '../../shared/utils/formatters';
import { getLatencyColor } from '../../shared/utils/colors';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../../shared/utils/themeColors';

interface NetworkCardProps {
  network: Network;
  history: MetricHistory[];
}

function latencyLabel(ms: number) {
  if (ms === 0) return '—';
  if (ms < 20) return 'EXCELLENT';
  if (ms < 60) return 'GOOD';
  if (ms < 100) return 'FAIR';
  return 'POOR';
}

function SpeedBlock({ label, speed, color, secondaryColor, arrow, borderColor }: {
  label: string; speed: number; color: string; secondaryColor: string; arrow: '↓' | '↑'; borderColor: string;
}) {
  const formatted = formatSpeed(speed);
  const c = arrow === '↓' ? color : secondaryColor;
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-5 px-6"
      style={{ borderRight: arrow === '↓' ? `1px solid ${borderColor}` : 'none' }}>
      <span className="label-text mb-3">{label}</span>
      <div className="flex flex-col items-center gap-1 mb-3">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} style={{ width: 24, height: 5, backgroundColor: c, borderRadius: 2 }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: arrow === '↓' ? i * 0.2 : (2 - i) * 0.2 }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center" style={{ minHeight: 68 }}>
        <motion.span className="font-display font-bold tabular-nums leading-none"
          style={{ fontSize: 56, color: c, textShadow: `0 0 28px ${c}70` }}
          key={formatted.value}
          initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {formatted.value}
        </motion.span>
        <span className="font-mono text-xl mt-1.5 uppercase tracking-widest" style={{ color: `${c}99` }}>
          {formatted.unit}
        </span>
      </div>
    </div>
  );
}

export function NetworkCard({ network, history }: NetworkCardProps) {
  const { theme } = useTheme();
    const tc = getThemeColors(theme);
  const dlHistory = history.map((h) => h.networkDownload);
  const ulHistory = history.map((h) => h.networkUpload);
  const lc = getLatencyColor(network.latency);

  return (
    <motion.div className="card-cyan flex"
      style={{ color: tc.primary, minHeight: 200 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>

      {/* ── Speed readouts ── */}
      <div className="flex" style={{ borderRight: `1px solid ${tc.border}`, minWidth: 380 }}>
        <SpeedBlock label="DOWNLOAD" speed={network.downloadSpeed} color={tc.primary} secondaryColor={tc.secondary} arrow="↓" borderColor={tc.borderFaint} />
        <SpeedBlock label="UPLOAD"   speed={network.uploadSpeed}   color={tc.primary} secondaryColor={tc.secondary} arrow="↑" borderColor={tc.borderFaint} />
      </div>

      {/* ── Sparklines ── */}
      <div className="flex-1 flex flex-col" style={{ borderRight: `1px solid ${tc.border}` }}>
        <div className="flex-1 px-5 py-3" style={{ borderBottom: `1px solid ${tc.borderFaint}` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="label-text">↓ DOWNLOAD</span>
            <span className="font-mono text-2xl" style={{ color: tc.primary }}>
              {formatSpeed(network.downloadSpeed).value} {formatSpeed(network.downloadSpeed).unit}
            </span>
          </div>
          <Sparkline data={dlHistory} color={tc.primary} height={86} />
        </div>
        <div className="flex-1 px-5 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="label-text">↑ UPLOAD</span>
            <span className="font-mono text-2xl" style={{ color: tc.secondary }}>
              {formatSpeed(network.uploadSpeed).value} {formatSpeed(network.uploadSpeed).unit}
            </span>
          </div>
          <Sparkline data={ulHistory} color={tc.secondary} height={86} />
        </div>
      </div>

      {/* ── Stats column ── */}
      <div className="flex flex-col" style={{ minWidth: 300, borderRight: `1px solid ${tc.border}` }}>
        <div className="px-5 py-4 flex flex-col items-center justify-center flex-1"
          style={{ borderBottom: `1px solid ${tc.borderFaint}`, background: `${lc}08` }}>
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
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${tc.borderFaint}` }}>
          <span className="label-text block mb-1">↓ SESSION</span>
          <span className="font-display text-3xl font-bold" style={{ color: tc.primary, textShadow: `0 0 12px ${tc.primary}60` }}>
            {formatBytes(network.downloadTotal)}
          </span>
        </div>
        <div className="px-5 py-3">
          <span className="label-text block mb-1">↑ SESSION</span>
          <span className="font-display text-3xl font-bold" style={{ color: tc.secondary, textShadow: `0 0 12px ${tc.secondary}60` }}>
            {formatBytes(network.uploadTotal)}
          </span>
        </div>
      </div>

      {/* ── Adapters ── */}
      <div className="flex flex-col" style={{ minWidth: 350 }}>
        <div className="px-5 py-3 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${tc.border}`, background: tc.bg }}>
          <div className="live-dot" style={{ backgroundColor: tc.primary, color: tc.primary }} />
          <span className="label-text">INTERFACES</span>
        </div>
        {network.adapters.map((adapter) => {
          const isActive = adapter.name === network.primaryAdapter;
          return (
            <div key={adapter.name}
              className="flex items-center gap-3 px-5 py-3"
              style={{
                borderBottom: `1px solid ${tc.borderFaint}`,
                background: isActive ? tc.bg : 'transparent',
              }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isActive ? tc.primary : 'rgba(128,128,128,0.3)',
                  boxShadow: isActive ? `0 0 8px ${tc.primary}` : 'none',
                }} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xl truncate"
                  style={{ color: isActive ? tc.primary : 'var(--label-text-color)' }}>
                  {adapter.name}
                </p>
                <p className="font-mono text-xl" style={{ color: 'var(--muted-text-color)' }}>
                  {adapter.ipv4 || adapter.ipv6 || 'N/A'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}