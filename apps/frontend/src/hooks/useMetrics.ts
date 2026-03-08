import { useEffect, useRef, useState, useCallback } from "react";
import type { DashboardPayload, FPSMetrics, WSMessage } from "@system-dashboard/shared";
import { GPU } from "../domain/entities/GPU";
import { CPU } from "../domain/entities/CPU";
import {  Monitor } from "../domain/entities/Monitor";

const WS_URL = `ws://${window.location.hostname}:3001`;
const API_URL = `http://${window.location.hostname}:3001`;
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

// Replaces raw shared types with domain classes where they exist
type Metrics = Omit<Partial<DashboardPayload>, "monitors" | "fps"> & {
  monitors?: Array<Monitor>;
  fps?: FPSMetrics | null; 
};

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [connected, setConnected] = useState(false);
  const [processIcon, setProcessIcon] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const metricsRef = useRef<Metrics>({}); // typed as Metrics, not DashboardPayload
  const activeRef = useRef(true);
  const lastIconProcess = useRef<string | null>(null);

  const fetchIcon = useCallback(async (processName: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/icon?process=${encodeURIComponent(processName)}`,
      );
      if (!res.ok) {
        setProcessIcon(null);
        return;
      }
      const { icon } = await res.json();
      if (icon) setProcessIcon(icon);
    } catch {
      setProcessIcon(null);
    }
  }, []);

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === "error" || msg.type === "pong" || msg.type === "ping")
        return;

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
          metricsRef.current.monitors = msg.data.monitors.map(
            (m) => new Monitor(m),
          );
          break;
        case "metric_fps": {
          metricsRef.current.fps = msg.data.fps ?? null;
          const incoming = msg.data.fps?.processName ?? null;
          if (incoming && incoming !== lastIconProcess.current) {
            lastIconProcess.current = incoming;
            setProcessIcon(null);
            fetchIcon(incoming);
          }
          if (!incoming) {
            lastIconProcess.current = null;
            setProcessIcon(null);
          }
          break;
        }
      }

      setMetrics({ ...metricsRef.current }); // no cast needed — already Metrics

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
    },
    [fetchIcon],
  );

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
      if (activeRef.current)
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
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
        ws.onclose = null;
        ws.close();
      }
    };
  }, [connect]);

  return { metrics, history, connected, processIcon };
}
