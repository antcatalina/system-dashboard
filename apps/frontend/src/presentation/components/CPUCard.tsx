import { motion } from "framer-motion";
import type { CPU } from "../../domain";
import type { MetricHistory } from "../hooks/useMetrics";
import { RadialGauge } from "./RadialGauge";
import { Sparkline } from "./Sparkline";
import { getLoadColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import "../styles/components/CPUCard.css";
import { getThemeColors } from "../../shared/utils/themeColors";

interface CPUCardProps {
  cpu: CPU;
  history: MetricHistory[];
}

export function CPUCard({ cpu, history }: CPUCardProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const lc = getLoadColor(cpu.load);
  const cpuHistory = history.map((h) => h.cpuLoad);
  const freqPct =
    cpu.maxFrequency > 0 ? (cpu.frequency / cpu.maxFrequency) * 100 : 0;
  const ghz = cpu.getFrequencyGHz().toFixed(2);

  return (
    <motion.div
      className="cpu-card h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.06 }}
    >
      {/* ── Header ── */}
      <div className="cpu-card__header">
        <div className="cpu-card__header-left">
          <div className="cpu-card__dot" />
          <span className="cpu-card__label">CPU</span>
          <span className="cpu-card__badge">
            {cpu.cores}C / {cpu.threads}T
          </span>
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
        <RadialGauge value={cpu.load} color={lc} label="LOAD" size={250} />
        <RadialGauge
          value={freqPct}
          color={tc.secondary}
          label="BOOST"
          unit={`${ghz}G`}
          decimals={0}
          size={250}
        />
      </div>

      {/* ── Core bars ── */}
      <div className="cpu-card__activity">
        <div className="cpu-card__activity-label">
          <span className="cpu-card__label">CORE ACTIVITY</span>
          <span className="cpu-card__activity-value" style={{ color: lc }}>
            {cpu.load.toFixed(1)}% AVG
          </span>
        </div>
        <div
          className="cpu-card__cores"
          style={{
            gridTemplateColumns: `repeat(${Math.min(cpu.perCore.length || 8, 16)}, 1fr)`,
          }}
        >
          {(cpu.perCore.length > 0
            ? cpu.perCore
            : Array.from({ length: 16 }, (_, i) => ({
                core: i,
                load: 0,
                frequency: 0,
              }))
          ).map((core) => {
            const cc = getLoadColor(core.load);
            return (
              <div key={core.core} className="cpu-card__core">
                <div className="cpu-card__core-bar">
                  <motion.div
                    className="cpu-card__core-fill"
                    style={{
                      backgroundColor: cc,
                      boxShadow: `0 0 6px ${cc}70`,
                    }}
                    animate={{ height: `${core.load}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="cpu-card__core-label">{core.core + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Frequency bar ── */}
      <div className="cpu-card__frequency">
        <div className="cpu-card__frequency-label">
          <span className="cpu-card__label">FREQUENCY</span>
          <span className="cpu-card__frequency-value" style={{ color: tc.primary }}>
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
            style={{ color: tc.tertiary, marginLeft: "auto" }}
          >
            {cpu.load.toFixed(1)}%
          </span>
        </div>
        <div className="cpu-card__sparkline-chart">
          <Sparkline data={cpuHistory} color={tc.tertiary} height={164} />
        </div>
      </div>
    </motion.div>
  );
}
