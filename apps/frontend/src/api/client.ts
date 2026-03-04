import { MetricsResponse } from './contracts/metrics';

const API_BASE_URL = 'http://localhost:3001';

export class ApiClient {
  static async getMetrics(): Promise<MetricsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    return response.json() as Promise<MetricsResponse>;
  }

  static async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
