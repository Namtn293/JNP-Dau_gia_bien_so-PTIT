$repoRoot = (Resolve-Path "$PSScriptRoot\..\..").Path
Set-Location "$repoRoot\source\client\jnp.fe"
try { $host.ui.RawUI.WindowTitle = "4. Web Frontend (Vite Port 5173)" } catch {}

Write-Host "=== KHOI DONG FRONTEND WEB (http://localhost:5173) ===" -ForegroundColor Magenta
npm run dev
