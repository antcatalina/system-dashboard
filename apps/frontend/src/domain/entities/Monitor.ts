import { MonitorInfoResponse, FPSMetricsResponse } from '../../api/contracts/metrics';

export class Monitor {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly refreshRate: number;
  readonly primary: boolean;

  constructor(data: MonitorInfoResponse) {
    this.id = data.id;
    this.name = data.name;
    this.width = data.width;
    this.height = data.height;
    this.refreshRate = data.refreshRate;
    this.primary = data.primary;
  }

  getResolutionString(): string {
    return `${this.width}x${this.height}`;
  }

  getRefreshRateString(): string {
    return `${this.refreshRate}Hz`;
  }
}

export class FPS {
  readonly fps: number;
  readonly processName: string;

  constructor(data: FPSMetricsResponse) {
    this.fps = data.fps;
    this.processName = data.processName;
  }

  isExcellent(): boolean {
    return this.fps >= 120;
  }

  isGood(): boolean {
    return this.fps >= 60;
  }

  isPoor(): boolean {
    return this.fps < 30;
  }
}
