import { useMetrics } from "../../hooks/useMetrics";
import { StatusBar } from "../components/StatusBar";
import { GPUCard } from "../components/GPUCard";
import { CPUCard } from "../components/CPUCard";
import { RAMCard } from "../components/RAMCard";
import { MonitorCard } from "../components/MonitorCard";
import { NetworkCard } from "../components/NetworkCard";
import { NowPlayingCard } from "../components/NowPlayingCard";
import { motion } from "framer-motion";
import { CPU, GPU, RAM, Monitor, Network } from "../../domain";
import { FPSMetrics } from "@system-dashboard/shared";

const PLACEHOLDER = {
  cpu: new CPU({
    model: "Waiting for data...",
    cores: 0,
    threads: 0,
    load: 0,
    temperature: 0,
    frequency: 0,
    maxFrequency: 1,
    perCore: [],
  }),
  gpu: new GPU({
    model: "Waiting for data...",
    utilization: 0,
    memoryUsed: 0,
    memoryTotal: 1,
    temperature: 0,
    fanSpeed: 0,
    powerDraw: 0,
    powerLimit: 1,
    coreClock: 0,
    memoryClock: 0,
    driverVersion: "---",
  }),
  ram: new RAM({
    total: 1,
    used: 0,
    free: 1,
    usedPercent: 0,
    swapTotal: 0,
    swapUsed: 0,
  }),
  monitors: [] as Array<Monitor>,
  network: new Network({
    downloadSpeed: 0,
    uploadSpeed: 0,
    downloadTotal: 0,
    uploadTotal: 0,
    latency: 0,
    adapters: [],
    primaryAdapter: "",
  }),
  fps: null as FPSMetrics | null,
  timestamp: 0,
};

export function DashboardPage(): JSX.Element {
  const { metrics, history, connected, processIcon } = useMetrics();
  const data = {
    cpu: metrics?.cpu ?? PLACEHOLDER.cpu,
    gpu: metrics?.gpu ?? PLACEHOLDER.gpu,
    ram: (metrics?.ram ?? PLACEHOLDER.ram) as RAM,
    monitors: metrics?.monitors ?? PLACEHOLDER.monitors,
    network: (metrics?.network ?? PLACEHOLDER.network) as Network,
    fps: metrics?.fps ?? PLACEHOLDER.fps,
    timestamp: metrics?.timestamp ?? PLACEHOLDER.timestamp,
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden">
      <StatusBar connected={connected} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden dashboard-grid">
        {!connected && (
          <motion.div
            className="px-5 py-2 font-mono text-sm flex items-center gap-3 flex-shrink-0"
            style={{
              background: "rgba(255,179,0,0.08)",
              borderBottom: "1px solid rgba(255,179,0,0.2)",
              color: "#ffb300",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span style={{ color: "#ffb300" }}>◈</span>
            BACKEND OFFLINE — run{" "}
            <code
              className="px-2 py-0.5 mx-1"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              pnpm dev
            </code>{" "}
            from project root
          </motion.div>
        )}

        {/* Top row: 2x2 grid — GPU | CPU | RAM | Now Playing */}
        <div className="dashboard-grid__top flex flex-1 min-h-0 min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <GPUCard gpu={data.gpu} history={history} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <CPUCard cpu={data.cpu} history={history} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <RAMCard ram={data.ram} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <NowPlayingCard fps={data.fps} processIcon={processIcon} />
          </div>
        </div>

        {/* Monitor row — full width, only rendered when monitors are present */}
        {data.monitors.length > 0 && (
          <div className="dashboard-grid__monitor min-w-0 overflow-hidden">
            <MonitorCard
              monitors={data.monitors}
              fps={data.fps}
              processIcon={processIcon}
            />
          </div>
        )}

        {/* Network row — full width */}
        <div className="dashboard-grid__network min-w-0 overflow-hidden">
          <NetworkCard network={data.network} history={history} />
        </div>
      </main>
    </div>
  );
}
