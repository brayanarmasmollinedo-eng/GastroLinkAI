param([ValidateSet("dev", "start", "build", "check", "test")][string]$Task = "dev")
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$portableNode = Join-Path $projectRoot ".tools\node-v22.23.3-win-x64"
if (Test-Path -LiteralPath (Join-Path $portableNode "node.exe")) {
    $env:PATH = $portableNode + ";" + $env:PATH
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Instala Node.js 22 LTS y vuelve a ejecutar este script."
}
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "node_modules"))) {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
$env:NEXT_TELEMETRY_DISABLED = "1"
if ($Task -eq "check") {
    foreach ($step in @("typecheck", "lint", "test", "build")) {
        & npm.cmd run $step
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
} else {
    & npm.cmd run $Task
    exit $LASTEXITCODE
}
