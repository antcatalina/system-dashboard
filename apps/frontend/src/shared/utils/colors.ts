/* Color utilities for different metric states */

export function getTemperatureColor(celsius: number): string {
  if (celsius < 60) return 'var(--color-green)'; // green - cool
  if (celsius < 75) return 'var(--color-amber)'; // amber - warm
  return 'var(--color-red)'; // red - hot
}

export function getLoadColor(percent: number): string {
  if (percent < 50) return 'var(--color-green)'; // green - light
  if (percent < 80) return 'var(--color-amber)'; // amber - medium
  return 'var(--color-red)'; // red - heavy
}

export function getLatencyColor(ms: number): string {
  if (ms === 0) return 'rgba(255,255,255,0.2)'; // no data
  if (ms < 20) return 'var(--color-green)'; // excellent
  if (ms < 60) return 'var(--color-amber)'; // good
  return 'var(--color-red)'; // poor
}

export function getMemoryColor(percentUsed: number): string {
  if (percentUsed > 85) return 'var(--color-red)'; // red - critical
  if (percentUsed > 65) return 'var(--color-amber)'; // amber - high
  return 'var(--color-purple)'; // purple - normal
}

export function getFpsColor(fps: number | null): string {
  if (fps === null) return 'var(--color-green)';
  if (fps >= 120) return 'var(--color-green)'; // green - excellent
  if (fps >= 60) return 'var(--color-amber)'; // amber - good
  return 'var(--color-red)'; // red - poor
}
