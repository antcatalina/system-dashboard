import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getFpsColor } from "../../shared/utils/colors";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../../shared/utils/themeColors";
import { resolveGameTitle } from "../../shared/utils/gameTitles";
import type { FPSMetrics } from "@system-dashboard/shared";
import "../styles/components/NowPlayingCard.css";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface NowPlayingCardProps {
  fps: FPSMetrics | null;
  processIcon?: string | null;
}

const SPARKLINE_WIDTH = 200;
const SPARKLINE_HEIGHT = 24;
const MAX_HISTORY = 60;

function FpsSparkline({ history }: { history: number[] }): JSX.Element | null {
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
        <linearGradient id="spark-fill-np" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#spark-fill-np)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1"
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

function FpsDisplay({
  currentFps,
  fpsColor,
  avg1Percent,
}: {
  currentFps: number;
  fpsColor: string;
  avg1Percent?: number;
}): JSX.Element {
  return (
    <div className="now-playing-card__fps">
      <span className="now-playing-card__fps-label">FPS</span>
      <motion.span
        key={Math.round(currentFps)}
        className="now-playing-card__fps-value"
        style={{ color: fpsColor }}
        initial={{ opacity: 0.4, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {Math.round(currentFps)}
        <span className="now-playing-card__fps-scanline" />
      </motion.span>
      {avg1Percent && (
        <span className="now-playing-card__fps-low">
          1% LOW {Math.round(avg1Percent)}
        </span>
      )}
    </div>
  );
}

export function NowPlayingCard({ fps, processIcon }: NowPlayingCardProps): JSX.Element {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [displayedFps, setDisplayedFps] = useState<FPSMetrics | null>(null);
  const prevFps = useRef<number | null>(null);
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (fps && fps.fps !== prevFps.current) {
      prevFps.current = fps.fps;
      setFpsHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), fps.fps]);
    }

    if (fps) {
      setDisplayedFps(fps);
      if (staleTimer.current) clearTimeout(staleTimer.current);
      staleTimer.current = setTimeout(() => setDisplayedFps(null), 30_000);
    } else {
      if (staleTimer.current) clearTimeout(staleTimer.current);
      setDisplayedFps(null);
    }

    return () => {
      if (staleTimer.current) clearTimeout(staleTimer.current);
    };
  }, [fps]);

  const currentFps = displayedFps?.fps ?? null;
  const fpsColor = getFpsColor(currentFps ?? 0);
  const gameTitle = displayedFps
    ? resolveGameTitle(displayedFps.processName)
    : null;

  const isPortrait = useMediaQuery("(orientation: portrait)");
  const iconSize = isPortrait ? 32 : 20;
  const fallbackSize = isPortrait ? 28 : 16;

  return (
    <div className="card card-primary now-playing-card h-full flex flex-col">
      {/* Header */}
      <div className="now-playing-card__header">
        <div className="now-playing-card__header-left">
          <div
            className="now-playing-card__dot"
            style={{
              backgroundColor: displayedFps
                ? fpsColor
                : "rgba(128,128,128,0.3)",
            }}
          />
          <span className="now-playing-card__label">NOW PLAYING</span>
        </div>
        {displayedFps && (
          <span className="now-playing-card__process">
            {displayedFps.processName.toUpperCase()}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="now-playing-card__body flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {displayedFps ? (
            <motion.div
              key={displayedFps.processName}
              className="now-playing-card__content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Game icon */}
              <div className="now-playing-card__icon">
                <AnimatePresence mode="wait">
                  {processIcon ? (
                    <motion.img
                      key="icon"
                      src={processIcon}
                      alt={gameTitle ?? ""}
                      width={iconSize}
                      height={iconSize}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <motion.svg
                      key="fallback"
                      width={fallbackSize}
                      height={fallbackSize}
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

              <div className="now-playing-card__info">
                <motion.span
                  key={gameTitle}
                  className="now-playing-card__title"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {gameTitle}
                </motion.span>

                {isPortrait && currentFps !== null && (
                  <FpsDisplay
                    currentFps={currentFps}
                    fpsColor={fpsColor}
                    avg1Percent={displayedFps.avg1Percent}
                  />
                )}

                {currentFps !== null && fpsHistory.length > 1 && (
                  <div className="now-playing-card__sparkline crt-screen">
                    <FpsSparkline history={fpsHistory} />
                  </div>
                )}
              </div>

              {!isPortrait && currentFps !== null && (
                <FpsDisplay
                  currentFps={currentFps}
                  fpsColor={fpsColor}
                  avg1Percent={displayedFps.avg1Percent}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="now-playing-card__idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tc.primary}
                strokeWidth="1"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M8 12h2M9 11v2M14 12h2" />
                <circle cx="15.5" cy="12" r="0.5" fill={tc.primary} />
              </svg>
              <span>NO ACTIVE GAME</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
