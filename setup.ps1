# setup.ps1
# Run this from inside your Git directory (e.g. C:\Users\you\Git)
# Prerequisites: gh CLI, pnpm, node 18+

$projectName = "system-dashboard"

Write-Host "`n==> Creating GitHub repo: $projectName (public)" -ForegroundColor Cyan
gh repo create $projectName --public --description "Real-time hardware monitoring dashboard" --clone
Set-Location $projectName

Write-Host "`n==> Copying project files..." -ForegroundColor Cyan
# (Files are already scaffolded — see below)

Write-Host "`n==> Installing dependencies with pnpm..." -ForegroundColor Cyan
pnpm install

Write-Host "`n==> Initial git commit..." -ForegroundColor Cyan
git add .
git commit -m "feat: initial scaffold — React/TS frontend + Node/WS backend"
git push origin main

Write-Host "`n✓ Done! Run 'pnpm dev' to start the dashboard." -ForegroundColor Green
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  → http://localhost:3001`n" -ForegroundColor White
