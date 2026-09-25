#!/usr/bin/env bash
# Chordflow · прототип редизайна · запуск на localhost
cd "$(dirname "$0")" || exit 1
PORT=8080
echo ""
echo "  Chordflow · прототип редизайна"
echo "  → на этом компьютере:  http://localhost:$PORT"
python3 - <<'PY' 2>/dev/null
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(("8.8.8.8", 53)); print("  → с телефона (та же Wi-Fi сеть):  http://%s:8080" % s.getsockname()[0])
except Exception:
    pass
finally:
    s.close()
PY
echo "  Ctrl+C — остановить сервер"
echo ""
python3 -m http.server "$PORT"
