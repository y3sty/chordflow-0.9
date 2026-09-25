#!/usr/bin/env bash
# Пуш Chordflow 0.9 на GitHub. Использование: ./push-github.sh <TOKEN> [REPO] [USER]
# Токен: fine-grained PAT, доступ Contents: Read and write, только на целевой репозиторий.
set -e
TOKEN="$1"
REPO="${2:-chordflow-0.9}"
USER="${3:-y3sty}"
if [ -z "$TOKEN" ]; then echo "Нужен токен: ./push-github.sh ghp_..."; exit 1; fi
cd "$(dirname "$0")"

# репозиторий должен существовать на GitHub (создаётся пустым, без README)
if ! curl -sf -o /dev/null "https://api.github.com/repos/$USER/$REPO"; then
  echo "Создаю репозиторий $USER/$REPO через API..."
  curl -sf -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos -d "{\"name\":\"$REPO\",\"public\":true,\"description\":\"Chordflow 0.9 — редизайн-конструктор аккордов и боя: карта песни, две темы, Web Audio\"}" > /dev/null
fi

git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${TOKEN}@github.com/${USER}/${REPO}.git"
git branch -M main
git push -u origin main
# не оставляем токен в конфиге
git remote set-url origin "https://github.com/${USER}/${REPO}.git"
echo ""
echo "Готово: https://github.com/${USER}/${REPO}"
echo "Pages: Settings → Pages → branch main, / (root) → https://${USER}.github.io/${REPO}/"
echo "ОТОЗВИТЕ ТОКЕН ПОСЛЕ ПУША: Settings → Developer settings → Tokens → Revoke"
