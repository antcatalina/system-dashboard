import { MetricsRepository, MetricsSnapshot } from '../../domain/repositories/MetricsRepository';

export class GetMetricsUseCase {
  private repository: MetricsRepository;

  constructor(repository: MetricsRepository) {
    this.repository = repository;
  }

  async execute(): Promise<MetricsSnapshot> {
    return this.repository.fetchMetrics();
  }

  async isAvailable(): Promise<boolean> {
    return this.repository.isBackendAvailable();
  }
}
