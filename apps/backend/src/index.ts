import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import si from "systeminformation";
import { execSync } from "child_process";
import type {
  DashboardPayload,
  CPUMetrics,
  GPUMetrics,
  RAMMetrics,
  MonitorInfo,
  NetworkMetrics,
  NetworkAdapter,
  FPSMetrics,
  WSMessage,
} from "@system-dashboard/shared";
import { join } from "path";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;
const POLL_INTERVAL_MS = 1000;

// ─── CPU load smoothing ───────────────────────────────────────────────────────
const CPU_LOAD_HISTORY_SIZE = 10; // 10 seconds of history at 1s intervals
let _cpuLoadHistory: number[] = [];
let _perCoreLoadHistory: Map<number, number[]> = new Map();

function addCpuLoad(load: number) {
  _cpuLoadHistory.push(load);
  if (_cpuLoadHistory.length > CPU_LOAD_HISTORY_SIZE) {
    _cpuLoadHistory.shift();
  }
}

function getSmoothedCpuLoad(): number {
  if (_cpuLoadHistory.length === 0) return 0;
  const avg =
    _cpuLoadHistory.reduce((a, b) => a + b, 0) / _cpuLoadHistory.length;
  return Math.round(avg * 10) / 10;
}

function addPerCoreLoad(coreIndex: number, load: number) {
  if (!_perCoreLoadHistory.has(coreIndex)) {
    _perCoreLoadHistory.set(coreIndex, []);
  }
  const history = _perCoreLoadHistory.get(coreIndex)!;
  history.push(load);
  if (history.length > CPU_LOAD_HISTORY_SIZE) {
    history.shift();
  }
}

function getSmoothedPerCoreLoad(coreIndex: number): number {
  const history = _perCoreLoadHistory.get(coreIndex);
  if (!history || history.length === 0) return 0;
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  return Math.round(avg * 10) / 10;
}

// ─── CPU frequency polling via PowerShell ────────────────────────────────────
function getCurrentCpuFrequency(): { current: number; max: number } {
  try {
    const raw = execSync(
      `Get-WmiObject Win32_Processor | ForEach-Object { "$($_.CurrentClockSpeed),$($_.MaxClockSpeed)" }`,
      { shell: "powershell.exe", timeout: 3000 },
    )
      .toString()
      .trim();

    const [currentMhz, maxMhz] = raw
      .split(",")
      .map((v) => parseFloat(v.trim()));

    if (isNaN(currentMhz) || isNaN(maxMhz)) {
      console.warn(`[CPU Freq] Failed to parse: "${raw}"`);
      return { current: 0, max: 0 };
    }

    // Convert MHz to GHz
    const currentGhz = currentMhz / 1000;
    const maxGhz = maxMhz / 1000;

    return {
      current: currentGhz,
      max: maxGhz,
    };
  } catch (err) {
    console.warn("[CPU Freq] Failed to query:", String(err));
    return { current: 0, max: 0 };
  }
}

// ─── NVIDIA-SMI GPU polling ───────────────────────────────────────────────────
function getNvidiaSmiData(): Partial<GPUMetrics> {
  try {
    const fields = [
      "name",
      "utilization.gpu",
      "memory.used",
      "memory.total",
      "temperature.gpu",
      "fan.speed",
      "power.draw",
      "power.limit",
      "clocks.current.graphics",
      "clocks.current.memory",
      "driver_version",
    ].join(",");

    const raw = execSync(
      `nvidia-smi --query-gpu=${fields} --format=csv,noheader,nounits`,
      { timeout: 3000 },
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
    ] = raw.split(", ").map((v) => v.trim());

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
      driverVersion: driver || "N/A",
    };
  } catch {
    return {};
  }
}

// ─── Network polling ──────────────────────────────────────────────────────────
// We diff two networkStats samples 1s apart to get accurate Mbps readings.
let _prevNetStats: Awaited<ReturnType<typeof si.networkStats>> | null = null;
let _prevNetTime = Date.now();

async function getNetworkMetrics(): Promise<NetworkMetrics> {
  const [stats, interfaces] = await Promise.all([
    si.networkStats(),
    si.networkInterfaces(),
  ]);

  const now = Date.now();
  const elapsed = (now - _prevNetTime) / 1000; // seconds

  // Find active adapters (has IP, not loopback)
  const ifaceArr = Array.isArray(interfaces) ? interfaces : [interfaces];
  const activeIfaces = ifaceArr.filter(
    (i) => i.ip4 && i.ip4 !== "127.0.0.1" && !i.internal,
  );

  const adapters: NetworkAdapter[] = activeIfaces.map((iface) => ({
    name: iface.iface,
    type:
      iface.type?.toLowerCase().includes("wireless") ||
      iface.type?.toLowerCase().includes("wi-fi") ||
      iface.type?.toLowerCase().includes("wifi")
        ? "wireless"
        : iface.type?.toLowerCase().includes("ethernet") ||
            iface.type?.toLowerCase().includes("wired")
          ? "wired"
          : "other",
    ipv4: iface.ip4 ?? "",
    mac: iface.mac ?? "",
    speed: iface.speed ?? 0,
  }));

  // Sum across all active interfaces
  const activeStats = stats.filter((s) =>
    activeIfaces.some((i) => i.iface === s.iface),
  );

  const totalRxBytes = activeStats.reduce((a, s) => a + (s.rx_bytes ?? 0), 0);
  const totalTxBytes = activeStats.reduce((a, s) => a + (s.tx_bytes ?? 0), 0);

  let downloadSpeed = 0;
  let uploadSpeed = 0;

  if (_prevNetStats && elapsed > 0) {
    const prevActiveStats = _prevNetStats.filter((s) =>
      activeIfaces.some((i) => i.iface === s.iface),
    );
    const prevRx = prevActiveStats.reduce((a, s) => a + (s.rx_bytes ?? 0), 0);
    const prevTx = prevActiveStats.reduce((a, s) => a + (s.tx_bytes ?? 0), 0);

    downloadSpeed = Math.max(
      0,
      ((totalRxBytes - prevRx) * 8) / elapsed / 1_000_000,
    );
    uploadSpeed = Math.max(
      0,
      ((totalTxBytes - prevTx) * 8) / elapsed / 1_000_000,
    );
  }

  _prevNetStats = stats;
  _prevNetTime = now;

  // Ping default gateway for latency
  let latency = 0;
  try {
    const defaultNet = await si.networkGatewayDefault();
    if (defaultNet) {
      const pingResult = await si.inetLatency(defaultNet);
      latency = pingResult ?? 0;
    }
  } catch {
    /* latency stays 0 */
  }

  const primaryAdapter = activeIfaces[0]?.iface ?? "Unknown";

  return {
    downloadSpeed: Math.round(downloadSpeed * 100) / 100,
    uploadSpeed: Math.round(uploadSpeed * 100) / 100,
    downloadTotal: Math.round((totalRxBytes / 1024 ** 3) * 100) / 100,
    uploadTotal: Math.round((totalTxBytes / 1024 ** 3) * 100) / 100,
    latency,
    adapters,
    primaryAdapter,
  };
}

// ─── PresentMon FPS polling ───────────────────────────────────────────────────
import { spawn, ChildProcess } from "child_process";

interface FPSState {
  fps: number;
  avg1Percent: number;
  avg01Percent: number;
  processName: string;
}

let _fpsState: FPSState | null = null;
let _presentMonProc: ChildProcess | null = null;
const _frameTimingsMap: Map<string, number[]> = new Map();
const FRAME_WINDOW = 300; // keep last 300 frames (~5s at 60fps)

function startPresentMon() {
  // Kill any existing instance
  try {
    _presentMonProc?.kill();
  } catch {}

  const presentMonPath = join(process.cwd(), "PresentMon.exe");

  try {
    // PresentMon must be run as admin — place PresentMon.exe in your project root or PATH
    _presentMonProc = spawn(presentMonPath, [
      "-output_stdout",
      "-stop_existing_session",
    ]);

    _presentMonProc.on("error", (err) => {
      console.warn(
        "[PresentMon] Failed to start (FPS metrics will be unavailable):",
        err.message,
      );
      console.warn(
        "[PresentMon] Note: PresentMon requires admin privileges or Performance Log Users group",
      );
      console.warn("[PresentMon] Place PresentMon.exe in:", process.cwd());
    });

    let buffer = "";
    let headers: string[] = [];

    _presentMonProc.stdout?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // First line is the CSV header
        if (headers.length === 0) {
          headers = trimmed.split(",").map((h) => h.trim());
          console.log("[PresentMon HEADERS]", headers);
          continue;
        }

        const values = trimmed.split(",");
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i]?.trim() ?? "";
        });
        const processName = row["Application"] ?? "Unknown";
        const skipList = [
          "dwm.exe",
          "opera.exe",
          "chrome.exe",
          "firefox.exe",
          "msedge.exe",
          "tabby.exe",
          "code.exe",
          "discord.exe",
          "galaxyclient.exe",
          "galaxyclient helper.exe",
          "steamwebhelper.exe",
          "msedgewebview2.exe",
        ];
        if (skipList.some((p) => processName.toLowerCase() === p.toLowerCase()))
          continue;
        if (processName === "Unknown") continue;

        const msBetweenPresents = parseFloat(row["MsBetweenPresents"] ?? "0");
        if (!isNaN(msBetweenPresents) && msBetweenPresents > 0) {
          if (!_frameTimingsMap.has(processName)) {
            _frameTimingsMap.set(processName, []);
          }
          const timings = _frameTimingsMap.get(processName)!;
          timings.push(msBetweenPresents);
          if (timings.length > FRAME_WINDOW) timings.shift();

          if (timings.length > 10) {
            const sorted = [...timings].sort((a, b) => (b > a ? 1 : 0));
            const fps =
              1000 / (sorted.reduce((a, b) => a + b, 0) / sorted.length);
            const pct1Count = Math.max(1, Math.floor(sorted.length * 0.01));
            const avg1Percent =
              1000 /
              (sorted.slice(0, pct1Count).reduce((a, b) => a + b, 0) /
                pct1Count);
            const pct01Count = Math.max(1, Math.floor(sorted.length * 0.001));
            const avg01Percent =
              1000 /
              (sorted.slice(0, pct01Count).reduce((a, b) => a + b, 0) /
                pct01Count);

            // Only update _fpsState if this process has the most recent frame activity
            // (i.e. it's the last thing that presented — which is what we just received)
            _fpsState = {
              fps: avg1Percent,
              avg1Percent: Math.round(avg1Percent * 10) / 10,
              avg01Percent: Math.round(avg01Percent * 10) / 10,
              processName,
            };
          }
        }
      }
    });

    _presentMonProc.stderr?.on("data", (d: Buffer) => {
      const msg = d.toString().trim();
      // Suppress repeated admin privilege warnings
      if (
        !msg.includes("access denied") &&
        !msg.includes("elevated privilege")
      ) {
        console.warn("[PresentMon]", msg);
      }
    });

    _presentMonProc.on("exit", (code) => {
      if (code !== 0) {
        console.warn(
          `[PresentMon] exited with code ${code}, will retry in 10s...`,
        );
        _fpsState = null;
        setTimeout(startPresentMon, 10000);
      }
    });
  } catch (err) {
    console.warn("[PresentMon] Failed to spawn process:", String(err));
    console.warn("[PresentMon] Continuing without FPS metrics...");
  }
}

// Start on server init
startPresentMon();

// ─── Individual metric collectors ────────────────────────────────────────────
async function collectCPU(): Promise<CPUMetrics> {
  const [graphics, cpuLoad, cpuData] = await Promise.all([
    si.graphics(),
    si.currentLoad(),
    si.cpu(),
  ]);
  const cpuFreq = getCurrentCpuFrequency();
  addCpuLoad(cpuLoad.currentLoad);
  const smoothedLoad = getSmoothedCpuLoad();
  if (Math.random() < 0.1) {
    console.log(
      `[CPU] Raw: ${Math.round(cpuLoad.currentLoad * 10) / 10}% → Smoothed: ${smoothedLoad}%`,
    );
  }
  cpuLoad.cpus.forEach((c, i) => addPerCoreLoad(i, c.load));
  const cpuTemperature: number =
    graphics.controllers?.find(
      (c) =>
        c.vendor?.toLowerCase().includes("amd") ||
        c.name?.toLowerCase().includes("radeon"),
    )?.temperatureGpu ?? 0;
  return {
    model: `${cpuData.manufacturer} ${cpuData.brand}`,
    cores: cpuData.physicalCores,
    threads: cpuData.cores,
    load: smoothedLoad * 0.85,
    temperature: cpuTemperature,
    frequency: cpuFreq.current * 1000,
    maxFrequency: cpuFreq.max * 1000,
    perCore: cpuLoad.cpus.map((c, i) => ({
      core: i,
      load: getSmoothedPerCoreLoad(i) * 0.85,
      frequency: cpuFreq.current * 1000,
    })),
  };
}

async function collectGPU(): Promise<GPUMetrics> {
  const nvidiaData = getNvidiaSmiData();
  return {
    model: nvidiaData.model ?? "Unknown GPU",
    utilization: nvidiaData.utilization ?? 0,
    memoryUsed: nvidiaData.memoryUsed ?? 0,
    memoryTotal: nvidiaData.memoryTotal ?? 0,
    temperature: nvidiaData.temperature ?? 0,
    fanSpeed: nvidiaData.fanSpeed ?? 0,
    powerDraw: nvidiaData.powerDraw ?? 0,
    powerLimit: nvidiaData.powerLimit ?? 0,
    coreClock: nvidiaData.coreClock ?? 0,
    memoryClock: nvidiaData.memoryClock ?? 0,
    driverVersion: nvidiaData.driverVersion ?? "N/A",
  };
}

async function collectRAM(): Promise<RAMMetrics> {
  const mem = await si.mem();
  return {
    total: Math.round((mem.total / 1024 ** 3) * 100) / 100,
    used: Math.round((mem.active / 1024 ** 3) * 100) / 100,
    free: Math.round((mem.free / 1024 ** 3) * 100) / 100,
    usedPercent: Math.round((mem.active / mem.total) * 1000) / 10,
    swapTotal: Math.round((mem.swaptotal / 1024 ** 3) * 100) / 100,
    swapUsed: Math.round((mem.swapused / 1024 ** 3) * 100) / 100,
  };
}

async function collectMonitors(): Promise<MonitorInfo[]> {
  const graphics = await si.graphics();
  const displays = graphics.displays ?? [];
  return displays
    .slice()
    .sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0))
    .map((d, i) => {
      const fallbackName =
        [
          d.connection,
          `${d.currentResX ?? d.resolutionX}×${d.currentResY ?? d.resolutionY}`,
        ]
          .filter(Boolean)
          .join(" ") || `Display ${i + 1}`;
      return {
        id: `monitor-${i}`,
        name: d.model?.trim() ? d.model.trim() : fallbackName,
        primary: d.main ?? false,
        width: d.currentResX ?? d.resolutionX ?? 0,
        height: d.currentResY ?? d.resolutionY ?? 0,
        refreshRate: d.currentRefreshRate ?? 0,
        x: d.positionX ?? 0,
        y: d.positionY ?? 0,
      };
    });
}

// ─── WebSocket broadcast ──────────────────────────────────────────────────────
function broadcast(msg: WSMessage) {
  const raw = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(raw);
  });
}

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  ws.on("message", (data) => {
    try {
      const msg: WSMessage = JSON.parse(data.toString());
      if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
    } catch {}
  });
  ws.on("close", () => console.log("[WS] Client disconnected"));
});

// ─── Poll loop — each metric fires independently, UI updates as each resolves ─
setInterval(() => {
  const timestamp = Date.now();

  collectCPU()
    .then((cpu) => broadcast({ type: "metric_cpu", data: { timestamp, cpu } }))
    .catch((err) => console.error("[Poll] CPU error:", err));

  collectGPU()
    .then((gpu) => broadcast({ type: "metric_gpu", data: { timestamp, gpu } }))
    .catch((err) => console.error("[Poll] GPU error:", err));

  collectRAM()
    .then((ram) => broadcast({ type: "metric_ram", data: { timestamp, ram } }))
    .catch((err) => console.error("[Poll] RAM error:", err));

  getNetworkMetrics()
    .then((network) =>
      broadcast({ type: "metric_network", data: { timestamp, network } }),
    )
    .catch((err) => console.error("[Poll] Network error:", err));

  collectMonitors()
    .then((monitors) =>
      broadcast({ type: "metric_monitors", data: { timestamp, monitors } }),
    )
    .catch((err) => console.error("[Poll] Monitors error:", err));

  // FPS is sync state — broadcast immediately
  broadcast({ type: "metric_fps", data: { timestamp, fps: _fpsState } });
}, POLL_INTERVAL_MS);

// ─── REST endpoint (optional one-shot fetch) ─────────────────────────────────
app.get("/api/metrics", async (_req, res) => {
  try {
    const [cpu, gpu, ram, network, monitors] = await Promise.all([
      collectCPU(),
      collectGPU(),
      collectRAM(),
      getNetworkMetrics(),
      collectMonitors(),
    ]);
    const data: DashboardPayload = {
      timestamp: Date.now(),
      cpu,
      gpu,
      ram,
      network,
      monitors,
      fps: _fpsState,
    };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[WS]     WebSocket on ws://localhost:${PORT}`);
});
