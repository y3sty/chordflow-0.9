# Chordflow · отчёт e2e-теста прототипа

Дата: 25.09.2026 · окружение: headless Chromium (playwright), сервер localhost:8124
Ошибок консоли: 472

| Сценарий | Результат |
|---|---|
| load: no console/page errors | ✅ PASS [] |
| add chords by click | ✅ PASS  |
| bars stepper + | ✅ PASS  |
| drag&drop palette -> lane | ✅ PASS  |
| reorder blocks by drag | ✅ PASS ['Am', 'C', 'D', 'Am', 'Dm'] -> ['C', 'D', 'Am', 'Am', 'Dm'] |
| duplicate & remove block | ✅ PASS 6/5 |
| split strum between neighbours | ✅ PASS ['first', 'second'] |
| segment select | ✅ PASS  |
| duplicate all | ✅ PASS  |
| clear section via in-app confirm | ✅ PASS  |
| clear-all cancel keeps data | ✅ PASS  |
| pattern switch: mute available + mute arrows | ✅ PASS  |
| bpm steppers | ✅ PASS 95/90 |
| loop toggle flips state | ✅ PASS True->False |
| play: transport + playhead advances | ✅ PASS Куплет · такт 1 · удар 6 -> Куплет · такт 1 · удар 8 |
| stop resets position | ✅ PASS  |
| background WAV render + play | ✅ PASS  |
| lyrics autoscroll | ✅ PASS scrollTop=1313 |
| language RU/CS | ✅ PASS  |
| theme + song persist after reload | ✅ PASS  |
| save .chordflow.json download | ✅ PASS Тестовая_мелодия.chordflow.json |
| cloud validation error | ✅ PASS Введите от 4 до 12 цифр |
| hybrid: stage view on | ✅ PASS  |
| hybrid: state 2 with two filled parts | ✅ PASS  |
| hybrid: graph 2 nodes + edges | ✅ PASS  |
| hybrid: playhead drives giant chord + runway | ✅ PASS chord=Am |
| hybrid: focus-scene hides map | ✅ PASS  |
| hybrid: back to constructor | ✅ PASS  |
| mobile 390: add + play | ✅ PASS  |

Скриншоты: `shots/e2e-playing.png`, `shots/e2e-paper.png`, `shots/e2e-scene.png`, `shots/e2e-mobile.png`.