@echo off
cd "C:\Users\LEIDY\Desktop\Practicas\Desarrollo Software\Proyecto-Teamset\parcial\backend"
set NODE_ENV=development
npx ts-node-dev --respawn src/server.ts
