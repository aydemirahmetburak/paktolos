# Tüm sayfalarda ortak üst menü, sekme çubuğu, alt bilgi ve <head> etiketleri.
# Kullanım: python3 araclar/ortak-duzen.py *.html
import re, sys
ICON = {
  'ogren': '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V19"/>',
  'araclar': '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  'sektorler': '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  'sozluk': '<path d="M3.5 18.5l4.5-13 4.5 13"/><path d="M5.2 14h5.6"/><circle cx="17" cy="15.5" r="3"/><path d="M20 12.5v6"/>',
  'test': '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.4 2.4 4.6-5"/>',
}
# Bilgisayarda üst menü (yer var, hepsi görünür)
NAV = [('ogren.html', 'Öğren'), ('analiz.html', 'Analiz'), ('sektorler.html', 'Sektörler'),
       ('araclar.html', 'Araçlar'), ('sozluk.html', 'Sözlük'), ('test.html', 'Test')]
# Telefonda alt sekme çubuğu (en fazla 5)
TABS = [('ogren.html', 'Öğren', 'ogren'), ('araclar.html', 'Araçlar', 'araclar'), ('sektorler.html', 'Sektörler', 'sektorler'),
        ('sozluk.html', 'Sözlük', 'sozluk'), ('test.html', 'Test', 'test')]
# Sekme çubuğunda yeri olmayan sayfalar hangi sekmenin altında sayılır
SEKME_GRUBU = {'analiz.html': 'ogren.html'}
PAGES = [(f, t, ICON[i]) for f, t, i in TABS]

SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>'

def header(current):
    cur = lambda f: ' aria-current="page"' if f == current else ''
    tab = SEKME_GRUBU.get(current, current)
    tcur = lambda f: ' aria-current="page"' if f == tab else ''
    links = '\n'.join(f'          <a href="{f}"{cur(f)}>{t}</a>' for f, t in NAV)
    tabs = '\n'.join(f'    <a href="{f}"{tcur(f)}><svg viewBox="0 0 24 24" aria-hidden="true">{ICON[i]}</svg>{t}</a>' for f, t, i in TABS)
    return f'''<header class="nav-bar">
    <div class="container nav-inner">
      <a href="index.html" class="logo">PAKTOLOS</a>
      <div class="nav-end">
        <nav class="nav" aria-label="Ana menü">
{links}
        </nav>
        <button type="button" class="search-trigger" aria-label="Sitede ara">{SEARCH_ICON}</button>
      </div>
    </div>
  </header>

  <nav class="tabbar" aria-label="Sekmeler">
{tabs}
  </nav>'''

FOOTER = '''<footer>
    <div class="container footer-inner">
      <div class="footer-top">
        <nav class="footer-links" aria-label="Alt menü">
          <a class="story-link" href="hikaye.html">Paktolos'un hikâyesi</a>
''' + '\n'.join(f'          <a href="{f}">{t}</a>' for f, t in NAV) + '''
        </nav>
        <div class="segmented theme-switch" role="radiogroup" aria-label="Görünüm">
          <button type="button" role="radio" data-tema="auto">Otomatik</button>
          <button type="button" role="radio" data-tema="light">Açık</button>
          <button type="button" role="radio" data-tema="dark">Koyu</button>
        </div>
      </div>
      <p>Paktolos yalnızca eğitim amaçlıdır. Bu sitedeki hiçbir içerik yatırım tavsiyesi değildir; örneklerdeki şirket ve rakamlar hayalidir.</p>
      <p>© 2026 Paktolos</p>
    </div>
  </footer>'''

HEAD_EXTRA = '''<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Paktolos">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<script src="tema.js"></script>'''

for path in sys.argv[1:]:
    s = open(path).read()
    s = re.sub(r'<header class="nav-bar">.*?</header>(\s*<nav class="tabbar".*?</nav>)?', lambda m: header(path), s, count=1, flags=re.S)
    s = re.sub(r'<footer>.*?</footer>', lambda m: FOOTER, s, count=1, flags=re.S)
    # <head>: önce eski eklemeleri temizle, sonra tek blok olarak yaz
    s = re.sub(r'<meta name="viewport"[^>]*>\n', '', s)
    for pat in [r'<meta name="theme-color"[^>]*>\n', r'<meta name="apple-mobile-web-app-[^>]*>\n', r'<meta name="mobile-web-app-capable"[^>]*>\n',
                r'<link rel="manifest"[^>]*>\n', r'<link rel="icon"[^>]*>\n', r'<link rel="apple-touch-icon"[^>]*>\n', r'<script src="tema.js"></script>\n']:
        s = re.sub(pat, '', s)
    s = s.replace('<meta charset="UTF-8">\n', '<meta charset="UTF-8">\n' + HEAD_EXTRA + '\n', 1)
    open(path, 'w').write(s)
    print(path, 'ok')
