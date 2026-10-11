# Локальный voice-gateway без Docker (задача 4.1)
param(
  [switch]$Start
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$VoiceDir = Join-Path $Root "services\voice"
$GatewayDir = Join-Path $VoiceDir "gateway"
$VenvDir = Join-Path $VoiceDir ".venv"

function New-VoiceVenv {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 -m venv $VenvDir
    return
  }
  if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m venv $VenvDir
    return
  }
  throw "Python 3.11+ не найден. Установите Python или Docker: npm run voice:up"
}

if (-not (Test-Path $VenvDir)) {
  Write-Host "Создаём venv: $VenvDir"
  New-VoiceVenv
}

$pip = Join-Path $VenvDir "Scripts\pip.exe"
$uvicorn = Join-Path $VenvDir "Scripts\uvicorn.exe"

& $pip install -r (Join-Path $GatewayDir "requirements.txt")

Write-Host "Готово. Docker: npm run voice:up  |  Python: npm run voice:dev"

if ($Start) {
  $env:VOICE_DATA_DIR = Join-Path $VoiceDir "data"
  New-Item -ItemType Directory -Force -Path $env:VOICE_DATA_DIR | Out-Null
  Set-Location $GatewayDir
  & $uvicorn app.main:app --host 127.0.0.1 --port 8080
}
