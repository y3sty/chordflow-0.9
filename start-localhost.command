#!/bin/bash
# Chordflow · прототип редизайна · двойной клик = localhost + браузер
cd "$(dirname "$0")" || exit 1
open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null &
sleep 1
echo "Chordflow prototype: http://localhost:8080 (Ctrl+C to stop)"
python3 -m http.server 8080
