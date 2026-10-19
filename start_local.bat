@echo off
set "PHP_EXE=C:\xampp\php\php.exe"
if not exist "%PHP_EXE%" (
    echo Nem talalom a PHP-t itt: %PHP_EXE%
    echo Szerkeszd a start_local.bat fajlt, es add meg a php.exe helyes eleresi utjat.
    pause
    exit /b 1
)
cd /d "%~dp0"
echo PC-n: http://127.0.0.1:8000/autokozmetika.html
echo Telefonrol ugyanazon a Wi-Fi-n: hasznald a gep IPv4 cimet, pl. http://192.168.1.10:8000/autokozmetika.html
echo Az IPv4 cimet az ipconfig paranccsal keresheted meg.
echo A szerver leallitasahoz nyomd meg a Ctrl+C billentyuket.
"%PHP_EXE%" -S 0.0.0.0:8000 -t "%~dp0"
pause
