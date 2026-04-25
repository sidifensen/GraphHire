@echo off
powershell -Command "Get-NetTCPConnection -LocalPort 7777 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
