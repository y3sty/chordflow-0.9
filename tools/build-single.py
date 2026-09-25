import re, pathlib
proto = pathlib.Path(__file__).resolve().parent.parent
order = ["chords-data.js","patterns-data.js","audio-engine.js","sequencer.js","ui.js","app.js"]
parts = []
for name in order:
    src = (proto/name).read_text(encoding="utf-8")
    lines = []
    for ln in src.split("\n"):
        if re.match(r'^\s*import\s', ln): continue
        if re.match(r'^\s*export\s*\{.*\}\s*;\s*$', ln): continue
        ln = re.sub(r'^export\s+', '', ln)
        lines.append(ln)
    parts.append("\n".join(lines))
bundle = "\n".join(parts)
assert "</script" not in bundle.lower(), "script close tag in bundle"
css = (proto/"styles.css").read_text(encoding="utf-8")
assert "</style" not in css.lower()
html = (proto/"index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="styles\.css[^"]*">', lambda m: "<style>\n"+css+"\n</style>", html)
fonts = (pathlib.Path(__file__).resolve().parent / "fonts-embedded.css").read_text(encoding="utf-8")
html = re.sub(r'<link[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*', '', html)
html = html.replace("</head>", "<style>\n"+fonts+"\n</style>\n</head>")
html = re.sub(r'<script type="module" src="app\.js[^"]*"></script>', lambda m: "<script type=\"module\">\n"+bundle+"\n</script>", html)
out = proto / "dist" / "chordflow-redesign.html"; out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding="utf-8")
(proto/"bundle-check.js").write_text(bundle, encoding="utf-8")
print("single file:", out, out.stat().st_size, "bytes")
