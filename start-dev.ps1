$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Test-Path "frontend/.env.local")) {
  Copy-Item "frontend/.env.example" "frontend/.env.local"
}

if (-not (Test-Path "frontend/node_modules")) {
  Write-Host "Installing frontend dependencies..."
  Push-Location "frontend"
  npm.cmd install
  Pop-Location
}

npm.cmd run dev
