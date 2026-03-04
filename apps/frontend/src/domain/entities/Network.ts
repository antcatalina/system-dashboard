import { NetworkMetricsResponse, NetworkAdapterResponse } from '../../api/contracts/metrics';

export class NetworkAdapter {
  readonly name: string;
  readonly ipv4?: string;
  readonly ipv6?: string;
  readonly macAddress?: string;

  constructor(data: NetworkAdapterResponse) {
    this.name = data.name;
    this.ipv4 = data.ipv4;
    this.ipv6 = data.ipv6;
    this.macAddress = data.macAddress;
  }
}

export class Network {
  readonly downloadSpeed: number; // Mbps
  readonly uploadSpeed: number; // Mbps
  readonly downloadTotal: number; // GB
  readonly uploadTotal: number; // GB
  readonly latency: number; // ms
  readonly adapters: NetworkAdapter[];
  readonly primaryAdapter: string;

  constructor(data: NetworkMetricsResponse) {
    this.downloadSpeed = data.downloadSpeed;
    this.uploadSpeed = data.uploadSpeed;
    this.downloadTotal = data.downloadTotal;
    this.uploadTotal = data.uploadTotal;
    this.latency = data.latency;
    this.adapters = data.adapters.map((a) => new NetworkAdapter(a));
    this.primaryAdapter = data.primaryAdapter;
  }

  getPrimaryAdapterDetails(): NetworkAdapter | undefined {
    return this.adapters.find((a) => a.name === this.primaryAdapter);
  }

  hasExcellentLatency(): boolean {
    return this.latency < 20;
  }

  hasGoodLatency(): boolean {
    return this.latency < 60;
  }

  isPoor(): boolean {
    return this.latency > 100;
  }
}
