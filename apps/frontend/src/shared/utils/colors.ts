/* Color utilities for different metric states */

export function getTemperatureColor(celsius: number): string {
  if (celsius < 60) return '#00ff9d'; // green - cool
  if (celsius < 75) return '#ffb300'; // amber - warm
  return '#ff3d57'; // red - hot
}

export function getLoadColor(percent: number): string {
  if (percent < 50) return '#00ff9d'; // green - light
  if (percent < 80) return '#ffb300'; // amber - medium
  return '#ff3d57'; // red - heavy
}

export function getLatencyColor(ms: number): string {
  if (ms === 0) return 'rgba(255,255,255,0.2)'; // no data
  if (ms < 20) return '#00ff9d'; // excellent
  if (ms < 60) return '#ffb300'; // good
  return '#ff3d57'; // poor
}

export function getMemoryColor(percentUsed: number): string {
  if (percentUsed > 85) return '#ff3d57'; // red - critical
  if (percentUsed > 65) return '#ffb300'; // amber - high
  return '#b388ff'; // purple - normal
}

export function getFpsColor(fps: number | null): string {
  if (fps === null) return '#00ff9d';
  if (fps >= 120) return '#00ff9d'; // green - excellent
  if (fps >= 60) return '#ffb300'; // amber - good
  return '#ff4d4d'; // red - poor
}
