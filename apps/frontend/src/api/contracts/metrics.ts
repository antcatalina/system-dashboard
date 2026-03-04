/* API response type contracts */

export type CPUMetricsResponse = {
  model: string;
  cores: number;
  threads: number;
  load: number;
  temperature: number;
  frequency: number;
  maxFrequency: number;
  perCore: Array<{ core: number; load: number; frequency: number }>;
};

export type GPUMetricsResponse = {
  model: string;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  fanSpeed: number;
  powerDraw: number;
  powerLimit: number;
  coreClock: number;
  memoryClock: number;
  driverVersion: string;
};

export type RAMMetricsResponse = {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  swapTotal: number;
  swapUsed: number;
};

export type NetworkAdapterResponse = {
  name: string;
  ipv4?: string;
  ipv6?: string;
  macAddress?: string;
};

export type NetworkMetricsResponse = {
  downloadSpeed: number;
  uploadSpeed: number;
  downloadTotal: number;
  uploadTotal: number;
  latency: number;
  adapters: NetworkAdapterResponse[];
  primaryAdapter: string;
};

export type MonitorInfoResponse = {
  id: string;
  name: string;
  width: number;
  height: number;
  refreshRate: number;
  primary: boolean;
};

export type FPSMetricsResponse = {
  fps: number;
};

export type MetricsResponse = {
  timestamp: number;
  cpu: CPUMetricsResponse;
  gpu: GPUMetricsResponse;
  ram: RAMMetricsResponse;
  network: NetworkMetricsResponse;
  monitors: MonitorInfoResponse[];
  fps: FPSMetricsResponse | null;
};
