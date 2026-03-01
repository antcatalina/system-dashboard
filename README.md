# System Dashboard

A real-time hardware monitoring dashboard with an ambient weather station-inspired UI.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + WebSocket
- **Monorepo**: pnpm workspaces
- **Shared**: TypeScript types package

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- NVIDIA GPU with `nvidia-smi` available in PATH

## Getting Started

```bash
# Install all dependencies
pnpm install

# Run both frontend and backend concurrently
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

## FPS Monitoring (Optional)

For FPS monitoring, install [PresentMon](https://github.com/GameTechDev/PresentMon) from Microsoft and pipe its output into the backend. See `apps/backend/src/index.ts` for the integration point.

## Project Structure

```
system-dashboard/
├── apps/
│   ├── frontend/        # React + TS + Vite
│   └── backend/         # Node + Express + WS
├── packages/
│   └── shared/          # Shared TypeScript types
└── package.json         # pnpm workspace root
```
