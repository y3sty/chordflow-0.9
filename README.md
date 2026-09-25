# Chordflow 0.9

Редизайн-прототип конструктора аккордов и гитарного боя [Chordflow](https://github.com/y3sty/chordflow):
та же логика и звук (Web Audio, без сервера), новый интерфейс — «карта песни» дорожками, две темы,
внутри-приложенческие диалоги, RU/CS.

Живой демо-адрес после деплоя: `https://<ваш-логин>.github.io/chordflow-0.9/` (GitHub Pages, см. ниже).

## Быстрый старт

```bash
# вариант 1: локальный сервер (нужен из-за ES-модулей)
python3 -m http.server 8080          # затем открыть http://localhost:8080
# или двойной клик по start-localhost.command / .sh / .bat — сам поднимет сервер,
# откроет браузер и напечатает адрес для телефона по Wi-Fi

# вариант 2: без сервера
открыть dist/chordflow-redesign.html   # самодостаточная single-file сборка со вшитыми шрифтами
```

## Что внутри версии 0.9

- **Карта песни**: все части (Куплет/Припев/Бридж) видны сразу дорожками; порядок песни — цветные чипы;
  клик по дорожке или чипу выбирает редактируемую часть; drag&drop аккордов и блоков.
- **Плейбар одной строкой**: Play/Stop, сегменты боёв с превью паттерна, темп цифрой + слайдер + степперы,
  цикл, фоновый WAV-рендер с выбором длительности, точки долей такта и позиция «Часть · такт N · удар M».
- **Плейхед**: кольцо на играющем блоке, стрелки боя загораются по порядку удара, дорожка автоскроллит к активному блоку.
- **Две темы**: «Сцена» (тёмная) и «Бумага» (светлая) — переключатель в топбаре, выбор запоминается;
  одна компонентная система, токены меняются через `data-theme`.
- **In-app диалоги** вместо нативных prompt/confirm — работают даже в sandbox-предпросмотрах.
- **Палитра**: 26 аккордов с аппликатурами, живой поиск, свёрнутый блок дополнительных.
- **Текст песни**: оверлей с автоскроллом (5 калиброванных скоростей) и автосохранением.
- **Сохранение**: файл `.chordflow.json`, облачный код 4–12 цифр (Google Apps Script), localStorage-сессия.
- **RU / CS** переключение всего интерфейса, включая новые строки и диалоги.
- **Адаптив** 1440 / 900 / 520 px, focus-ring, `prefers-reduced-motion`, aria-атрибуты.

## Структура

```
index.html, styles.css        разметка и дизайн-система (токены двух тем)
ui.js                          рендеры нового UI, диалоги, playhead, i18n
app.js                         состояние, обработчики, облако, фоновый рендер (логика оригинала)
audio-engine.js, sequencer.js  звук и секвенсор (без изменений)
chords-data.js, patterns-data.js  данные аккордов и боёв
dist/chordflow-redesign.html   single-file сборка (шрифты вшиты base64)
docs/                          SPEC.md (дизайн-спецификация), MANUAL-TEST.md (чек-лист),
                               TEST-REPORT.md (e2e), screenshots/
tools/                         e2e-full.py (23 сценария), test-sandbox.py (эмуляция предпросмотра),
                               test-single.py, build-single.py, embed-fonts.py, fonts-embedded.css
```

## Тестирование

```bash
python3 tools/e2e-full.py        # 23 сценария headless-Chromium, отчёт в docs/TEST-REPORT.md
python3 tools/test-sandbox.py    # iframe sandbox="allow-scripts" без same-origin, как во встроенном предпросмотре
python3 tools/test-single.py     # single-file сборка с file://
```

Ручной прогон перед релизом — `docs/MANUAL-TEST.md` (30 пунктов, колонки A/B/C).

## Пересборка single-file

```bash
python3 tools/embed-fonts.py     # один раз: скачать и закешировать woff2 (нужна сеть)
python3 tools/build-single.py    # собрать dist/chordflow-redesign.html
```

## Деплой на GitHub Pages

1. Создать репозиторий `chordflow-0.9` и запушить эту папку (инструкции ниже).
2. Settings → Pages → Source: Deploy from a branch → branch `main`, folder `/ (root)`.
3. Через минуту сайт живёт по адресу `https://<логин>.github.io/chordflow-0.9/` —
   ES-модули и Web Audio на Pages работают без дополнительных настроек.

## Push из распакованного архива

```bash
cd chordflow-0.9
git remote add origin https://github.com/<логин>/chordflow-0.9.git
git branch -M main
git push -u origin main
```

## Происхождение и лицензия

Форк-редизайн проекта [Chordflow](https://github.com/y3sty/chordflow) (© y3sty, файл лицензии в оригинале
не указан). Логика и звук унаследованы без изменений; редизайн, дизайн-система, тесты и документация —
версия 0.9. Шрифты Inter, JetBrains Mono, Unbounded, Golos Text — SIL Open Font License.
