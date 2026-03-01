export interface CPUCore {
  core: number;
  load: number;       // 0-100
  frequency: number;  // MHz
}

export interface CPUMetrics {
  model: string;
  cores: number;
  threads: number;
  load: number;         // overall %
  temperature: number;  // °C
  frequency: number;    // MHz current
  maxFrequency: number; // MHz max
  perCore: CPUCore[];
}

export interface GPUMetrics {
  model: string;
  utilization: number;     // 0-100
  memoryUsed: number;      // MB
  memoryTotal: number;     // MB
  temperature: number;     // °C
  fanSpeed: number;        // 0-100 %
  powerDraw: number;       // Watts
  powerLimit: number;      // Watts
  coreClock: number;       // MHz
  memoryClock: number;     // MHz
  driverVersion: string;
}

export interface RAMMetrics {
  total: number;      // GB
  used: number;       // GB
  free: number;       // GB
  usedPercent: number;
  swapTotal: number;  // GB
  swapUsed: number;   // GB
}

export interface MonitorInfo {
  id: string;
  name: string;
  primary: boolean;
  width: number;
  height: number;
  refreshRate: number;
  x: number;
  y: number;
}

export interface FPSMetrics {
  fps: number;
  avg1Percent: number;   // 1% low
  avg01Percent: number;  // 0.1% low
  processName: string;
}

export interface DashboardPayload {
  timestamp: number;
  cpu: CPUMetrics;
  gpu: GPUMetrics;
  ram: RAMMetrics;
  monitors: MonitorInfo[];
  fps: FPSMetrics | null;
}

export type WSMessage =
  | { type: 'metrics'; data: DashboardPayload }
  | { type: 'error'; message: string }
  | { type: 'ping' }
  | { type: 'pong' };
