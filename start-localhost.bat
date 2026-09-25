@echo off
rem Chordflow · прототип редизайна · двойной клик = localhost + браузер
cd /d "%~dp0"
start "" http://localhost:8080
echo Chordflow prototype: http://localhost:8080
python -m http.server 8080
pause
