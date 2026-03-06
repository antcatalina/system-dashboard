import { useEffect, useRef, useState, useCallback } from "react";
import type { DashboardPayload, WSMessage } from "@system-dashboard/shared";
import { GPU } from "../domain/entities/GPU";
import { CPU } from "../domain/entities/CPU";

const WS_URL = "ws://localhost:3001";
const RECONNECT_DELAY_MS = 2000;
const HISTORY_LENGTH = 60;

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
  const [metrics, setMetrics] = useState<Partial<DashboardPayload> | null>(
    null,
  );
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const metricsRef = useRef<Partial<DashboardPayload>>({});
  const activeRef = useRef(true);

  const handleMessage = useCallback((msg: WSMessage) => {
    if (msg.type === "error" || msg.type === "pong") return;
    if (msg.type === "ping") return;

    // 1. Merge into ref synchronously
    switch (msg.type) {
      case "metric_cpu":
        metricsRef.current.cpu = new CPU(msg.data.cpu);
        break;
      case "metric_gpu":
        metricsRef.current.gpu = new GPU(msg.data.gpu);
        break;
      case "metric_ram":
        metricsRef.current.ram = msg.data.ram;
        break;
      case "metric_network":
        metricsRef.current.network = msg.data.network;
        break;
      case "metric_monitors":
        metricsRef.current.monitors = msg.data.monitors;
        break;
      case "metric_fps":
        metricsRef.current.fps = msg.data.fps;
        break;
    }

    // 2. Update React state for rendering (single setter, no reading-state-in-setter)
    setMetrics({ ...metricsRef.current } as DashboardPayload);

    // 3. Append history — read directly from ref, no second setMetrics needed
    const m = metricsRef.current;
    if (m.cpu && m.gpu && m.ram && m.network) {
      setHistory((prev) => {
        const entry: MetricHistory = {
          timestamp: msg.data.timestamp,
          cpuLoad: m.cpu!.load,
          gpuUtil: m.gpu!.utilization,
          ramUsed: m.ram!.usedPercent,
          gpuTemp: m.gpu!.temperature,
          cpuTemp: m.cpu!.temperature,
          networkDownload: m.network!.downloadSpeed,
          networkUpload: m.network!.uploadSpeed,
        };
        return [...prev, entry].slice(-HISTORY_LENGTH);
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (!activeRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      clearTimeout(reconnectRef.current);
    };

    ws.onmessage = (event) => {
      try {
        handleMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("[useMetrics] parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (activeRef.current) {
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => ws.close();
  }, [handleMessage]);

  useEffect(() => {
    activeRef.current = true;
    connect();

    return () => {
      activeRef.current = false;
      clearTimeout(reconnectRef.current);
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null; // suppress reconnect on intentional teardown
        ws.close();
      }
    };
  }, [connect]);

  return { metrics, history, connected };
}
