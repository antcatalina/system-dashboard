import { motion } from 'framer-motion';

interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  unit?: string;
  decimals?: number;
  showTicks?: boolean;
}

export function RadialGauge({
  value,
  max = 100,
  size = 120,
  color = '#00e5ff',
  label,
  unit = '%',
  decimals = 0,
  showTicks = true,
}: RadialGaugeProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const strokeWidth = size * 0.075;
  const radius = (size - strokeWidth * 2.5) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const startAngle = 225;
  const sweep = 270;

  // Full arc circumference for the 270° sweep
  const arcLength = (sweep / 360) * 2 * Math.PI * radius;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  // Both arcs use the FULL track path — we reveal the value arc using
  // strokeDashoffset instead of pathLength, which is pixel-accurate and
  // keeps the arc tip exactly where the geometry says it should be.
  const fullPath = describeArc(startAngle, startAngle + sweep);
  const dashOffset = arcLength * (1 - pct);

  // Needle dot: sits exactly on the arc centerline at the value angle
  const valueAngle = startAngle + sweep * pct;
  const needleRad = ((valueAngle - 90) * Math.PI) / 180;
  const needleX = cx + radius * Math.cos(needleRad);
  const needleY = cy + radius * Math.sin(needleRad);

  // Tick marks
  const ticks = showTicks
    ? Array.from({ length: 11 }, (_, i) => {
        const angle = startAngle + (sweep / 10) * i;
        const rad = ((angle - 90) * Math.PI) / 180;
        const isMajor = i % 5 === 0;
        const outerR = radius - strokeWidth * 0.1;
        const innerR = outerR - (isMajor ? strokeWidth * 0.55 : strokeWidth * 0.3);
        return {
          x1: cx + outerR * Math.cos(rad),
          y1: cy + outerR * Math.sin(rad),
          x2: cx + innerR * Math.cos(rad),
          y2: cy + innerR * Math.sin(rad),
          isMajor,
          active: i / 10 <= pct,
        };
      })
    : [];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>

        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={radius + strokeWidth * 0.8}
          fill="none" stroke={color} strokeWidth={0.5} opacity={0.1} />

        {/* Track */}
        <path d={fullPath} fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round" />

        {/* Danger zone tint above 80% */}
        {pct > 0.8 && (
          <path
            d={describeArc(startAngle + sweep * 0.8, startAngle + sweep)}
            fill="none" stroke="rgba(255,61,87,0.12)"
            strokeWidth={strokeWidth} strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.active ? color : 'rgba(255,255,255,0.12)'}
            strokeWidth={t.isMajor ? 1.5 : 0.75}
            strokeLinecap="round"
            opacity={t.active ? 0.8 : 0.4}
          />
        ))}

        {/* Value arc glow layer — same path, revealed by dashOffset */}
        <motion.path
          d={fullPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 1.8}
          strokeLinecap="round"
          opacity={0.12}
          strokeDasharray={arcLength}
          animate={{ strokeDashoffset: dashOffset }}
          initial={{ strokeDashoffset: arcLength }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Value arc main */}
        <motion.path
          d={fullPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          animate={{ strokeDashoffset: dashOffset }}
          initial={{ strokeDashoffset: arcLength }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color}90)` }}
        />

        {/* Needle dot — anchored to arc centerline at exact value angle */}
        {pct > 0 && (
          <motion.circle
            r={strokeWidth * 0.65}
            fill={color}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
            animate={{ cx: needleX, cy: needleY }}
            initial={{ cx: needleX, cy: needleY }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}

        {/* Center value */}
        <text x={cx} y={cy - size * 0.04}
          textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={size * 0.2}
          fontFamily="Orbitron, monospace" fontWeight="700"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}>
          {value.toFixed(decimals)}
        </text>
        <text x={cx} y={cy + size * 0.16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={size * 0.09}
          fontFamily="JetBrains Mono, monospace">
          {unit}
        </text>
      </svg>
      {label && <span className="label-text">{label}</span>}
    </div>
  );
}