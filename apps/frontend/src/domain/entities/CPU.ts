import { CPUMetricsResponse } from '../../api/contracts/metrics';

export class CPU {
  readonly model: string;
  readonly cores: number;
  readonly threads: number;
  readonly load: number;
  readonly temperature: number;
  readonly frequency: number;
  readonly maxFrequency: number;
  readonly perCore: Array<{ core: number; load: number; frequency: number }>;

  constructor(data: CPUMetricsResponse) {
    this.model = data.model;
    this.cores = data.cores;
    this.threads = data.threads;
    this.load = data.load;
    this.temperature = data.temperature;
    this.frequency = data.frequency;
    this.maxFrequency = data.maxFrequency;
    this.perCore = data.perCore;
  }

  getFrequencyGHz(): number {
    return this.frequency / 1000;
  }

  getMaxFrequencyGHz(): number {
    return this.maxFrequency / 1000;
  }

  isLoaded(): boolean {
    return this.load > 80;
  }

  isHot(): boolean {
    return this.temperature > 85;
  }
}
