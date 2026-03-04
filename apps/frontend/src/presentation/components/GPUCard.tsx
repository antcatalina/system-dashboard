import { motion } from "framer-motion";
import type { GPU } from "../../domain";
import type { MetricHistory } from "../hooks/useMetrics";
import { RadialGauge } from "./RadialGauge";
import { Sparkline } from "./Sparkline";
import { getTemperatureColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import "../styles/components/GPUCard.css";

interface GPUCardProps {
  gpu: GPU;
  history: MetricHistory[];
}

const THEME_COLORS = {
  default: { primary: '#00e5ff', secondary: '#b388ff', power: '#ffb300', powerHot: '#ff3d57' },
  light:   { primary: '#5b21b6', secondary: '#a21caf', power: '#b45309', powerHot: '#b91c1c' },
  neon:    { primary: '#ff006e', secondary: '#ffc0ff', power: '#ff006e', powerHot: '#ff006e' },
};

export function GPUCard({ gpu, history }: GPUCardProps) {
  const { theme } = useTheme();
  const tc = THEME_COLORS[theme];
  const vramPct = gpu.getMemoryUsagePercent();
  const powerPct = gpu.getPowerDrawPercent();
  const tempColor = getTemperatureColor(gpu.temperature);
  const gpuHistory = history.map((h) => h.gpuUtil);

  return (
    <motion.div
      className="gpu-card h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Header ── */}
      <div className="gpu-card__header">
        <div className="gpu-card__header-left">
          <div className="gpu-card__dot" />
          <span className="gpu-card__label">GPU</span>
          <span className="gpu-card__badge">NVIDIA</span>
          <span className="gpu-card__model">{gpu.model}</span>
        </div>
        <div className="gpu-card__header-right">
          <span className="gpu-card__label">DRV</span>
          <span className="gpu-card__value">{gpu.driverVersion}</span>
        </div>
      </div>

      {/* ── Gauges ── */}
      <div className="gpu-card__gauges">
        <RadialGauge value={gpu.utilization} color={tc.primary}    label="UTILIZATION" size={250} />
        <RadialGauge value={gpu.temperature} color={tempColor}     label="TEMP" unit="°C" max={110} size={250} />
        <RadialGauge value={gpu.fanSpeed}    color={tc.secondary}  label="FAN SPEED" size={250} />
      </div>

      {/* ── VRAM + Power bars ── */}
      <div className="gpu-card__stats">
        {[
          {
            label: "VRAM",
            value: `${gpu.memoryUsed.toFixed(0)} / ${gpu.memoryTotal.toFixed(0)} MB`,
            pct: vramPct,
            color: tc.primary,
          },
          {
            label: "POWER",
            value: `${gpu.powerDraw.toFixed(0)}W / ${gpu.powerLimit.toFixed(0)}W`,
            pct: powerPct,
            color: powerPct > 90 ? tc.powerHot : tc.power,
          },
        ].map(({ label, value, pct, color }) => (
          <div key={label} className="gpu-card__stat-row">
            <div className="gpu-card__stat-label">
              <span className="gpu-card__label">{label}</span>
              <span className="gpu-card__stat-value" style={{ color }}>{value}</span>
            </div>
            <div className="gpu-card__bar">
              <motion.div
                style={{ height: "100%", backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Clock tiles ── */}
      <div className="gpu-card__clocks">
        <div className="gpu-card__clock gpu-card__clock--left">
          <span className="gpu-card__label">CORE CLOCK</span>
          <span className="gpu-card__clock-value glow-cyan" style={{ color: tc.primary }}>
            {gpu.coreClock}<span className="gpu-card__clock-unit">MHz</span>
          </span>
        </div>
        <div className="gpu-card__clock gpu-card__clock--right">
          <span className="gpu-card__label">MEM CLOCK</span>
          <span className="gpu-card__clock-value glow-purple" style={{ color: tc.secondary }}>
            {gpu.memoryClock}<span className="gpu-card__clock-unit">MHz</span>
          </span>
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="gpu-card__sparkline">
        <div className="gpu-card__sparkline-header">
          <span className="gpu-card__label">UTILIZATION HISTORY</span>
          <span className="gpu-card__sparkline-value" style={{ color: tc.primary }}>
            {gpu.utilization.toFixed(0)}%
          </span>
        </div>
        <div className="gpu-card__sparkline-chart">
          <Sparkline data={gpuHistory} color={tc.primary} height={84} />
        </div>
      </div>
    </motion.div>
  );
}