import { motion } from "framer-motion";
import type { MetricHistory } from "../../hooks/useMetrics";
import { RadialGauge } from "./RadialGauge";
import { Sparkline } from "./Sparkline";
import { getLoadColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import "../styles/components/CPUCard.css";
import { getThemeColors } from "../../shared/utils/themeColors";
import { CPUMetrics } from "@system-dashboard/shared";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface CPUCardProps {
  cpu: CPUMetrics;
  history: Array<MetricHistory>;
}

/** Compact heatmap — each core is a small square, colour-coded by load */
function CoreHeatmap({
  cores,
}: {
  cores: CPUMetrics["perCore"];
  color: string;
}) {
  const items =
    cores.length > 0
      ? cores
      : Array.from({ length: 16 }, (_, i) => ({
          core: i,
          load: 0,
          frequency: 0,
        }));

  // Pick grid columns: ≤8 cores → 8 cols, else 16 cols (two rows of 8)
  const cols = items.length <= 8 ? items.length : Math.ceil(items.length / 2);

  return (
    <div
      className="cpu-card__heatmap"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {items.map((core) => {
        const cc = getLoadColor(core.load);
        const pct = core.load;
        return (
          <motion.div
            key={core.core}
            className="cpu-card__heatmap-cell"
            title={`Core ${core.core + 1}: ${core.load.toFixed(1)}%`}
            animate={{ backgroundColor: `${cc}` }}
            transition={{ duration: 0.4 }}
            style={{
              // base tint + glow scales with load
              opacity: 0.25 + (pct / 100) * 0.75,
              boxShadow: pct > 60 ? `inset 0 0 6px ${cc}80` : "none",
            }}
          >
            <span className="cpu-card__heatmap-label">{core.core + 1}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CPUCard({ cpu, history }: CPUCardProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const lc = getLoadColor(cpu.load);
  const cpuHistory = history.map((h) => h.cpuLoad);
  const freqPct =
    cpu.maxFrequency > 0 ? (cpu.frequency / cpu.maxFrequency) * 100 : 0;
  const ghz = (cpu.frequency / 1000).toFixed(2);

  const isPortrait = useMediaQuery("(orientation: portrait)");
  const gaugeSize = isPortrait ? 162 : 128;

  return (
    <motion.div
      className="cpu-card h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.06 }}
    >
      {/* ── Header ── */}
      <div className="cpu-card__header">
        <div className="cpu-card__header-left">
          <div className="cpu-card__dot" />
          <span className="cpu-card__label">CPU</span>
          <span className="cpu-card__badge">{cpu.model.split(" ")[0]}</span>
          <span className="cpu-card__model">{cpu.model}</span>
        </div>
        <div className="cpu-card__header-right">
          <span className="cpu-card__label">FREQ</span>
          <span className="cpu-card__value">
            {ghz}
            <span className="cpu-card__value-unit">GHz</span>
          </span>
        </div>
      </div>

      {/* ── Gauges ── */}
      <div className="cpu-card__gauges">
        <RadialGauge
          value={cpu.load}
          color={lc}
          label="LOAD"
          size={gaugeSize}
        />
        <RadialGauge
          value={freqPct}
          color={tc.secondary}
          label="BOOST"
          unit={`${ghz}G`}
          decimals={0}
          size={gaugeSize}
        />
      </div>

      {/* ── Core heatmap ── */}
      <div className="cpu-card__activity">
        <div className="cpu-card__activity-label">
          <span className="cpu-card__label">CORE MAP</span>
          <span className="cpu-card__activity-value" style={{ color: lc }}>
            {cpu.load.toFixed(1)}% AVG
          </span>
        </div>
        <CoreHeatmap cores={cpu.perCore} color={lc} />
      </div>

      {/* ── Frequency bar ── */}
      <div className="cpu-card__frequency">
        <div className="cpu-card__frequency-label">
          <span className="cpu-card__label">FREQUENCY</span>
          <span
            className="cpu-card__frequency-value"
            style={{ color: tc.primary }}
          >
            {ghz} / {(cpu.maxFrequency / 1000).toFixed(1)} GHz
          </span>
        </div>
        <div className="cpu-card__bar">
          <motion.div
            className="cpu-card__bar-fill"
            style={{
              backgroundColor: tc.primary,
              boxShadow: `0 0 8px ${tc.primary}60`,
            }}
            animate={{ width: `${freqPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="cpu-card__sparkline">
        <div className="cpu-card__sparkline-header">
          <span className="cpu-card__label">LOAD HISTORY</span>
          <span
            className="cpu-card__sparkline-value"
            style={{ color: tc.secondary, marginLeft: "auto" }}
          >
            {cpu.load.toFixed(1)}%
          </span>
        </div>
        <div className="cpu-card__sparkline-chart">
          <Sparkline data={cpuHistory} color={tc.secondary} height={46} />
        </div>
      </div>
    </motion.div>
  );
}
