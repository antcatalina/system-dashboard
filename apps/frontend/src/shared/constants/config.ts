/* Application constants */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  METRICS_ENDPOINT: '/api/metrics',
  HEALTH_ENDPOINT: '/health',
};

export const POLLING_CONFIG = {
  INTERVAL_MS: 1000, // Refresh every 1 second
  RETRY_INTERVAL_MS: 3000, // Retry every 3 seconds if offline
  HISTORY_SIZE: 120, // Keep last 120 data points
};

export const THRESHOLDS = {
  CPU_LOADED: 80,
  CPU_HOT: 85,
  GPU_LOADED: 80,
  GPU_HOT: 85,
  GPU_POWER_CRITICAL: 0.9,
  RAM_HIGH_PRESSURE: 85,
  RAM_MEDIUM_PRESSURE: 65,
  LATENCY_EXCELLENT: 20,
  LATENCY_GOOD: 60,
  LATENCY_POOR: 100,
  FPS_EXCELLENT: 120,
  FPS_GOOD: 60,
  FPS_POOR: 30,
};
