import { ApiClient } from '../../api/client';
import { CPU } from '../entities/CPU';
import { GPU } from '../entities/GPU';
import { RAM } from '../entities/RAM';
import { Network } from '../entities/Network';
import { Monitor, FPS } from '../entities/Monitor';

export interface MetricsSnapshot {
  timestamp: number;
  cpu: CPU;
  gpu: GPU;
  ram: RAM;
  network: Network;
  monitors: Monitor[];
  fps: FPS | null;
}

export class MetricsRepository {
  async fetchMetrics(): Promise<MetricsSnapshot> {
    const data = await ApiClient.getMetrics();

    return {
      timestamp: data.timestamp,
      cpu: new CPU(data.cpu),
      gpu: new GPU(data.gpu),
      ram: new RAM(data.ram),
      network: new Network(data.network),
      monitors: data.monitors.map((m) => new Monitor(m)),
      fps: data.fps ? new FPS(data.fps) : null,
    };
  }

  async isBackendAvailable(): Promise<boolean> {
    return ApiClient.ping();
  }
}
