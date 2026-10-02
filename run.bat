@echo off
setlocal EnableExtensions EnableDelayedExpansion
title MOSTAQBAL - dev launcher
color 0B

rem ---------------------------------------------------------------
rem  MOSTAQBAL launcher (Windows)
rem   1. checks Go / Node / npm (and the C compiler sqlite3 needs)
rem   2. installs missing backend + frontend dependencies
rem   3. starts the Go backend on :8080 and Next.js on :3000
rem  Usage: run.bat [--reinstall] [--no-browser]
rem ---------------------------------------------------------------

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"

set "OPEN_BROWSER=1"
set "REINSTALL=0"
:parse_args
if "%~1"=="" goto :parse_done
if /I "%~1"=="--reinstall"    set "REINSTALL=1"
if /I "%~1"=="--no-browser"  set "OPEN_BROWSER=0"
if /I "%~1"=="--help"        goto :help
if /I "%~1"=="-h"            goto :help
shift
goto :parse_args
:parse_done

echo.
echo  ============================================================
echo    MOSTAQBAL  ^|  backend: Go + SQLite  :8080
echo                 frontend: Next.js        :3000
echo  ============================================================
echo.

rem ---------------------------------------------------------------
echo  [1/5] Project folders
rem ---------------------------------------------------------------
if not exist "%BACKEND%\go.mod" (
  echo   [XX] backend not found at "%BACKEND%"
  goto :fail
)
if not exist "%BACKEND%\cmd\main.go" (
  echo   [XX] backend entry point not found: backend\cmd\main.go
  goto :fail
)
if not exist "%FRONTEND%\package.json" (
  echo   [XX] frontend not found at "%FRONTEND%"
  goto :fail
)
echo   [ok] backend  = %BACKEND%
echo   [ok] frontend = %FRONTEND%
echo.

rem ---------------------------------------------------------------
echo  [2/5] Required software
rem ---------------------------------------------------------------
call :need go  "Go 1.25 or newer"   "https://go.dev/dl/"            || goto :fail
call :need node "Node.js 18 or newer" "https://nodejs.org/"        || goto :fail
call :need npm  "npm (ships with Node.js)" "https://nodejs.org/"    || goto :fail

rem go-sqlite3 is a cgo package: without a C compiler the backend cannot build.
where gcc >nul 2>&1
if errorlevel 1 (
  echo   [!!] WARNING: gcc was not found.
  echo        The backend uses github.com/mattn/go-sqlite3, which needs cgo
  echo        and therefore a C compiler. Install "TDM-GCC" or "MSYS2 mingw-w64"
  echo        and make sure gcc.exe is in PATH, then run this script again:
  echo          https://jmeubank.github.io/tdm-gcc/
  echo          winget install -e --id MSYS2.MSYS2
  echo.
) else (
  echo   [ok] gcc found - cgo/sqlite3 can be built
)
echo.

rem ---------------------------------------------------------------
echo  [3/5] Backend dependencies ^(Go modules^)
rem ---------------------------------------------------------------
pushd "%BACKEND%"
if "%REINSTALL%"=="1" (
  echo   reinstalling all modules...
  go mod download -x all >nul
)
go mod download
if errorlevel 1 (
  popd
  echo   [XX] "go mod download" failed. Check your internet connection.
  goto :fail
)
popd
echo   [ok] Go modules ready
echo.

rem ---------------------------------------------------------------
echo  [4/5] Frontend dependencies ^(npm^)
rem ---------------------------------------------------------------
if exist "%FRONTEND%\node_modules\.bin\next.cmd" if "%REINSTALL%"=="0" (
  echo   [ok] node_modules already present - skipping install
  echo        run "run.bat --reinstall" to force a fresh install
) else (
  pushd "%FRONTEND%"
  if exist "package-lock.json" (
    echo   installing with npm ci...
    npm ci
  ) else (
    echo   installing with npm install...
    npm install
  )
  if errorlevel 1 (
    popd
    echo   [XX] npm install failed.
    goto :fail
  )
  popd
)
echo.

rem ---------------------------------------------------------------
echo  [5/5] Starting the servers
rem ---------------------------------------------------------------
call :port_busy 8080
if errorlevel 1 (
  echo   [!] port 8080 is already in use - a backend may already be running
) else (
  echo   [ok] port 8080 free
)
call :port_busy 3000
if errorlevel 1 (
  echo   [!] port 3000 is already in use - something else is on it
) else (
  echo   [ok] port 3000 free
)
echo.

echo   starting backend  http://localhost:8080
start "MOSTAQBAL Backend" /D "%BACKEND%" cmd /k go run ./cmd

echo   waiting for the API to answer...
call :wait_http "http://localhost:8080/api/players" 90
if errorlevel 1 (
  echo   [XX] the backend did not answer on http://localhost:8080
  echo        read the MOSTAQBAL Backend window for the real error
  echo        ^(most often: gcc missing for go-sqlite3, see step 2^)
  goto :fail
)
echo   [ok] backend is up
echo.

echo   starting frontend http://localhost:3000
start "MOSTAQBAL Frontend" /D "%FRONTEND%" cmd /k npm run dev

echo   waiting for Next.js to start...
call :wait_port 3000 120
if errorlevel 1 (
  echo   [!] http://localhost:3000 is not answering yet, it may still be compiling
) else (
  echo   [ok] frontend is up
)
echo.

if "%OPEN_BROWSER%"=="1" (
  timeout /t 1 /nobreak >nul
  start "" http://localhost:3000
)

echo  ============================================================
echo    Frontend : http://localhost:3000
echo    API      : http://localhost:8080/api
echo.
echo    Two windows are now open (backend + frontend).
echo    Close them, or press Ctrl+C inside them, to stop.
echo  ============================================================
echo.
exit /b 0

rem ===============================================================
rem  helpers
rem ===============================================================

:need
rem  %1 = command, %2 = human name, %3 = download page
where %1 >nul 2>&1
if not errorlevel 1 (
  echo   [ok] %2 found
  exit /b 0
)
echo   [XX] %2 ^(command: %1^) is missing or not in PATH.
echo        install it from %~3 then open a NEW terminal and retry.
exit /b 1

:port_busy
rem  %1 = port. returns 0 when the port is busy.
netstat -ano | findstr ":%1 " | findstr "LISTENING" >nul
exit /b %errorlevel%

:wait_port
rem  %1 = port, %2 = max seconds
set "PORT=%~1"
set "LEFT=%~2"
:wait_port_loop
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul
if not errorlevel 1 exit /b 0
if !LEFT! leq 0 exit /b 1
<nul set /p "=."
ping -n 2 127.0.0.1 >nul
set /a LEFT-=1
goto :wait_port_loop

:wait_http
rem  %1 = url, %2 = max seconds
set "URL=%~1"
set "LEFT=%~2"
:wait_http_loop
curl.exe -s -o NUL --max-time 2 "%URL%" >nul 2>&1
if not errorlevel 1 exit /b 0
if !LEFT! leq 0 exit /b 1
<nul set /p "=."
ping -n 2 127.0.0.1 >nul
set /a LEFT-=1
goto :wait_http_loop

:help
echo.
echo  run.bat [options]
echo.
echo    (no option)  check tools, install what is missing, start both servers
echo    --reinstall  force a fresh install of Go modules and npm packages
echo    --no-browser do not open the browser when the frontend is ready
echo.
echo  Prerequisites installed by hand:
echo    - Go 1.25+        https://go.dev/dl/
echo    - Node.js 18+     https://nodejs.org/
echo    - gcc / mingw-w64  https://jmeubank.github.io/tdm-gcc/  ^(needed by go-sqlite3^)
echo.
exit /b 0

:fail
echo.
echo  ------------------------------------------------------------
echo   STARTUP FAILED - fix the message above and run again.
echo  ------------------------------------------------------------
echo.
pause
exit /b 1