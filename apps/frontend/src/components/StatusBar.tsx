import { motion, AnimatePresence } from 'framer-motion';

interface StatusBarProps {
  connected: boolean;
  timestamp?: number;
}

export function StatusBar({ connected, timestamp }: StatusBarProps) {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : '--:--:--';

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-accent-cyan" />
          <AnimatePresence>
            {connected && (
              <motion.div
                className="absolute inset-0 rounded-full bg-accent-cyan"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </div>
        <span className="font-display text-sm font-bold tracking-widest text-white/90">
          SYS<span className="text-accent-cyan">PULSE</span>
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green' : 'bg-accent-red'}`} />
          <span className="font-mono text-xs text-white/40">
            {connected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
        <span className="font-mono text-xs text-white/20">{time}</span>
      </div>
    </div>
  );
}
