/* Formatters for displaying metrics */

export function formatSpeed(mbps: number): { value: string; unit: string } {
  if (mbps >= 1000) return { value: (mbps / 1000).toFixed(2), unit: 'Gbps' };
  if (mbps >= 1) return { value: mbps.toFixed(1), unit: 'Mbps' };
  return { value: (mbps * 1000).toFixed(0), unit: 'Kbps' };
}

export function formatBytes(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(gb * 1024).toFixed(0)} MB`;
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatFrequency(mhz: number): string {
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz.toFixed(0)} MHz`;
}

export function formatPower(watts: number): string {
  return `${watts.toFixed(0)}W`;
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(0)}ms`;
}
