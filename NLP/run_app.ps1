Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting ResearchAI - AI Research Paper Companion    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$pythonPath = "C:\Python314\python.exe"
if (-not (Test-Path $pythonPath)) {
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
}

Write-Host "`nUsing Python: $pythonPath" -ForegroundColor Yellow
Set-Location $rootDir
& $pythonPath start.py
