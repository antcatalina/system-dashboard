import { useEffect, useRef, useState, useCallback } from 'react';
import { GetMetricsUseCase } from '../../application';
import { MetricsRepository, MetricsSnapshot } from '../../domain';
import { POLLING_CONFIG } from '../../shared/constants/config';

export type MetricHistory = {
  timestamp: number;
  cpuLoad: number;
  gpuUtil: number;
  ramUsed: number;
  gpuTemp: number;
  cpuTemp: number;
  networkDownload: number;
  networkUpload: number;
};

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [connected, setConnected] = useState(false);
  
  const useCaseRef = useRef<GetMetricsUseCase | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const retryRef = useRef<ReturnType<typeof setTimeout>>();

  const initializeUseCase = useCallback(() => {
    if (!useCaseRef.current) {
      const repository = new MetricsRepository();
      useCaseRef.current = new GetMetricsUseCase(repository);
    }
    return useCaseRef.current;
  }, []);

  const fetchMetrics = useCallback(async () => {
    const useCase = initializeUseCase();
    
    try {
      const snapshot = await useCase.execute();
      setMetrics(snapshot);
      setConnected(true);

      setHistory((prev) => {
        const newEntry: MetricHistory = {
          timestamp: snapshot.timestamp,
          cpuLoad: snapshot.cpu.load,
          gpuUtil: snapshot.gpu.utilization,
          ramUsed: snapshot.ram.usedPercent,
          gpuTemp: snapshot.gpu.temperature,
          cpuTemp: snapshot.cpu.temperature,
          networkDownload: snapshot.network.downloadSpeed,
          networkUpload: snapshot.network.uploadSpeed,
        };
        return [...prev, newEntry].slice(-POLLING_CONFIG.HISTORY_SIZE);
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setConnected(false);
      scheduleRetry();
    }
  }, [initializeUseCase]);

  const scheduleRetry = useCallback(() => {
    clearTimeout(retryRef.current);
    retryRef.current = setTimeout(
      () => {
        initializeUseCase()
          .isAvailable()
          .then((available) => {
            if (available) {
              setConnected(true);
              startPolling();
            } else {
              scheduleRetry();
            }
          });
      },
      POLLING_CONFIG.RETRY_INTERVAL_MS
    );
  }, [initializeUseCase]);

  const startPolling = useCallback(() => {
    clearInterval(pollingRef.current);
    fetchMetrics(); // Fetch immediately
    pollingRef.current = setInterval(fetchMetrics, POLLING_CONFIG.INTERVAL_MS);
  }, [fetchMetrics]);

  useEffect(() => {
    startPolling();
    return () => {
      clearInterval(pollingRef.current);
      clearTimeout(retryRef.current);
    };
  }, [startPolling]);

  return { metrics, history, connected };
}
