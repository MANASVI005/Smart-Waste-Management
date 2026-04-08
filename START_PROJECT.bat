@echo off
echo Starting Green Bin Nexus...

:: Start PHP Backend in a new window
start "PHP Backend" cmd /k "C:\xampp\php\php.exe -S 127.0.0.1:8001 -t php-backend"

:: Start Vite Frontend in a new window
echo Starting Frontend...
npm run dev

pause
