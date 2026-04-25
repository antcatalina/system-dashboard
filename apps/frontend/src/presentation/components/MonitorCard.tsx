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

const PRIMARY_HZ_OVERRIDE = 240;
const SPARKLINE_WIDTH = 300;
const SPARKLINE_HEIGHT = 36;
const MAX_HISTORY = 60;
const STALE_TIMEOUT_MS = 30_000;

// ─── FPS sparkline ────────────────────────────────────────────────────────────

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
  const last = points[points.length - 1].split(",");

  return (
    <svg
      width="100%"
      height={SPARKLINE_HEIGHT}
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="spark-fill-mc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#spark-fill-mc)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="2"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

// ─── Monitor icon SVG ─────────────────────────────────────────────────────────

function MonitorIcon({
  isPrimary,
  tc,
}: {
  isPrimary: boolean;
  tc: ReturnType<typeof getThemeColors>;
}) {
  return (
    <svg
      width="28"
      height="22"
      viewBox="0 0 36 28"
      fill="none"
      style={{ flexShrink: 0 }}
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
        fill={isPrimary ? `${tc.primary}66` : "rgba(128,128,128,0.15)"}
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
  );
}

// ─── LEFT HALF: Displays ──────────────────────────────────────────────────────

function DisplaysSection({
  monitors,
  tc,
  primaryFps,
}: {
  monitors: Monitor[];
  tc: ReturnType<typeof getThemeColors>;
  primaryFps: number | null;
}) {
  return (
    <div
      className="flex flex-row flex-1 min-w-0"
      style={{ overflow: "hidden" }}
    >
      {/* Anchor label column */}
      <div
        className="flex flex-col justify-center px-4 py-2"
        style={{
          borderRight: `1px solid ${tc.border}`,
          background: tc.bg,
          minWidth: 100,
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="live-dot" style={{ backgroundColor: tc.primary }} />
          <span
            className="label-text"
            style={{ color: tc.primary, fontSize: 9 }}
          >
            DISPLAYS
          </span>
        </div>
        <span
          className="font-display font-bold"
          style={{
            fontSize: 32,
            color: tc.primary,
            textShadow: `0 0 16px ${tc.primary}60`,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {monitors.length}
        </span>
        <span className="label-text" style={{ fontSize: 8, marginTop: 4 }}>
          CONNECTED
        </span>
      </div>

      {/* One column per monitor */}
      {monitors.map((m, idx) => {
        const isPrimary = m.primary;
        const hz =
          isPrimary && primaryFps
            ? primaryFps
            : isPrimary
              ? PRIMARY_HZ_OVERRIDE
              : 60;
        const hzColor = isPrimary ? getFpsColor(hz) : "var(--color-green)";
        const isLast = idx === monitors.length - 1;
        return (
          <div
            key={m.id}
            className="flex flex-col justify-between px-4 py-3"
            style={{
              flex: 1,
              minWidth: 0,
              borderRight: `1px solid ${isLast ? tc.border : tc.borderFaint}`,
              background: isPrimary ? `${tc.primary}07` : "transparent",
            }}
          >
            {/* Top: icon + name + res */}
            <div className="flex items-center gap-2 mb-1">
              <MonitorIcon isPrimary={isPrimary} tc={tc} />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-mono truncate"
                    style={{
                      fontSize: 10,
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
                        borderColor: `${tc.primary}50`,
                        fontSize: 9,
                        padding: "1px 4px",
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                </div>
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: "var(--muted-text-color)" }}
                >
                  {m.width}×{m.height}
                </span>
              </div>
            </div>

            {/* Bottom: refresh rate bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="label-text" style={{ fontSize: 8 }}>
                  REFRESH
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: hzColor,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {typeof hz === "number" ? hz.toFixed(0) : hz}
                  <span style={{ fontSize: 8, opacity: 0.5, marginLeft: 2 }}>
                    Hz
                  </span>
                </span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  style={{
                    height: "100%",
                    backgroundColor: hzColor,
                    boxShadow: `0 0 6px ${hzColor}60`,
                  }}
                  animate={{
                    width: `${Math.min((hz / hz) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span
                  style={{
                    fontSize: 8,
                    color: "var(--muted-text-color)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {isPrimary ? "HDMI" : "DP"}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    color: "var(--muted-text-color)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {hz}Hz MAX
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RIGHT HALF: Now Playing ──────────────────────────────────────────────────

function NowPlayingSection({
  fps,
  processIcon,
  fpsColor,
  tc,
  fpsHistory,
  currentFps,
}: {
  fps: FPSMetrics | null;
  processIcon: string | null | undefined;
  fpsColor: string;
  tc: ReturnType<typeof getThemeColors>;
  fpsHistory: number[];
  currentFps: number | null;
}) {
  const gameTitle = fps ? resolveGameTitle(fps.processName) : null;

  return (
    <div
      className="monitor-card__now-playing flex flex-col"
      style={{
        width: 500,
        flexShrink: 0,
        borderLeft: `1px solid ${tc.border}`,
      }}
    >
      {/* Sub-header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: `1px solid ${tc.borderFaint}`,
          background: tc.bg,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: fps ? fpsColor : "rgba(128,128,128,0.3)",
              boxShadow: fps ? `0 0 6px ${fpsColor}` : "none",
              animation: fps ? "livePulse 2s ease-in-out infinite" : "none",
            }}
          />
          <span
            className="label-text"
            style={{
              fontSize: 9,
              color: fps ? fpsColor : "var(--label-text-color)",
            }}
          >
            NOW PLAYING
          </span>
        </div>
        {fps && (
          <span
            className="font-mono"
            style={{
              fontSize: 8,
              color: tc.primary,
              opacity: 0.4,
              letterSpacing: "0.1em",
            }}
          >
            {fps.processName.toUpperCase()}
          </span>
        )}
      </div>

      {/* Body — active game or idle state */}
      <AnimatePresence mode="wait">
        {fps ? (
          <motion.div
            key={fps.processName}
            className="flex items-center gap-3 px-4 py-2 flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Game icon with corner brackets */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                border: `1px solid ${tc.borderFaint}`,
                background: "rgba(0,0,0,0.25)",
                position: "relative",
              }}
            >
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
              ].map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    width: 6,
                    height: 6,
                    borderColor: fpsColor,
                    opacity: 0.6,
                    ...s,
                  }}
                />
              ))}
              <AnimatePresence mode="wait">
                {processIcon ? (
                  <motion.img
                    key="icon"
                    src={processIcon}
                    alt={gameTitle ?? ""}
                    width={28}
                    height={28}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <motion.svg
                    key="fallback"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tc.primary}
                    strokeWidth="1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M8 12h2M9 11v2M14 12h2" />
                    <circle cx="15.5" cy="12" r="0.5" fill={tc.primary} />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            {/* Title + sparkline */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <motion.span
                key={gameTitle}
                className="font-mono font-bold truncate"
                style={{
                  fontSize: 11,
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

            {/* FPS number */}
            <div className="flex-shrink-0 flex flex-col items-end ml-1">
              <span className="label-text" style={{ fontSize: 8 }}>
                FPS
              </span>
              <motion.span
                key={Math.round(currentFps ?? 0)}
                className="font-mono font-bold leading-none"
                style={{
                  fontSize: 36,
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
                    fontSize: 8,
                    color: "var(--muted-text-color)",
                    marginTop: 2,
                  }}
                >
                  1% LOW {Math.round(fps.avg1Percent)}
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            className="flex flex-col items-center justify-center flex-1 gap-2"
            style={{ opacity: 0.2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tc.primary}
              strokeWidth="1"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M8 12h2M9 11v2M14 12h2" />
              <circle cx="15.5" cy="12" r="0.5" fill={tc.primary} />
            </svg>
            <span
              className="font-mono"
              style={{ fontSize: 9, letterSpacing: "0.12em" }}
            >
              NO ACTIVE GAME
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function MonitorCard({ monitors, fps, processIcon }: MonitorCardProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [displayedFps, setDisplayedFps] = useState<FPSMetrics | null>(null);
  const prevFps = useRef<number | null>(null);
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (fps && fps.fps !== prevFps.current) {
      prevFps.current = fps.fps;

      // New reading arrived — show it and reset the stale timer
      setDisplayedFps(fps);
      setFpsHistory((h) => {
        const next = [...h, fps.fps];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });

      if (staleTimer.current) clearTimeout(staleTimer.current);
      staleTimer.current = setTimeout(() => {
        setDisplayedFps(null);
        setFpsHistory([]);
      }, STALE_TIMEOUT_MS);
    }
  }, [fps]);

  // Clean up on unmount
  useEffect(
    () => () => {
      if (staleTimer.current) clearTimeout(staleTimer.current);
    },
    [],
  );

  const primaryFps = displayedFps?.fps ?? null;
  const fpsColor = getFpsColor(primaryFps);

  return (
    <motion.div
      className="card-amber flex flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.18 }}
    >
      <DisplaysSection monitors={monitors} tc={tc} primaryFps={primaryFps} />
      <NowPlayingSection
        fps={displayedFps}
        processIcon={processIcon}
        fpsColor={fpsColor}
        tc={tc}
        fpsHistory={fpsHistory}
        currentFps={primaryFps}
      />
    </motion.div>
  );
}
