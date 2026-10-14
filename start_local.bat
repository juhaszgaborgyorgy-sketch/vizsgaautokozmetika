@echo off
set "PHP_EXE=C:\xampp\php\php.exe"
if not exist "%PHP_EXE%" (
    echo Nem talalom a PHP-t itt: %PHP_EXE%
    echo Szerkeszd a start_local.bat fajlt, es add meg a php.exe helyes eleresi utjat.
    pause
    exit /b 1
)
cd /d "%~dp0"
echo Az oldal ezen a cimen fut: http://127.0.0.1:8000/autokozmetika.html
echo A szerver leallitasahoz nyomd meg a Ctrl+C billentyuket.
"%PHP_EXE%" -S 127.0.0.1:8000 -t "%~dp0"
pause
