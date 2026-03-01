import { motion } from 'framer-motion';

interface RadialGaugeProps {
  value: number;       // 0-100
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  unit?: string;
  decimals?: number;
}

export function RadialGauge({
  value,
  max = 100,
  size = 120,
  color = '#00e5ff',
  label,
  unit = '%',
  decimals = 0,
}: RadialGaugeProps) {
  const pct = Math.min(value / max, 1);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc from 225° to 315° (270° sweep)
  const startAngle = 225;
  const sweep = 270;
  const endAngle = startAngle + sweep * pct;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackPath = describeArc(startAngle, startAngle + sweep);
  const valuePath = describeArc(startAngle, endAngle);
  const trackLength = Math.PI * radius * (sweep / 180);

  const displayValue = value.toFixed(decimals);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Center text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.18}
          fontFamily="Orbitron, monospace"
          fontWeight="700"
        >
          {displayValue}
        </text>
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={size * 0.1}
          fontFamily="DM Sans, sans-serif"
        >
          {unit}
        </text>
      </svg>
      {label && (
        <span className="label-text">{label}</span>
      )}
    </div>
  );
}
