import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import type { Monitor, FPS } from "../../domain";
import { getFpsColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../../shared/utils/themeColors";

interface MonitorCardProps {
  monitors: Monitor[];
  fps: FPS | null;
}

const SPARKLINE_WIDTH = 300;
const SPARKLINE_HEIGHT = 48;
const MAX_HISTORY = 60;

function FpsSparkline({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history, min + 1);
  const range = max - min || 1;
  const points = history.map((v, i) => {
    const x = (i / (MAX_HISTORY - 1)) * SPARKLINE_WIDTH;
    const y = SPARKLINE_HEIGHT - ((v - min) / range) * SPARKLINE_HEIGHT;
    return `${x},${y}`;
  });
  const areaPoints = [`0,${SPARKLINE_HEIGHT}`, ...points, `${SPARKLINE_WIDTH},${SPARKLINE_HEIGHT}`].join(" ");
  const lastVal = history[history.length - 1];
  const color = lastVal >= 120 ? "var(--color-green)" : lastVal >= 60 ? "var(--color-amber)" : "var(--color-red)";
  return (
    <svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT}
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`} className="flex-shrink-0">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#spark-fill)" />
      <polyline points={points.join(" ")} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {(() => {
        const last = points[points.length - 1].split(",");
        return <circle cx={last[0]} cy={last[1]} r="2" fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }} />;
      })()}
    </svg>
  );
}

export function MonitorCard({ monitors, fps }: MonitorCardProps) {
  const { theme } = useTheme();
    const tc = getThemeColors(theme);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const prevFps = useRef<number | null>(null);

  useEffect(() => {
    if (fps && fps.fps !== prevFps.current) {
      prevFps.current = fps.fps;
      setFpsHistory((h) => {
        const next = [...h, fps.fps];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    }
  }, [fps]);

  const currentFps = fps?.fps ?? null;
  const fpsColor = getFpsColor(currentFps);

  return (
    <motion.div className="card-amber flex flex-col"
      style={{ color: tc.primary }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.18 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: `1px solid ${tc.border}`, background: tc.bg }}>
        <div className="flex items-center gap-3">
          <div className="live-dot" style={{ backgroundColor: tc.primary }} />
          <span className="label-text">DISPLAYS</span>
        </div>
        <span className="badge" style={{ color: tc.primary, borderColor: tc.border }}>
          {monitors.length} CONNECTED
        </span>
      </div>

      {/* ── Monitor rows ── */}
      {monitors.map((m, idx) => {
        const isPrimary = m.primary;
        return (
          <div key={m.id} className="flex flex-col"
            style={{
              borderBottom: idx < monitors.length - 1 ? `1px solid ${tc.borderFaint}` : 'none',
              background: isPrimary ? tc.bg : 'transparent',
            }}>

            <div className="flex items-center gap-4 px-5 py-3">
              {/* Mini monitor SVG — uses theme colors */}
              <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="flex-shrink-0">
                <rect x="1" y="1" width="34" height="20" rx="1.5"
                  stroke={isPrimary ? tc.primary : tc.svgStroke}
                  strokeWidth="1.5"
                  fill={isPrimary ? `${tc.primary}10` : tc.svgFill} />
                <rect x="14" y="21" width="8" height="4"
                  fill={isPrimary ? `${tc.primary}66` : 'rgba(128,128,128,0.15)'} />
                <rect x="9" y="25" width="18" height="1.5" rx="0.75"
                  fill={isPrimary ? `${tc.primary}4d` : 'rgba(128,128,128,0.1)'} />
                {isPrimary && (
                  <circle cx="18" cy="11" r="3"
                    fill={`${tc.primary}26`} stroke={tc.primary} strokeWidth="0.75" />
                )}
              </svg>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans text-xl truncate"
                    style={{ color: isPrimary ? 'var(--stat-value-color)' : 'var(--label-text-color)' }}>
                    {m.name}
                  </span>
                  {isPrimary && (
                    <span className="badge" style={{ color: tc.primary, borderColor: tc.border, fontSize: 14 }}>
                      PRIMARY
                    </span>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-xl" style={{ color: 'var(--label-text-color)' }}>
                    {m.width}×{m.height}
                  </span>
                  <span className="font-mono text-xl uppercase" style={{ color: 'var(--muted-text-color)' }}>
                    {isPrimary ? "HDMI" : "DP"}
                  </span>
                </div>
              </div>

              {/* HZ bar — non-primary */}
              {!isPrimary && (
                <div className="flex-shrink-0 flex flex-col items-end gap-1" style={{ width: 48 }}>
                  <span className="label-text" style={{ fontSize: 12 }}>HZ</span>
                  <div className="w-full h-1.5" style={{ background: 'rgba(128,128,128,0.12)' }}>
                    <div className="h-full" style={{
                      width: `${Math.min((m.refreshRate / 60) * 100, 100)}%`,
                      backgroundColor: m.refreshRate >= 30 ? "var(--color-green)" : tc.primary,
                      boxShadow: `0 0 6px ${m.refreshRate >= 30 ? "var(--color-green)" : tc.primary}60`,
                    }} />
                  </div>
                  <span className="font-mono text-xl" style={{ color: 'var(--label-text-color)' }}>
                    {m.refreshRate}
                  </span>
                </div>
              )}

              {/* Primary: FPS + sparkline */}
              {isPrimary && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="mt-5">
                    {currentFps !== null && <FpsSparkline history={fpsHistory} />}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="label-text" style={{ fontSize: 16 }}>FPS</span>
                    <motion.span
                      key={Math.round(currentFps ?? 0)}
                      className="font-mono font-bold leading-none"
                      style={{ fontSize: 56, color: fpsColor, textShadow: `0 0 12px ${fpsColor}60` }}
                      initial={{ opacity: 0.4, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}>
                      {currentFps !== null ? Math.round(currentFps) : 240}
                    </motion.span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary strip */}
            {isPrimary && fps && (
              <div className="flex items-center gap-4 px-5 pb-2">
                <div style={{ width: 36 }} />
                <span className="font-mono" style={{ fontSize: 16, marginTop: '-12px', color: 'var(--muted-text-color)' }}>
                  <span style={{ color: 'var(--label-text-color)' }}>{fps.fps} FPS REALTIME</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}