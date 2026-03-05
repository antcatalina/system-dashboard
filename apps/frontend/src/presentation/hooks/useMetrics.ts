import { useEffect, useRef, useState, useCallback } from "react";
import { GetMetricsUseCase } from "../../application";
import { MetricsRepository, MetricsSnapshot } from "../../domain";
import { POLLING_CONFIG } from "../../shared/constants/config";

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

const INITIAL_COUNT = 3;

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [connected, setConnected] = useState(false);

  const useCaseRef = useRef<GetMetricsUseCase | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const activeRef = useRef(true);
  const warmupCountRef = useRef(0);
  const fetchRef = useRef<() => Promise<void>>();

  const initializeUseCase = useCallback(() => {
    if (!useCaseRef.current) {
      const repository = new MetricsRepository();
      useCaseRef.current = new GetMetricsUseCase(repository);
    }
    return useCaseRef.current;
  }, []);

  fetchRef.current = async () => {
    if (!activeRef.current) return;

    const useCase = initializeUseCase();

    try {
      const snapshot = await useCase.execute();
      if (!activeRef.current) return;

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

      // Once warmed up, schedule next only after completion (sequential)
      if (warmupCountRef.current >= INITIAL_COUNT) {
        timerRef.current = setTimeout(
          () => fetchRef.current?.(),
          POLLING_CONFIG.INTERVAL_MS,
        );
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      if (!activeRef.current) return;
      setConnected(false);

      // On error during warmup, still increment so we don't get stuck
      warmupCountRef.current += 1;

      if (warmupCountRef.current >= INITIAL_COUNT) {
        timerRef.current = setTimeout(
          () => fetchRef.current?.(),
          POLLING_CONFIG.RETRY_INTERVAL_MS,
        );
      }
    }
  };

  useEffect(() => {
    activeRef.current = true;
    warmupCountRef.current = 0;

    // Fire INITIAL_COUNT requests 1s apart, tracking completions
    for (let i = 0; i < INITIAL_COUNT; i++) {
      setTimeout(() => {
        if (!activeRef.current) return;
        warmupCountRef.current += 1;
        fetchRef.current?.();
      }, i * POLLING_CONFIG.INTERVAL_MS);
    }

    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  return { metrics, history, connected };
}
