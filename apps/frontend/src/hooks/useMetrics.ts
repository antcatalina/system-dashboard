import { useEffect, useRef, useState, useCallback } from 'react';
import type { DashboardPayload, WSMessage } from '@system-dashboard/shared';

const WS_URL = 'ws://localhost:3001';
const RECONNECT_DELAY_MS = 2000;
const HISTORY_LENGTH = 60; // 60 seconds of history

export type MetricHistory = {
  timestamp: number;
  cpuLoad: number;
  gpuUtil: number;
  ramUsed: number;
  gpuTemp: number;
  cpuTemp: number;
};

export function useMetrics() {
  const [metrics, setMetrics] = useState<DashboardPayload | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      clearTimeout(reconnectRef.current);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        if (msg.type === 'metrics') {
          setMetrics(msg.data);
          setHistory((prev) => {
            const next = [
              ...prev,
              {
                timestamp: msg.data.timestamp,
                cpuLoad: msg.data.cpu.load,
                gpuUtil: msg.data.gpu.utilization,
                ramUsed: msg.data.ram.usedPercent,
                gpuTemp: msg.data.gpu.temperature,
                cpuTemp: msg.data.cpu.temperature,
              },
            ].slice(-HISTORY_LENGTH);
            return next;
          });
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { metrics, history, connected };
}
