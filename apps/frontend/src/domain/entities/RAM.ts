import { RAMMetricsResponse } from '../../api/contracts/metrics';

export class RAM {
  readonly total: number;
  readonly used: number;
  readonly free: number;
  readonly usedPercent: number;
  readonly swapTotal: number;
  readonly swapUsed: number;

  constructor(data: RAMMetricsResponse) {
    this.total = data.total;
    this.used = data.used;
    this.free = data.free;
    this.usedPercent = data.usedPercent;
    this.swapTotal = data.swapTotal;
    this.swapUsed = data.swapUsed;
  }

  getSwapUsagePercent(): number {
    return this.swapTotal > 0 ? (this.swapUsed / this.swapTotal) * 100 : 0;
  }

  isHighPressure(): boolean {
    return this.usedPercent > 85;
  }

  isMediumPressure(): boolean {
    return this.usedPercent > 65;
  }
}
