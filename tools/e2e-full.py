from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess, sys, time, json
root = Path(__file__).resolve().parent.parent
shots = root / "docs" / "screenshots"
shots.mkdir(parents=True, exist_ok=True)
server = subprocess.Popen([sys.executable, "-m", "http.server", "8124", "-d", str(root)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
results = []; errs = []
def check(name, ok, extra=""):
    results.append((name, bool(ok), extra)); print(("PASS " if ok else "FAIL "), name, extra)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width":1440,"height":900}, device_scale_factor=2)
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("dialog", lambda d: d.dismiss())  # нативных диалогов больше нет; если всплывут — это баг
        pg.goto("http://localhost:8124/", wait_until="networkidle"); pg.wait_for_timeout(1500)
        check("load: no console/page errors", not errs, str(errs[:2]))
        for cid in ["Am","C","D","Am","Dm"]:
            pg.click(f'.tile[data-id="{cid}"]'); pg.wait_for_timeout(100)
        check("add chords by click", pg.eval_on_selector_all('.lane.current .block', 'e=>e.length') == 5)
        pg.click('.lane.current .block[data-index="0"] .bars .st button[data-action="bars+"]'); pg.wait_for_timeout(250)
        check("bars stepper +", pg.text_content('.lane.current .block[data-index="0"] .bars .st b').strip() == "2")
        pg.eval_on_selector('.tile[data-id="G"]', 'el => el.dispatchEvent(new Event("dragstart", {bubbles:true}))')
        pg.eval_on_selector('.lane[data-lane="chorus"] .blocks', 'el => el.dispatchEvent(new Event("drop", {bubbles:true, cancelable:true}))')
        pg.wait_for_timeout(300)
        check("drag&drop palette -> lane", pg.eval_on_selector_all('.lane[data-lane="chorus"] .block', 'e=>e.length') == 1)
        pg.click('.lane[data-lane="verse"] .lname'); pg.wait_for_timeout(300)
        before = pg.eval_on_selector_all('.lane.current .block .cn', 'e=>e.map(x=>x.textContent)')
        pg.eval_on_selector('.lane.current .block[data-index="0"]', 'el => el.dispatchEvent(new Event("dragstart", {bubbles:true}))')
        pg.eval_on_selector('.lane.current .block[data-index="2"]', 'el => el.dispatchEvent(new Event("drop", {bubbles:true, cancelable:true}))')
        pg.wait_for_timeout(300)
        after = pg.eval_on_selector_all('.lane.current .block .cn', 'e=>e.map(x=>x.textContent)')
        check("reorder blocks by drag", before != after, f"{before} -> {after}")
        pg.hover('.lane.current .block[data-index="0"]'); pg.click('.lane.current .block[data-index="0"] .bacts button[data-action="duplicate"]'); pg.wait_for_timeout(250)
        n1 = pg.eval_on_selector_all('.lane.current .block', 'e=>e.length')
        pg.hover('.lane.current .block[data-index="0"]'); pg.click('.lane.current .block[data-index="0"] .bacts button[data-action="remove"]'); pg.wait_for_timeout(250)
        n2 = pg.eval_on_selector_all('.lane.current .block', 'e=>e.length')
        check("duplicate & remove block", n1 == 6 and n2 == 5, f"{n1}/{n2}")
        pg.hover('.lane.current .block[data-index="0"]'); pg.click('.lane.current .block[data-index="0"] .bacts button[data-action="split"]'); pg.wait_for_timeout(250)
        parts = pg.eval_on_selector_all('.lane.current .block .seg-select', 'e=>e.slice(0,2).map(s=>s.value)')
        check("split strum between neighbours", parts == ["first","second"], str(parts))
        pg.select_option('.lane.current .block[data-index="0"] .seg-select', "full"); pg.wait_for_timeout(200)
        check("segment select", pg.eval_on_selector('.lane.current .block[data-index="0"] .seg-select', 'e=>e.value') == "full")
        pg.click('#duplicate-all'); pg.wait_for_timeout(300)
        check("duplicate all", pg.eval_on_selector_all('.lane.current .block', 'e=>e.length') == 10)
        pg.click('#clear-section'); pg.wait_for_selector('.cf-window'); pg.wait_for_timeout(200)
        dlg_visible = pg.is_visible('.cf-window')
        pg.click('.cf-confirm'); pg.wait_for_timeout(400)
        check("clear section via in-app confirm", dlg_visible and pg.eval_on_selector_all('.lane.current .block', 'e=>e.length') == 0)
        pg.click('#duplicate-all'); pg.wait_for_timeout(200)
        pg.click('#clear-all'); pg.wait_for_selector('.cf-window'); pg.click('.cf-cancel'); pg.wait_for_timeout(300)
        check("clear-all cancel keeps data", pg.eval_on_selector_all('.lane.current .block', 'e=>e.length') == 0 and not pg.is_visible('.cf-window'))
        pg.click('#pattern-seg button[data-pattern="shestyorka"]'); pg.wait_for_timeout(300)
        for cid in ["Am","C"]:
            pg.click(f'.tile[data-id="{cid}"]'); pg.wait_for_timeout(100)
        mute_enabled = pg.eval_on_selector('#mute-strikes', 'e=>!e.disabled')
        has_mute_arrows = pg.eval_on_selector_all('.lane.current .block .ar.mute', 'e=>e.length') > 0
        check("pattern switch: mute available + mute arrows", mute_enabled and has_mute_arrows)
        pg.click('#pattern-seg button[data-pattern="vosmyorka"]'); pg.wait_for_timeout(250)
        pg.click('#bpm-plus'); pg.wait_for_timeout(150); v1 = pg.text_content('#bpm-value').strip()
        pg.click('#bpm-minus'); pg.wait_for_timeout(150); v2 = pg.text_content('#bpm-value').strip()
        check("bpm steppers", v1 == "95" and v2 == "90", f"{v1}/{v2}")
        loop_before = pg.eval_on_selector('#loop', 'e=>e.checked')
        pg.click('.loop-pill'); pg.wait_for_timeout(150)
        loop_after = pg.eval_on_selector('#loop', 'e=>e.checked')
        pg.click('.loop-pill'); pg.wait_for_timeout(150)
        check("loop toggle flips state", loop_before != loop_after and pg.eval_on_selector('#loop', 'e=>e.checked') == loop_before, f"{loop_before}->{loop_after}")
        for cid in ["Am","C","D"]:
            pg.click(f'.tile[data-id="{cid}"]'); pg.wait_for_timeout(80)
        pg.click('#play'); pg.wait_for_timeout(2000)
        pos1 = pg.text_content('#current-position')
        playing = pg.eval_on_selector('#play', 'e=>e.classList.contains("active")')
        pg.wait_for_timeout(700)
        pos2 = pg.text_content('#current-position')
        check("play: transport + playhead advances", playing and pos1 != pos2, f"{pos1} -> {pos2}")
        pg.screenshot(path=str(shots/"e2e-playing.png"))
        pg.click('#stop'); pg.wait_for_timeout(300)
        check("stop resets position", pg.text_content('#current-position').strip() == "Готово к игре")
        pg.click('#background-play'); 
        ok_bg = False
        for _ in range(30):
            pg.wait_for_timeout(1000)
            if pg.eval_on_selector('#background-play', 'e=>e.classList.contains("active")'): ok_bg = True; break
        check("background WAV render + play", ok_bg)
        if ok_bg: pg.click('#background-play'); pg.wait_for_timeout(400)
        pg.click('#lyrics-open'); pg.wait_for_timeout(300)
        pg.fill('#lyrics-text', "\n".join(f"Строка {i} текста песни для проверки автоскролла" for i in range(60)))
        pg.click('.lyrics-controls .toggle'); pg.wait_for_timeout(1500)
        st = pg.eval_on_selector('#lyrics-text', 'e=>e.scrollTop')
        check("lyrics autoscroll", st > 0, f"scrollTop={st}")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        pg.click('#language-toggle'); pg.wait_for_timeout(500)
        cs_ok = pg.text_content('.chead h2').strip() == "Mapa písně"
        pg.click('#language-toggle'); pg.wait_for_timeout(400)
        check("language RU/CS", cs_ok)
        pg.click('#theme-toggle'); pg.wait_for_timeout(300)
        pg.reload(wait_until="networkidle"); pg.wait_for_timeout(1200)
        persisted = pg.get_attribute('html', 'data-theme') == 'paper' and pg.eval_on_selector_all('.lane.current .block', 'e=>e.length') > 0
        check("theme + song persist after reload", persisted)
        pg.screenshot(path=str(shots/"e2e-paper.png"), full_page=True)
        pg.click('#theme-toggle'); pg.wait_for_timeout(300)
        pg.click('#save-menu-toggle'); pg.wait_for_timeout(250)
        with pg.expect_download() as dl:
            pg.click('#save-song')
            pg.wait_for_selector('.cf-window input')
            pg.fill('.cf-window input', 'Тестовая мелодия')
            pg.click('.cf-confirm'); pg.wait_for_timeout(900)
        fname = dl.value.suggested_filename
        check("save .chordflow.json download", fname.endswith(".chordflow.json"), fname)
        pg.click('#save-menu-toggle'); pg.wait_for_timeout(250)  # поповер закрылся кликом по диалогу — открываем снова
        pg.fill('#cloud-code', '12'); pg.click('#cloud-save'); pg.wait_for_timeout(400)
        check("cloud validation error", "4" in pg.text_content('#cloud-status'), pg.text_content('#cloud-status'))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
        pg.screenshot(path=str(shots/"e2e-scene.png"), full_page=True)
        pg.close()
        m = b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        m.goto("http://localhost:8124/", wait_until="networkidle"); m.wait_for_timeout(1200)
        m.click('.tile[data-id="Em"]'); m.wait_for_timeout(250)
        m.click('#play'); m.wait_for_timeout(1200)
        mok = m.eval_on_selector_all('.lane.current .block', 'e=>e.length') == 1 and m.eval_on_selector('#play', 'e=>e.classList.contains("active")')
        check("mobile 390: add + play", mok)
        m.screenshot(path=str(shots/"e2e-mobile.png"), full_page=True)
        m.close(); b.close()
finally:
    server.terminate()
rep = root / "docs" / "TEST-REPORT.md"
lines = ["# Chordflow · отчёт e2e-теста прототипа", "", f"Дата: 25.09.2026 · окружение: headless Chromium (playwright), сервер localhost:8124", f"Ошибок консоли: {len(errs)}", "", "| Сценарий | Результат |", "|---|---|"]
lines += [f"| {n} | {'✅ PASS' if ok else '❌ FAIL'} {e} |" for n, ok, e in results]
lines += ["", "Скриншоты: `shots/e2e-playing.png`, `shots/e2e-paper.png`, `shots/e2e-scene.png`, `shots/e2e-mobile.png`."]
rep.write_text("\n".join(lines), encoding="utf-8")
passed = sum(1 for _, ok, _ in results if ok)
print(f"\nTOTAL {passed}/{len(results)} passed")
