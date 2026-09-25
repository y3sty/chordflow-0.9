from playwright.sync_api import sync_playwright
from pathlib import Path
import html
single = Path(__file__).resolve().parent.parent / "dist" / "chordflow-redesign.html"
content = single.read_text(encoding="utf-8")
parent = f'<!doctype html><html><body><iframe id="f" sandbox="allow-scripts" style="width:1280px;height:900px;border:0" srcdoc="{html.escape(content, quote=True)}"></iframe></body></html>'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1300,"height":950})
    pg.on("pageerror", lambda e: errs.append("parent:"+str(e)))
    pg.set_content(parent)
    pg.wait_for_timeout(2500)
    fr = pg.frames[1]
    fr.on("pageerror", lambda e: errs.append("frame:"+str(e)))
    print("frame url:", fr.url[:40])
    for cid in ["Am","C","D"]:
        fr.click(f'.tile[data-id="{cid}"]'); pg.wait_for_timeout(150)
    print("blocks:", fr.eval_on_selector_all('.lane.current .block', 'e => e.length'))
    fr.click('#play'); pg.wait_for_timeout(1600)
    print("playing:", fr.eval_on_selector('#play', 'e => e.classList.contains("active")'), "| pos:", fr.text_content('#current-position'))
    fr.click('#stop'); pg.wait_for_timeout(200)
    fr.click('#theme-toggle'); pg.wait_for_timeout(300)
    print("theme:", fr.get_attribute('html','data-theme'))
    fr.click('#theme-toggle'); pg.wait_for_timeout(200)
    fr.click('#clear-section'); pg.wait_for_timeout(400)
    dlg = fr.is_visible('.cf-window')
    if dlg: fr.click('.cf-confirm'); pg.wait_for_timeout(400)
    print("in-app confirm in sandbox:", dlg, "| blocks after clear:", fr.eval_on_selector_all('.lane.current .block', 'e=>e.length'))
    fr.click('#save-menu-toggle'); pg.wait_for_timeout(300)
    fr.click('#save-song'); pg.wait_for_timeout(400)
    prompt_dlg = fr.is_visible('.cf-window input')
    if prompt_dlg: fr.click('.cf-cancel'); pg.wait_for_timeout(200)
    print("in-app prompt in sandbox:", prompt_dlg)
    fonts = fr.evaluate("async () => { await document.fonts.ready; return { inter: document.fonts.check('800 16px Inter'), mono: document.fonts.check('600 12px \"JetBrains Mono\"'), unb: document.fonts.check('700 20px Unbounded'), golos: document.fonts.check('400 14px \"Golos Text\"') }; }")
    print("embedded fonts in sandbox:", fonts)
    pg.screenshot(path=str(Path(__file__).resolve().parent.parent / "docs" / "screenshots" / "preview-sandbox.png"))
    b.close()
print("ERRORS:", errs[:6] if errs else "none")
