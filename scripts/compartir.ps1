# Enciende la app en modo producción y publica el enlace público (Dev Tunnels).
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\compartir.ps1
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$tunnel = "gastrolinkai-demo"
$devtunnel = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter devtunnel.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
if (-not $devtunnel) { throw "Falta devtunnel. Instálalo con: winget install Microsoft.devtunnel" }
# 1) App (si el puerto 3100 ya responde, no se vuelve a lanzar)
try { Invoke-WebRequest http://127.0.0.1:3100 -UseBasicParsing -TimeoutSec 3 | Out-Null; $up = $true } catch { $up = $false }
if (-not $up) {
    if (-not (Test-Path ".next\BUILD_ID")) {
        & powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run.ps1 build
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    Start-Process powershell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '.\scripts\run.ps1', 'start' -WindowStyle Minimized
    Start-Sleep 10
}
# 2) Túnel (mantiene su dirección fija mientras exista y no caduque)
& $devtunnel user show *> $null
if ($LASTEXITCODE -ne 0) { & $devtunnel user login -g -d }
Write-Host "Enlace: https://dv8zh2gm-3100.brs.devtunnels.ms" -ForegroundColor Green
Write-Host "Deja esta ventana abierta para mantenerlo activo (Ctrl+C para cerrar)."
& $devtunnel host $tunnel
