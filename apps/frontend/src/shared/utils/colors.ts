/* Color utilities for different metric states */

export function getTemperatureColor(celsius: number): string {
  if (celsius < 60) return 'var(--color-green)';
  if (celsius < 75) return 'var(--color-amber)';
  return 'var(--color-red)';
}

export function getLoadColor(percent: number): string {
  if (percent < 50) return 'var(--color-green)';
  if (percent < 80) return 'var(--color-amber)';
  return 'var(--color-red)';
}

export function getLatencyColor(ms: number): string {
  if (ms === 0) return 'rgba(255,255,255,0.2)';
  if (ms < 20) return 'var(--color-green)';
  if (ms < 60) return 'var(--color-amber)';
  return 'var(--color-red)';
}

export function getMemoryColor(percentUsed: number): string {
  if (percentUsed > 85) return 'var(--color-red)';
  if (percentUsed > 65) return 'var(--color-amber)';
  return 'var(--color-green)';
}

export function getFpsColor(fps: number | null): string {
  if (fps === null) return 'var(--color-green)';
  if (fps >= 120) return 'var(--color-green)';
  if (fps >= 60) return 'var(--color-amber)';
  return 'var(--color-red)';
}