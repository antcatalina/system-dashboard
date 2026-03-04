import { useMetrics } from '../hooks/useMetrics';
import { StatusBar } from '../components/StatusBar';
import { GPUCard } from '../components/GPUCard';
import { CPUCard } from '../components/CPUCard';
import { RAMCard } from '../components/RAMCard';
import { MonitorCard } from '../components/MonitorCard';
import { NetworkCard } from '../components/NetworkCard';
import { motion } from 'framer-motion';
import { CPU, GPU, RAM, Monitor, FPS, Network } from '../../domain';

const PLACEHOLDER = {
  cpu: new CPU({ model: 'Waiting for data...', cores: 0, threads: 0, load: 0, temperature: 0, frequency: 0, maxFrequency: 1, perCore: [] }),
  gpu: new GPU({ model: 'Waiting for data...', utilization: 0, memoryUsed: 0, memoryTotal: 1, temperature: 0, fanSpeed: 0, powerDraw: 0, powerLimit: 1, coreClock: 0, memoryClock: 0, driverVersion: '---' }),
  ram: new RAM({ total: 1, used: 0, free: 1, usedPercent: 0, swapTotal: 0, swapUsed: 0 }),
  monitors: [] as Monitor[],
  network: new Network({ downloadSpeed: 0, uploadSpeed: 0, downloadTotal: 0, uploadTotal: 0, latency: 0, adapters: [], primaryAdapter: '' }),
  fps: null as FPS | null,
  timestamp: 0,
};

export function DashboardPage() {
  const { metrics, history, connected } = useMetrics();
  const data = metrics ?? PLACEHOLDER;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <StatusBar connected={connected} />

      <main className="flex-1 flex flex-col overflow-visible"> 
        {!connected && (
          <motion.div
            className="mx-0 px-5 py-3 font-mono text-sm flex items-center gap-3"
            style={{ background: 'rgba(255,179,0,0.08)', borderBottom: '1px solid rgba(255,179,0,0.2)', color: '#ffb300' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          >
            <span style={{ color: '#ffb300' }}>◈</span>
            BACKEND OFFLINE — run <code className="px-2 py-0.5 mx-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>pnpm dev</code> from project root
          </motion.div>
        )}

        {/* Top row: 3 equal columns, zero gap */}
        <div className="flex flex-1 min-h-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <GPUCard gpu={data.gpu} history={history} />
          </div>
          <div className="flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <CPUCard cpu={data.cpu} history={history} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <RAMCard ram={data.ram} history={history} />
            </div>
            {data.monitors.length > 0 && (
              <div>
                <MonitorCard monitors={data.monitors} fps={data.fps} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: Network full width */}
        <div>
          <NetworkCard network={data.network} history={history} />
        </div>
      </main>
    </div>
  );
}