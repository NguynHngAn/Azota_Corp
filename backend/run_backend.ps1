Set-Location $PSScriptRoot
Write-Host "Running backend from: $(Get-Location)"
Write-Host ""
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
