import { motion } from "framer-motion";
import type { Network } from "../../domain";
import type { MetricHistory } from "../../hooks/useMetrics";
import { Sparkline } from "./Sparkline";
import { formatSpeed, formatBytes } from "../../shared/utils/formatters";
import { getLatencyColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../../shared/utils/themeColors";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { ThemeColorPalette } from "../../shared/utils/themeColors";

interface NetworkCardProps {
  network: Network;
  history: Array<MetricHistory>;
}

function latencyLabel(ms: number) {
  if (ms === 0) return "—";
  if (ms < 20) return "EXCELLENT";
  if (ms < 60) return "GOOD";
  if (ms < 100) return "FAIR";
  return "POOR";
}

function SpeedBlock({
  label,
  speed,
  color,
  arrow,
  borderColor,
  showRightBorder,
  valueSize,
}: {
  label: string;
  speed: number;
  color: "primary" | "secondary" | "tertiary";
  arrow: "↓" | "↑";
  borderColor: string;
  showRightBorder?: boolean;
  valueSize?: number;
}) {
  const formatted = formatSpeed(speed);
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const rightBorder =
    showRightBorder ?? arrow === "↓" ? `1px solid ${borderColor}` : "none";

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-3 px-6 crt-screen"
      style={{ borderRight: rightBorder }}
    >
      <span className="label-text mb-3">{label}</span>
      <div className="flex flex-col items-center gap-1 mb-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: isPortrait ? 24 : 18,
              height: isPortrait ? 5 : 3,
              backgroundColor: `var(--color-${color})`,
              borderRadius: 2,
            }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: arrow === "↓" ? i * 0.2 : (2 - i) * 0.2,
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <motion.span
          className={`font-display font-bold tabular-nums leading-none ${
            color === "secondary" ? "glow-secondary" : "glow-tertiary"
          }`}
          style={{
            color: `var(--color-${color})`,
            fontSize: valueSize ?? (isPortrait ? 54 : 32),
          }}
          key={formatted.value}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatted.value}
        </motion.span>
        <span
          className="font-mono text-sm mt-1.5 uppercase tracking-widest"
          style={{ color: `var(--color-${color})` }}
        >
          {formatted.unit}
        </span>
      </div>
    </div>
  );
}

function LatencyReadout({
  network,
  valueSize,
}: {
  network: Network;
  valueSize: number;
}) {
  const lc = getLatencyColor(network.latency);
  return (
    <>
      <span className="label-text">LATENCY</span>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-bold tabular-nums leading-none"
          style={{
            color: lc,
            fontSize: valueSize,
            textShadow: `0 0 20px ${lc}60`,
          }}
        >
          {network.latency > 0 ? network.latency : "—"}
        </span>
        {network.latency > 0 && (
          <span className="font-mono text-md" style={{ color: lc }}>
            ms
          </span>
        )}
      </div>
      <span className="font-mono text-sm mt-0.5" style={{ color: lc }}>
        {latencyLabel(network.latency)}
      </span>
    </>
  );
}

function ChartCell({
  label,
  speed,
  color,
  data,
  height,
}: {
  label: string;
  speed: number;
  color: string;
  data: Array<number>;
  height: number;
}) {
  const formatted = formatSpeed(speed);
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <span className="label-text">{label}</span>
        <span className="font-mono text-md" style={{ color }}>
          {formatted.value} {formatted.unit}
        </span>
      </div>
      <Sparkline data={data} color={color} height={height} />
    </>
  );
}

function SessionStat({
  label,
  value,
  color,
  centered = false,
  valueSize,
}: {
  label: string;
  value: string;
  color: string;
  centered?: boolean;
  valueSize?: number;
}) {
  return (
    <div className={`flex flex-col ${centered ? "items-center text-center" : ""}`}>
      <span className="label-text block mb-1">{label}</span>
      <span
        className={`font-display font-bold ${valueSize ? "" : "text-lg"}`}
        style={{ color, fontSize: valueSize, textShadow: `0 0 12px ${color}60` }}
      >
        {value}
      </span>
    </div>
  );
}

function InterfacesList({
  network,
  tc,
}: {
  network: Network;
  tc: ThemeColorPalette;
}) {
  return (
    <>
      <div
        className="px-3 py-2 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${tc.border}`, background: tc.bg }}
      >
        <div
          className="live-dot"
          style={{ backgroundColor: tc.primary, color: tc.primary }}
        />
        <span className="label-text">INTERFACES</span>
      </div>
      {network.adapters.map((adapter) => {
        const isActive = adapter.name === network.primaryAdapter;
        return (
          <div
            key={adapter.name}
            className="flex items-center gap-3 px-4 py-2"
            style={{
              borderBottom: `1px solid ${tc.borderFaint}`,
              background: isActive ? tc.bg : "transparent",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: isActive
                  ? tc.primary
                  : "rgba(128,128,128,0.3)",
                boxShadow: isActive ? `0 0 8px ${tc.primary}` : "none",
              }}
            />
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-sm truncate"
                style={{
                  color: isActive ? tc.primary : "var(--label-text-color)",
                }}
              >
                {adapter.name}
              </p>
              <p
                className="font-mono text-sm"
                style={{ color: "var(--muted-text-color)" }}
              >
                {adapter.ipv4 || adapter.ipv6 || "N/A"}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function NetworkCard({ network, history }: NetworkCardProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const dlHistory = history.map((h) => h.networkDownload);
  const ulHistory = history.map((h) => h.networkUpload);
  const lc = getLatencyColor(network.latency);
  const isPortrait = useMediaQuery("(orientation: portrait)");

  // ─────────────────────────── Portrait layout ───────────────────────────
  // Compact stacked rows so the card doesn't run tall:
  //   Row 1 — DOWNLOAD | UPLOAD | LATENCY
  //   Row 2 — download graph | upload graph
  //   Row 3 — sessions (one line) + interfaces
  if (isPortrait) {
    return (
      <motion.div
        className="card-primary flex flex-col"
        style={{ color: tc.primary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Row 1 — big readouts */}
        <div className="flex" style={{ borderBottom: `1px solid ${tc.border}` }}>
          <SpeedBlock
            label="DOWNLOAD"
            speed={network.downloadSpeed}
            color="secondary"
            arrow="↓"
            borderColor={tc.borderFaint}
            showRightBorder
            valueSize={68}
          />
          <SpeedBlock
            label="UPLOAD"
            speed={network.uploadSpeed}
            color="tertiary"
            arrow="↑"
            borderColor={tc.borderFaint}
            showRightBorder
            valueSize={68}
          />
          <div
            className="flex-1 flex flex-col items-center justify-center py-3 px-4"
            style={{ background: `${lc}08` }}
          >
            <LatencyReadout network={network} valueSize={64} />
          </div>
        </div>

        {/* Row 2 — graphs side by side */}
        <div
          className="flex flex-1 min-h-0"
          style={{ borderBottom: `1px solid ${tc.border}` }}
        >
          <div
            className="flex-1 flex flex-col px-5 py-3 min-w-0"
            style={{ borderRight: `1px solid ${tc.border}` }}
          >
            <ChartCell
              label="↓ DOWNLOAD"
              speed={network.downloadSpeed}
              color={tc.secondary}
              data={dlHistory}
              height={90}
            />
          </div>
          <div className="flex-1 flex flex-col px-5 py-3 min-w-0">
            <ChartCell
              label="↑ UPLOAD"
              speed={network.uploadSpeed}
              color={tc.tertiary}
              data={ulHistory}
              height={90}
            />
          </div>
        </div>

        {/* Row 3 — sessions (one line) + interfaces */}
        <div className="flex">
          <div
            className="flex flex-1 min-w-0"
            style={{ borderRight: `1px solid ${tc.border}` }}
          >
            <div
              className="flex-1 px-5 py-3 flex items-center justify-center"
              style={{ borderRight: `1px solid ${tc.borderFaint}` }}
            >
              <SessionStat
                label="↓ SESSION"
                value={formatBytes(network.downloadTotal)}
                color={tc.secondary}
                centered
                valueSize={30}
              />
            </div>
            <div className="flex-1 px-5 py-3 flex items-center justify-center">
              <SessionStat
                label="↑ SESSION"
                value={formatBytes(network.uploadTotal)}
                color={tc.tertiary}
                centered
                valueSize={30}
              />
            </div>
          </div>
          <div className="flex flex-col" style={{ minWidth: 180 }}>
            <InterfacesList network={network} tc={tc} />
          </div>
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────── Landscape layout ──────────────────────────
  return (
    <motion.div
      className="card-primary flex"
      style={{ color: tc.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* ── Speed readouts ── */}
      <div
        className="flex"
        style={{ borderRight: `1px solid ${tc.border}`, minWidth: 120 }}
      >
        <SpeedBlock
          label="DOWNLOAD"
          speed={network.downloadSpeed}
          color="secondary"
          arrow="↓"
          borderColor={tc.borderFaint}
        />
        <SpeedBlock
          label="UPLOAD"
          speed={network.uploadSpeed}
          color="tertiary"
          arrow="↑"
          borderColor={tc.borderFaint}
        />
      </div>

      {/* ── Sparklines ── */}
      <div
        className="flex-1 flex flex-col"
        style={{ borderRight: `1px solid ${tc.border}` }}
      >
        <div className="flex-1 px-5 py-2">
          <ChartCell
            label="↓ DOWNLOAD"
            speed={network.downloadSpeed}
            color={tc.secondary}
            data={dlHistory}
            height={52}
          />
        </div>
        <div className="flex-1 px-5 py-2">
          <ChartCell
            label="↑ UPLOAD"
            speed={network.uploadSpeed}
            color={tc.tertiary}
            data={ulHistory}
            height={52}
          />
        </div>
      </div>

      {/* ── Stats column ── */}
      <div
        className="flex flex-col"
        style={{ minWidth: 180, borderRight: `1px solid ${tc.border}` }}
      >
        <div
          className="p-2 flex flex-col items-center justify-center flex-1"
          style={{
            borderBottom: `1px solid ${tc.borderFaint}`,
            background: `${lc}08`,
          }}
        >
          <LatencyReadout network={network} valueSize={24} />
        </div>
        <div
          className="px-5 py-1"
          style={{ borderBottom: `1px solid ${tc.borderFaint}` }}
        >
          <SessionStat
            label="↓ SESSION"
            value={formatBytes(network.downloadTotal)}
            color={tc.secondary}
          />
        </div>
        <div className="px-5 py-1">
          <SessionStat
            label="↑ SESSION"
            value={formatBytes(network.uploadTotal)}
            color={tc.tertiary}
          />
        </div>
      </div>

      {/* ── Adapters ── */}
      <div className="flex flex-col" style={{ minWidth: 180 }}>
        <InterfacesList network={network} tc={tc} />
      </div>
    </motion.div>
  );
}
