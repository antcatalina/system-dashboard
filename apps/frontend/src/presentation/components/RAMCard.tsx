import { motion } from "framer-motion";
import type { RAM } from "../../domain";
import type { MetricHistory } from "../../hooks/useMetrics";
import { Sparkline } from "./Sparkline";
import { getThemeColors } from "../../shared/utils/themeColors";
import { useTheme } from "../context/ThemeContext";
import { getMemoryColor } from "../../shared/utils/colors";

interface RAMCardProps {
  ram: RAM;
  history: MetricHistory[];
}

export function RAMCard({ ram, history }: RAMCardProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const ramHistory = history.map((h) => h.ramUsed);
  const glowClass =
    ram.usedPercent > 85
      ? "glow-red"
      : ram.usedPercent > 65
        ? "glow-amber"
        : "glow-green";
  const mc = getMemoryColor(ram.usedPercent);
  const segments = 32;

  return (
    <motion.div
      className="ram-card h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.12 }}
    >
      {/* ── Header ── */}
      <div className="ram-card__header">
        <div className="flex items-center gap-3">
          <div
            className="ram-card__dot"
            style={{ backgroundColor: tc.tertiary, color: tc.tertiary }}
          />
          <span className="ram-card__label">MEMORY</span>
          <span
            className="ram-card__badge"
            style={{ color: tc.tertiary, borderColor: tc.tertiary }}
          >
            {ram.total.toFixed(0)} GB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="ram-card__label">PRESSURE</span>
          <span
            className="ram-card__pressure glow-tertiary"
            style={{ color: tc.tertiary }}
          >
            {ram.usedPercent.toFixed(1)}
            <span className={`ram-card__pressure-unit`}>%</span>
          </span>
        </div>
      </div>

      {/* ── Segmented bar ── */}
      <div className="ram-card__bar-section">
        <div className="flex gap-0.5 mb-1.5">
          {Array.from({ length: segments }).map((_, i) => {
            const threshold = ((i + 1) / segments) * 100;
            const active = threshold <= ram.usedPercent + 100 / segments;

            return (
              <motion.div
                key={i}
                className="flex-1"
                style={{
                  height: 48,
                  backgroundColor: active ? mc : "rgba(255,255,255,0.04)",
                  boxShadow: active ? `0 0 4px ${mc}50` : "none",
                }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.01 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between">
          <span className="ram-card__label">0</span>
          <span className="ram-card__label">
            {(ram.total / 2).toFixed(0)} GB
          </span>
          <span className="ram-card__label">{ram.total.toFixed(0)} GB</span>
        </div>
      </div>

      {/* ── Used / Free / Swap ── */}
      <div className="ram-card__stats">
        <div className="ram-card__stat ram-card__stat--used">
          <span className="ram-card__label">USED</span>
          <span
            className={`ram-card__stat-value ${glowClass}`}
            style={{ color: mc }}
          >
            {ram.used.toFixed(1)}
            <span className="ram-card__stat-unit">GB</span>
          </span>
        </div>
        <div className="ram-card__stat ram-card__stat--free">
          <span className="ram-card__label">FREE</span>
          <span className="ram-card__stat-value text-white/40">
            {ram.free.toFixed(1)}
            <span className="ram-card__stat-unit">GB</span>
          </span>
        </div>
      </div>

      {ram.swapTotal > 0 && (
        <div className="ram-card__swap">
          <div className="flex justify-between items-center mb-2">
            <span className="ram-card__label">PAGEFILE</span>
            <span
              className="ram-card__swap-value"
              style={{ color: tc.primary }}
            >
              {ram.swapUsed.toFixed(1)} / {ram.swapTotal.toFixed(1)} GB
            </span>
          </div>
          <div className="ram-card__swap-bar">
            <motion.div
              className="h-full"
              style={{
                backgroundColor: tc.primary,
                boxShadow: `0 0 8px ${tc.primary}50`,
              }}
              animate={{ width: `${(ram.swapUsed / ram.swapTotal) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* ── Sparkline ── */}
      <div className="ram-card__sparkline">
        <div className="flex justify-between items-center mb-3">
          <span className="ram-card__label">USAGE HISTORY</span>
          <span
            className="ram-card__sparkline-value"
            style={{ color: tc.secondary }}
          >
            {ram.usedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="ram-card__sparkline-chart">
          <Sparkline data={ramHistory} color={tc.secondary} height={164} />
        </div>
      </div>
    </motion.div>
  );
}
