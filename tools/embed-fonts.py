import urllib.request, re, base64, pathlib
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}
url="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;600&family=Unbounded:wght@700;800&family=Golos+Text:wght@400;600&display=swap"
css=urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30).read().decode()
blocks=re.findall(r'/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{.*?\})', css, re.S)
cache={}; out=[]; total=0
for sub, block in blocks:
    if sub not in ('cyrillic','latin'): continue
    u=re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
    if u not in cache:
        data=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read()
        cache[u]=base64.b64encode(data).decode(); total+=len(data)
    fam=re.search(r"font-family:\s*'([^']+)'", block).group(1)
    weight=re.search(r"font-weight:\s*(\d+)", block).group(1)
    urange=re.search(r"(unicode-range:[^;]+;)", block).group(1)
    out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{weight};font-display:swap;src:url(data:font/woff2;base64,{cache[u]}) format('woff2');{urange}}}")
css_out="/* Вшитые шрифты: Inter, JetBrains Mono, Unbounded, Golos Text (cyrillic+latin) */\n"+"\n".join(out)
(pathlib.Path(__file__).resolve().parent / "fonts-embedded.css").write_text(css_out, encoding="utf-8")
print("faces:", len(out), "| unique files:", len(cache), "| binary KB:", total//1024, "| base64 KB:", len(css_out)//1024)
