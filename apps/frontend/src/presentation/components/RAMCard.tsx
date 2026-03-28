import { motion } from "framer-motion";
import type { RAM } from "../../domain";
import type { MetricHistory } from "../../hooks/useMetrics";
import { Sparkline } from "./Sparkline";
import { getThemeColors } from "../../shared/utils/themeColors";
import { useTheme } from "../context/ThemeContext";
import { getMemoryColor } from "../../shared/utils/colors";
import { useRef, useEffect } from "react";

interface RAMCardProps {
  ram: RAM;
  history: Array<MetricHistory>;
}

interface WaveformProps {
  usedPercent: number;
  color: string;
}

function Waveform({ usedPercent, color }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Shared mutable state for the animation loop — no re-renders needed
  const stateRef = useRef({
    phase: 0,
    targetPercent: usedPercent,
    currentPercent: usedPercent,
  });

  // Keep target in sync with props without restarting the loop
  useEffect(() => {
    stateRef.current.targetPercent = usedPercent;
  }, [usedPercent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf: number;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const state = stateRef.current;

      // Lerp currentPercent toward target for smooth transitions
      state.currentPercent +=
        (state.targetPercent - state.currentPercent) * 0.04;
      const pct = state.currentPercent / 100; // 0–1

      // Advance phase — faster & more chaotic at high pressure
      state.phase += 0.018 + pct * 0.028;

      ctx.clearRect(0, 0, W, H);

      // ── Grid lines ──
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      // horizontal centre line
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      // vertical divisions
      for (let x = 0; x <= W; x += W / 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // ── Amplitude envelope: low pct → gentle ripple, high pct → violent thrash ──
      const maxAmp = (H / 2) * 0.9;
      const amp = maxAmp * (0.08 + pct * 0.92);

      // Resolve the color — handles both hex (#00e5ff) and CSS vars (var(--color-green))
      // by reading the computed value directly from the DOM at draw time.
      let resolvedColor = color;
      if (color.startsWith("var(")) {
        const varName = color.slice(4, -1).trim(); // strip "var(" and ")"
        resolvedColor =
          getComputedStyle(canvas).getPropertyValue(varName).trim() ||
          "#00ff9d";
      }

      const hexToRgb = (hex: string) => {
        const clean = hex.replace("#", "");
        const full =
          clean.length === 3
            ? clean
                .split("")
                .map((c) => c + c)
                .join("")
            : clean;
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        return `${r},${g},${b}`;
      };
      const rgb = resolvedColor.startsWith("#")
        ? hexToRgb(resolvedColor)
        : "0,229,255";

      // ── Three harmonics composited together ──
      // h1: fundamental — slow, smooth
      // h2: 2nd harmonic — medium, adds body
      // h3: 3rd harmonic — fast, adds chaos at high pressure
      const h1Amp = amp * 0.55;
      const h2Amp = amp * 0.3;
      const h3Amp = amp * 0.15 * pct; // 3rd harmonic only emerges under pressure

      const buildPoints = (): [number, number][] => {
        const pts: [number, number][] = [];
        for (let x = 0; x <= W; x += 2) {
          const t = (x / W) * Math.PI * 2;
          const y =
            H / 2 -
            (h1Amp * Math.sin(t * 1.5 + state.phase) +
              h2Amp * Math.sin(t * 3.1 + state.phase * 1.7 + 0.8) +
              h3Amp * Math.sin(t * 5.3 + state.phase * 2.3 + 1.6));
          pts.push([x, y]);
        }
        return pts;
      };

      const pts = buildPoints();

      // ── Filled area gradient under the wave ──
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, `rgba(${rgb}, ${0.18 + pct * 0.22})`);
      gradient.addColorStop(0.5, `rgba(${rgb}, ${0.06 + pct * 0.08})`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.beginPath();
      ctx.moveTo(0, H);
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // ── Main wave line ──
      ctx.beginPath();
      pts.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
      );
      ctx.strokeStyle = resolvedColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = resolvedColor;
      ctx.shadowBlur = 6 + pct * 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Ghost wave — slightly offset phase, lower opacity ──
      // Gives depth, like a CRT afterimage
      const ghostPhase = state.phase - 0.35;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const t = (x / W) * Math.PI * 2;
        const y =
          H / 2 -
          (h1Amp * 0.7 * Math.sin(t * 1.5 + ghostPhase) +
            h2Amp * 0.7 * Math.sin(t * 3.1 + ghostPhase * 1.7 + 0.8) +
            h3Amp * 0.7 * Math.sin(t * 5.3 + ghostPhase * 2.3 + 1.6));
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${rgb}, ${0.15 + pct * 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Scan dot — bright dot riding the wave at the rightmost point ──
      const lastPt = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(lastPt[0], lastPt[1], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = resolvedColor;
      ctx.shadowColor = resolvedColor;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    // Size canvas to its CSS size at 2× for sharpness
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color]); // only restart if color changes (theme switch)

  return (
    <canvas
      ref={canvasRef}
      className="ram-card__waveform-canvas"
      style={{ height: 52 }}
    />
  );
}

// Dot matrix constants — 20 cols × 4 rows = 80 dots
const COLS = 16;
const ROWS = 2;
const TOTAL_DOTS = COLS * ROWS;

function DotMatrix({
  usedPercent,
  color,
}: {
  usedPercent: number;
  color: string;
}) {
  const activeDots = Math.round((usedPercent / 100) * TOTAL_DOTS);

  return (
    <div
      className="ram-card__dotmatrix-grid"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
    >
      {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
        const active = i < activeDots;
        // Dots near the fill boundary get a brighter glow — heat effect
        const distFromEdge = activeDots - i;
        const isEdge = active && distFromEdge <= 4;
        const edgeIntensity = isEdge ? 1 - (distFromEdge - 1) / 4 : 0;

        return (
          <motion.div
            key={i}
            className="ram-card__dot-cell"
            animate={{
              backgroundColor: active ? color : "rgba(255,255,255,0.07)",
              opacity: active ? 0.35 + 0.65 * Math.min(1, i / activeDots) : 1,
              boxShadow: isEdge
                ? `0 0 ${4 + edgeIntensity * 6}px ${color}, 0 0 ${2 + edgeIntensity * 3}px ${color}`
                : active
                  ? `0 0 3px ${color}60`
                  : "none",
            }}
            transition={{ duration: 0.5, delay: active ? i * 0.003 : 0 }}
          />
        );
      })}
    </div>
  );
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
            <span className="ram-card__pressure-unit">%</span>
          </span>
        </div>
      </div>

      {/* ── Dot matrix ── */}
      <div className="ram-card__dotmatrix">
        <div className="ram-card__dotmatrix-header">
          <span className="ram-card__label">ALLOCATION MAP</span>
          <span className="ram-card__label" style={{ color: mc }}>
            {ram.used.toFixed(1)} / {ram.total.toFixed(0)} GB
          </span>
        </div>
        <DotMatrix usedPercent={ram.usedPercent} color={mc} />
        <div className="ram-card__dotmatrix-scale">
          <span className="ram-card__scale-label">0</span>
          <span className="ram-card__scale-label">
            {(ram.total / 2).toFixed(0)} GB
          </span>
          <span className="ram-card__scale-label">
            {ram.total.toFixed(0)} GB
          </span>
        </div>
      </div>

      {/* ── Used / Free ── */}
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

      {/* ── Pagefile ── */}
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

      {/* ── Oscilloscope waveform ── */}
      <div className="ram-card__waveform">
        <div className="ram-card__waveform-header">
          <span className="ram-card__label">SIGNAL</span>
        </div>
        <Waveform usedPercent={ram.usedPercent} color={tc.tertiary} />
        <div className="ram-card__waveform-footer">
          <span className="ram-card__scale-label">0%</span>
          <span className="ram-card__scale-label">
            AMP ∝ {ram.usedPercent.toFixed(0)}% PRESSURE
          </span>
          <span className="ram-card__scale-label">100%</span>
        </div>
      </div>

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
          <Sparkline data={ramHistory} color={tc.secondary} height={46} />
        </div>
      </div>
    </motion.div>
  );
}
