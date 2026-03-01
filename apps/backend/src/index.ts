import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import si from 'systeminformation';
import { execSync } from 'child_process';
import type {
  DashboardPayload,
  CPUMetrics,
  GPUMetrics,
  RAMMetrics,
  MonitorInfo,
  FPSMetrics,
  WSMessage,
} from '@system-dashboard/shared';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;
const POLL_INTERVAL_MS = 1000;

// ─── NVIDIA-SMI GPU polling ───────────────────────────────────────────────────
function getNvidiaSmiData(): Partial<GPUMetrics> {
  try {
    const fields = [
      'name',
      'utilization.gpu',
      'memory.used',
      'memory.total',
      'temperature.gpu',
      'fan.speed',
      'power.draw',
      'power.limit',
      'clocks.current.graphics',
      'clocks.current.memory',
      'driver_version',
    ].join(',');

    const raw = execSync(
      `nvidia-smi --query-gpu=${fields} --format=csv,noheader,nounits`,
      { timeout: 3000 }
    )
      .toString()
      .trim();

    const [
      model,
      utilization,
      memUsed,
      memTotal,
      temp,
      fan,
      powerDraw,
      powerLimit,
      coreClock,
      memClock,
      driver,
    ] = raw.split(', ').map((v) => v.trim());

    return {
      model,
      utilization: parseFloat(utilization) || 0,
      memoryUsed: parseFloat(memUsed) || 0,
      memoryTotal: parseFloat(memTotal) || 0,
      temperature: parseFloat(temp) || 0,
      fanSpeed: parseFloat(fan) || 0,
      powerDraw: parseFloat(powerDraw) || 0,
      powerLimit: parseFloat(powerLimit) || 0,
      coreClock: parseFloat(coreClock) || 0,
      memoryClock: parseFloat(memClock) || 0,
      driverVersion: driver || 'N/A',
    };
  } catch {
    return {};
  }
}

// ─── Metric collection ────────────────────────────────────────────────────────
async function collectMetrics(): Promise<DashboardPayload> {
  const [cpuLoad, cpuTemp, cpuData, mem, displays] = await Promise.all([
    si.currentLoad(),
    si.cpuTemperature(),
    si.cpu(),
    si.mem(),
    si.displays(),
  ]);

  // CPU
  const cpu: CPUMetrics = {
    model: `${cpuData.manufacturer} ${cpuData.brand}`,
    cores: cpuData.physicalCores,
    threads: cpuData.cores,
    load: Math.round(cpuLoad.currentLoad * 10) / 10,
    temperature: cpuTemp.main ?? 0,
    frequency: cpuData.speed * 1000,
    maxFrequency: cpuData.speedMax * 1000,
    perCore: cpuLoad.cpus.map((c, i) => ({
      core: i,
      load: Math.round(c.load * 10) / 10,
      frequency: cpuData.speed * 1000,
    })),
  };

  // GPU via nvidia-smi
  const nvidiaData = getNvidiaSmiData();
  const gpu: GPUMetrics = {
    model: nvidiaData.model ?? 'Unknown GPU',
    utilization: nvidiaData.utilization ?? 0,
    memoryUsed: nvidiaData.memoryUsed ?? 0,
    memoryTotal: nvidiaData.memoryTotal ?? 0,
    temperature: nvidiaData.temperature ?? 0,
    fanSpeed: nvidiaData.fanSpeed ?? 0,
    powerDraw: nvidiaData.powerDraw ?? 0,
    powerLimit: nvidiaData.powerLimit ?? 0,
    coreClock: nvidiaData.coreClock ?? 0,
    memoryClock: nvidiaData.memoryClock ?? 0,
    driverVersion: nvidiaData.driverVersion ?? 'N/A',
  };

  // RAM
  const ram: RAMMetrics = {
    total: Math.round((mem.total / 1024 ** 3) * 100) / 100,
    used: Math.round((mem.active / 1024 ** 3) * 100) / 100,
    free: Math.round((mem.free / 1024 ** 3) * 100) / 100,
    usedPercent: Math.round((mem.active / mem.total) * 1000) / 10,
    swapTotal: Math.round((mem.swaptotal / 1024 ** 3) * 100) / 100,
    swapUsed: Math.round((mem.swapused / 1024 ** 3) * 100) / 100,
  };

  // Monitors
  const monitors: MonitorInfo[] = displays.map((d, i) => ({
    id: `monitor-${i}`,
    name: d.model ?? `Display ${i + 1}`,
    primary: i === 0,
    width: d.currentResX ?? d.resolutionX ?? 0,
    height: d.currentResY ?? d.resolutionY ?? 0,
    refreshRate: d.currentRefreshRate ?? d.refreshRate ?? 0,
    x: d.positionX ?? 0,
    y: d.positionY ?? 0,
  }));

  // FPS - placeholder; hook PresentMon CLI output here
  const fps: FPSMetrics | null = null;

  return {
    timestamp: Date.now(),
    cpu,
    gpu,
    ram,
    monitors,
    fps,
  };
}

// ─── WebSocket broadcast ──────────────────────────────────────────────────────
function broadcast(msg: WSMessage) {
  const raw = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  ws.on('message', (data) => {
    try {
      const msg: WSMessage = JSON.parse(data.toString());
      if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch {}
  });
  ws.on('close', () => console.log('[WS] Client disconnected'));
});

// ─── Poll loop ────────────────────────────────────────────────────────────────
setInterval(async () => {
  try {
    const data = await collectMetrics();
    broadcast({ type: 'metrics', data });
  } catch (err) {
    console.error('[Poll] Error:', err);
  }
}, POLL_INTERVAL_MS);

// ─── REST endpoint (optional one-shot fetch) ─────────────────────────────────
app.get('/api/metrics', async (_req, res) => {
  try {
    const data = await collectMetrics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[WS]     WebSocket on ws://localhost:${PORT}`);
});
