import { motion } from 'framer-motion';
import type { MonitorInfo } from '@system-dashboard/shared';

interface MonitorCardProps {
  monitors: MonitorInfo[];
}

export function MonitorCard({ monitors }: MonitorCardProps) {
  return (
    <motion.div
      className="card p-5 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <span className="label-text">Displays</span>
      <div className="grid grid-cols-1 gap-3">
        {monitors.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-surface-border">
            {/* Monitor icon */}
            <div className="flex-shrink-0">
              <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
                <rect x="1" y="1" width="34" height="22" rx="2" stroke={m.primary ? '#00e5ff' : '#1a2030'} strokeWidth="1.5" fill="rgba(255,255,255,0.03)" />
                <rect x="14" y="23" width="8" height="3" fill={m.primary ? '#00e5ff' : '#1a2030'} opacity="0.5" />
                <rect x="10" y="26" width="16" height="1.5" rx="0.75" fill={m.primary ? '#00e5ff' : '#1a2030'} opacity="0.4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm text-white/80 truncate">{m.name}</span>
                {m.primary && (
                  <span className="text-[10px] font-mono text-accent-cyan border border-accent-cyan/30 px-1.5 py-0.5 rounded">PRIMARY</span>
                )}
              </div>
              <div className="flex gap-3 mt-1">
                <span className="stat-value">{m.width}×{m.height}</span>
                <span className="stat-value text-white/40">@{m.refreshRate}Hz</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
