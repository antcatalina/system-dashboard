import { useMetrics } from './hooks/useMetrics';
import { StatusBar } from './components/StatusBar';
import { GPUCard } from './components/GPUCard';
import { CPUCard } from './components/CPUCard';
import { RAMCard } from './components/RAMCard';
import { MonitorCard } from './components/MonitorCard';
import { motion } from 'framer-motion';

// Placeholder metrics shown before backend connects
const PLACEHOLDER = {
  cpu: {
    model: 'Waiting for data...',
    cores: 0, threads: 0, load: 0, temperature: 0,
    frequency: 0, maxFrequency: 1, perCore: [],
  },
  gpu: {
    model: 'Waiting for data...',
    utilization: 0, memoryUsed: 0, memoryTotal: 1,
    temperature: 0, fanSpeed: 0, powerDraw: 0,
    powerLimit: 1, coreClock: 0, memoryClock: 0,
    driverVersion: '---',
  },
  ram: { total: 1, used: 0, free: 1, usedPercent: 0, swapTotal: 0, swapUsed: 0 },
  monitors: [],
  fps: null,
};

export default function App() {
  const { metrics, history, connected } = useMetrics();
  const data = metrics ?? PLACEHOLDER;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <StatusBar connected={connected} timestamp={metrics?.timestamp} />

      <main className="flex-1 p-6 overflow-auto">
        {!connected && (
          <motion.div
            className="mb-4 px-4 py-3 rounded-lg border border-accent-amber/20 bg-accent-amber/5 text-accent-amber font-mono text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ⚠ Backend not connected — start the backend with <code className="bg-white/10 px-1.5 py-0.5 rounded">pnpm dev</code> from the root
          </motion.div>
        )}

        {/* Primary grid: GPU + CPU take the most space */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* GPU - largest card */}
          <div className="xl:col-span-1">
            <GPUCard gpu={data.gpu} history={history} />
          </div>

          {/* CPU */}
          <div className="xl:col-span-1">
            <CPUCard cpu={data.cpu} history={history} />
          </div>

          {/* Right column: RAM + Monitors */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <RAMCard ram={data.ram} history={history} />
            {data.monitors.length > 0 && <MonitorCard monitors={data.monitors} />}
          </div>
        </div>
      </main>
    </div>
  );
}
