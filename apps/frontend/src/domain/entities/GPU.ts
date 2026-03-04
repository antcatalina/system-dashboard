import { GPUMetricsResponse } from '../../api/contracts/metrics';

export class GPU {
  readonly model: string;
  readonly utilization: number;
  readonly memoryUsed: number;
  readonly memoryTotal: number;
  readonly temperature: number;
  readonly fanSpeed: number;
  readonly powerDraw: number;
  readonly powerLimit: number;
  readonly coreClock: number;
  readonly memoryClock: number;
  readonly driverVersion: string;

  constructor(data: GPUMetricsResponse) {
    this.model = data.model;
    this.utilization = data.utilization;
    this.memoryUsed = data.memoryUsed;
    this.memoryTotal = data.memoryTotal;
    this.temperature = data.temperature;
    this.fanSpeed = data.fanSpeed;
    this.powerDraw = data.powerDraw;
    this.powerLimit = data.powerLimit;
    this.coreClock = data.coreClock;
    this.memoryClock = data.memoryClock;
    this.driverVersion = data.driverVersion;
  }

  getMemoryUsagePercent(): number {
    return (this.memoryUsed / this.memoryTotal) * 100;
  }

  getPowerDrawPercent(): number {
    return (this.powerDraw / this.powerLimit) * 100;
  }

  isLoaded(): boolean {
    return this.utilization > 80;
  }

  isHot(): boolean {
    return this.temperature > 85;
  }

  isPowerLimited(): boolean {
    return this.powerDraw > this.powerLimit * 0.9;
  }
}
