"""Inline style.css, engine.js and app.js into the single-file 胸水鑑別診斷導航.html."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'style.css').read_text(encoding='utf-8')
eng = (root / 'engine.js').read_text(encoding='utf-8')
app = (root / 'app.js').read_text(encoding='utf-8')
head = '<link rel="stylesheet" href="style.css"><script defer src="engine.js"></script><script defer src="app.js"></script>'
assert head in html, 'asset tags changed; update build_single.py'
html = html.replace(head, '<style>\n' + css + '\n</style>')
html = html.replace('</body>', '<script>\n' + eng + '\n</script>\n<script>\n' + app + '\n</script>\n</body>')
(root / '胸水鑑別診斷導航.html').write_text(html, encoding='utf-8')
print('built', len(html), 'chars')
