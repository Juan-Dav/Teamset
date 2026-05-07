# Script para iniciar los servidores
Write-Host "Iniciando backend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d C:\Users\LEIDY\Desktop\Practicas\Desarrollo Software\Proyecto-Teamset\parcial\backend && node dist/server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Iniciando frontend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d C:\Users\LEIDY\Desktop\Practicas\Desarrollo Software\Proyecto-Teamset\parcial\frontend && npm run dev" -WindowStyle Normal

Write-Host "Servidores iniciados!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
