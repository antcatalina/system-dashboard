import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getFpsColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../../shared/utils/themeColors";
import { resolveGameTitle } from "../../shared/utils/gameTitles";
import { Monitor } from "../../domain/entities/Monitor";
import type { FPSMetrics } from "@system-dashboard/shared";

interface MonitorCardProps {
  monitors: Array<Monitor>;
  fps: FPSMetrics | null;
  processIcon?: string | null;
}

const SPARKLINE_WIDTH = 600;
const SPARKLINE_HEIGHT = 48;
const MAX_HISTORY = 180; // 3 minutes at 1s intervals

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
  const areaPoints = [
    `0,${SPARKLINE_HEIGHT}`,
    ...points,
    `${SPARKLINE_WIDTH},${SPARKLINE_HEIGHT}`,
  ].join(" ");
  const lastVal = history[history.length - 1];
  const color =
    lastVal >= 120
      ? "var(--color-green)"
      : lastVal >= 60
        ? "var(--color-amber)"
        : "var(--color-red)";
  return (
    <div className="monitor-card__fps-sparkline mt-1 mx-2">
      <svg
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#spark-fill)" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {(() => {
          const last = points[points.length - 1].split(",");
          return (
            <circle
              cx={last[0]}
              cy={last[1]}
              r="2"
              fill={color}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            />
          );
        })()}
      </svg>
    </div>
  );
}

function NowPlayingSection({
  fps,
  processIcon,
  fpsColor,
  tc,
  fpsHistory,
  currentFps,
}: {
  fps: FPSMetrics;
  processIcon: string | null | undefined;
  fpsColor: string;
  tc: ReturnType<typeof getThemeColors>;
  fpsHistory: number[];
  currentFps: number | null;
}) {
  const gameTitle = resolveGameTitle(fps.processName);

  return (
    <motion.div
      className="monitor-card__now-playing"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        borderTop: `1px solid ${tc.border}`,
        background: `linear-gradient(135deg, ${tc.bg} 0%, rgba(0,0,0,0.15) 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${tc.borderFaint}` }}
      >
        <div className="flex items-center gap-2">
          {/* Pulsing active dot */}
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: fpsColor,
              boxShadow: `0 0 6px ${fpsColor}`,
              animation: "livePulse 2s ease-in-out infinite",
            }}
          />
          <span
            className="label-text"
            style={{ fontSize: 11, letterSpacing: "0.2em" }}
          >
            NOW PLAYING
          </span>
        </div>
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            color: tc.secondary,
            opacity: 0.5,
            letterSpacing: "0.1em",
          }}
        >
          {fps.processName.toUpperCase()}
        </span>
      </div>

      {/* Main content: icon + title left, FPS right */}
      <div className="flex items-center gap-4 px-5 py-3">
        {/* Game icon — large */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            border: `1px solid ${tc.borderFaint}`,
            background: `rgba(0,0,0,0.25)`,
            position: "relative",
          }}
        >
          {/* Corner accents */}
          {[
            {
              top: 2,
              left: 2,
              borderTop: "1px solid",
              borderLeft: "1px solid",
            },
            {
              top: 2,
              right: 2,
              borderTop: "1px solid",
              borderRight: "1px solid",
            },
            {
              bottom: 2,
              left: 2,
              borderBottom: "1px solid",
              borderLeft: "1px solid",
            },
            {
              bottom: 2,
              right: 2,
              borderBottom: "1px solid",
              borderRight: "1px solid",
            },
          ].map((style, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderColor: fpsColor,
                opacity: 0.6,
                ...style,
              }}
            />
          ))}

          <AnimatePresence mode="wait">
            {processIcon ? (
              <motion.img
                key={fps.processName}
                src={processIcon}
                alt={gameTitle}
                width={40}
                height={40}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <motion.svg
                key="fallback"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tc.primary}
                strokeWidth="1"
                opacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M8 12h2M9 11v2M14 12h2M15 11" />
                <circle cx="15.5" cy="12" r="0.5" fill={tc.primary} />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Game title + sparkline */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 py-2">
          <motion.span
            key={gameTitle}
            className="font-mono font-bold truncate"
            style={{
              fontSize: 15,
              color: "var(--stat-value-color)",
              letterSpacing: "0.04em",
            }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {gameTitle}
          </motion.span>
          {currentFps !== null && fpsHistory.length > 1 && (
            <FpsSparkline history={fpsHistory} />
          )}
        </div>

        {/* FPS readout */}
        <div className="flex-shrink-0 flex flex-col items-end">
          <span className="label-text" style={{ fontSize: 14 }}>
            FPS
          </span>
          <motion.span
            key={Math.round(currentFps ?? 0)}
            className="font-mono font-bold leading-none"
            style={{
              fontSize: 48,
              color: fpsColor,
              textShadow: `0 0 16px ${fpsColor}50`,
              fontVariantNumeric: "tabular-nums",
            }}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {currentFps !== null ? Math.round(currentFps) : "—"}
          </motion.span>
          {fps.avg1Percent && (
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                color: "var(--muted-text-color)",
                marginTop: 1,
              }}
            >
              1% LOW {Math.round(fps.avg1Percent)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MonitorCard({ monitors, fps, processIcon }: MonitorCardProps) {
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

  const primaryFps = fps?.fps ?? null;
  const fpsColor = getFpsColor(primaryFps);

  return (
    <motion.div
      className="card-amber flex flex-col"
      style={{ color: tc.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.18 }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: `1px solid ${tc.border}`, background: tc.bg }}
      >
        <div className="flex items-center gap-3">
          <div className="live-dot" style={{ backgroundColor: tc.primary }} />
          <span className="label-text">DISPLAYS</span>
        </div>
        <span
          className="badge"
          style={{ color: tc.primary, borderColor: tc.border }}
        >
          {monitors.length} CONNECTED
        </span>
      </div>

      {/* ── Monitor rows ── */}
      {monitors.map((m, idx) => {
        const isPrimary = m.primary;
        return (
          <div
            key={m.id}
            className="flex flex-col"
            style={{
              borderBottom:
                idx < monitors.length - 1
                  ? `1px solid ${tc.borderFaint}`
                  : "none",
              background: isPrimary ? tc.bg : "transparent",
            }}
          >
            <div className="flex items-center gap-4 px-5 py-3">
              <svg
                width="36"
                height="28"
                viewBox="0 0 36 28"
                fill="none"
                className="flex-shrink-0"
              >
                <rect
                  x="1"
                  y="1"
                  width="34"
                  height="20"
                  rx="1.5"
                  stroke={isPrimary ? tc.primary : tc.svgStroke}
                  strokeWidth="1.5"
                  fill={isPrimary ? `${tc.primary}10` : tc.svgFill}
                />
                <rect
                  x="14"
                  y="21"
                  width="8"
                  height="4"
                  fill={
                    isPrimary ? `${tc.primary}66` : "rgba(128,128,128,0.15)"
                  }
                />
                <rect
                  x="9"
                  y="25"
                  width="18"
                  height="1.5"
                  rx="0.75"
                  fill={isPrimary ? `${tc.primary}4d` : "rgba(128,128,128,0.1)"}
                />
                {isPrimary && (
                  <circle
                    cx="18"
                    cy="11"
                    r="3"
                    fill={`${tc.primary}26`}
                    stroke={tc.primary}
                    strokeWidth="0.75"
                  />
                )}
              </svg>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-sans text-xl truncate"
                    style={{
                      color: isPrimary
                        ? "var(--stat-value-color)"
                        : "var(--label-text-color)",
                    }}
                  >
                    {m.name}
                  </span>
                  {isPrimary && (
                    <span
                      className="badge"
                      style={{
                        color: tc.primary,
                        borderColor: tc.border,
                        fontSize: 14,
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <span
                    className="font-mono text-xl"
                    style={{ color: "var(--label-text-color)" }}
                  >
                    {m.width}×{m.height}
                  </span>
                  <span
                    className="font-mono text-xl uppercase"
                    style={{ color: "var(--muted-text-color)" }}
                  >
                    {isPrimary ? "HDMI" : "DP"}
                  </span>
                </div>
              </div>

              {/* HZ bar — non-primary */}
              {!isPrimary && (
                <div
                  className="flex-shrink-0 flex flex-col items-end gap-1"
                  style={{ width: 48 }}
                >
                  <span className="label-text" style={{ fontSize: 12 }}>
                    HZ
                  </span>
                  <div
                    className="w-full h-1.5"
                    style={{ background: "rgba(128,128,128,0.12)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min((m.refreshRate / 60) * 100, 100)}%`,
                        backgroundColor:
                          m.refreshRate >= 30
                            ? "var(--color-green)"
                            : tc.primary,
                        boxShadow: `0 0 6px ${m.refreshRate >= 30 ? "var(--color-green)" : tc.primary}60`,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-xl"
                    style={{ color: "var(--label-text-color)" }}
                  >
                    {m.refreshRate}
                  </span>
                </div>
              )}

              {/* Primary: refresh rate only — FPS moves to Now Playing section */}
              {isPrimary && (
                <div
                  className="flex-shrink-0 flex flex-col items-end gap-1"
                  style={{ width: 48 }}
                >
                  <span className="label-text" style={{ fontSize: 12 }}>
                    HZ
                  </span>
                  <div
                    className="w-full h-1.5"
                    style={{ background: "rgba(128,128,128,0.12)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${primaryFps ? (primaryFps / 240) * 100 : 100}%`,
                        backgroundColor: getFpsColor(primaryFps ?? 240),
                        boxShadow: `0 0 6px ${getFpsColor(primaryFps ?? 240)}60`,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-xl"
                    style={{ color: "var(--label-text-color)" }}
                  >
                    {primaryFps?.toFixed(0) ?? "240"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Now Playing ── */}
      <AnimatePresence>
        {fps && (
          <NowPlayingSection
            key={fps.processName}
            fps={fps}
            processIcon={processIcon}
            fpsColor={fpsColor}
            tc={tc}
            fpsHistory={fpsHistory}
            currentFps={fps.fps}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
