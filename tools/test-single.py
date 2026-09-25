from playwright.sync_api import sync_playwright
from pathlib import Path
target = (Path(__file__).resolve().parent.parent / "dist" / "chordflow-redesign.html").as_uri()
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900}, device_scale_factor=2)
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(target); pg.wait_for_timeout(1500)
    for cid in ["Am","C","D","Am"]:
        pg.click(f'.tile[data-id="{cid}"]'); pg.wait_for_timeout(120)
    print("blocks:", pg.eval_on_selector_all('.lane.current .block', 'e => e.length'))
    pg.click('#play'); pg.wait_for_timeout(1800)
    print("playing:", pg.eval_on_selector('#play', 'e => e.classList.contains("active")'), "| pos:", pg.text_content('#current-position'))
    pg.click('#stop'); pg.wait_for_timeout(200)
    pg.click('#theme-toggle'); pg.wait_for_timeout(300)
    print("theme:", pg.get_attribute('html','data-theme'))
    pg.screenshot(path=str(Path(__file__).resolve().parent.parent / "docs" / "screenshots" / "single-paper.png"), full_page=False)
    pg.click('#theme-toggle'); pg.wait_for_timeout(200)
    pg.click('#save-menu-toggle'); pg.wait_for_timeout(250)
    print("popover:", pg.eval_on_selector('#save-menu', 'e => !e.hidden'))
    pg.keyboard.press("Escape")
    pg.click('#lyrics-open'); pg.wait_for_timeout(250)
    print("lyrics:", pg.eval_on_selector('#lyrics-overlay', 'e => !e.hidden'))
    pg.screenshot(path=str(Path(__file__).resolve().parent.parent / "docs" / "screenshots" / "single-scene.png"), full_page=False)
    b.close()
print("ERRORS:", errs[:6] if errs else "none")
