@echo off
setlocal

cd /d "%~dp0"

if not exist "frontend\.env.local" (
  copy "frontend\.env.example" "frontend\.env.local" >nul
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd "frontend" >nul
  npm.cmd install
  popd >nul
)

npm.cmd run dev
