# Tüm sayfalarda ortak üst menü, sekme çubuğu, alt bilgi ve <head> etiketleri.
# Kullanım: python3 gelistirme/ortak-duzen.py *.html
import re, sys
ICON = {
  'ev': '<path d="M4.5 10.2 12 4l7.5 6.2V19a1 1 0 0 1-1 1H15v-5.5H9V20H5.5a1 1 0 0 1-1-1z"/>',
  'ekonomi': '<path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2"/><path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2"/><path d="M17.6 3.6v3.2h-3.2"/><path d="M6.4 20.4v-3.2h3.2"/><circle cx="12" cy="12" r="1.8"/>',
  'piyasa': '<path d="M4 19.5h16"/><path d="M5 15.5l4-4 3 3 6.5-7"/><path d="M14.5 7.5h4v4"/>',
  'ogren': '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V19"/>',
  'araclar': '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  'sektorler': '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  'sozluk': '<path d="M3.5 18.5l4.5-13 4.5 13"/><path d="M5.2 14h5.6"/><circle cx="17" cy="15.5" r="3"/><path d="M20 12.5v6"/>',
  'sorular': '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M10 10a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2"/><path d="M12 15h.01"/>',
  'karnem': '<path d="M12 3.5 14.5 8.6l5.6.8-4 3.9.9 5.6L12 16.2l-5 2.7.9-5.6-4-3.9 5.6-.8z"/>',
  'test': '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.4 2.4 4.6-5"/>',
}
# Bilgi mimarisi (tasarım sistemi v2): beş ana deneyim
NAV = [('dersler.html', 'Öğren'), ('ekonomi.html', 'Ekonomi'), ('piyasalar.html', 'Piyasalar'),
       ('rehberler.html', 'Rehberler'), ('araclar.html', 'Araçlar')]
# Telefonda alt sekme çubuğu (en fazla 5). Rehberler Öğren'den ve ana sayfadan açılır;
# arama ve Karnem üst çubukta her zaman bir dokunuş uzakta.
TABS = [('index.html', 'Ana sayfa', 'ev'), ('dersler.html', 'Öğren', 'ogren'), ('ekonomi.html', 'Ekonomi', 'ekonomi'),
        ('piyasalar.html', 'Piyasalar', 'piyasa'), ('araclar.html', 'Araçlar', 'araclar')]
# Menüde yeri olmayan sayfalar hangi bölümün altında sayılır
SEKME_GRUBU = {'sozluk.html': 'dersler.html', 'test.html': 'dersler.html', 'kavram.html': 'dersler.html',
               'ogren.html': 'piyasalar.html', 'analiz.html': 'piyasalar.html', 'sektorler.html': 'piyasalar.html',
               'sorular.html': 'rehberler.html', 'hikaye.html': 'rehberler.html',
               'lab.html': 'araclar.html', 'checkup.html': 'araclar.html', 'ekonomi-haritasi.html': 'ekonomi.html'}
# Alt bilgi: bölümlere göre gruplu
ALT_MENU = [
  ('Öğren', [('dersler.html', 'Dersler'), ('sozluk.html', 'Sözlük'), ('test.html', 'Kendini sına')]),
  ('Ekonomi', [('ekonomi-haritasi.html', 'Ekonomi nasıl çalışır?'), ('ekonomi.html', 'Göstergeler'), ('ekonomi.html#kavramlar', 'Temel kavramlar')]),
  ('Piyasalar', [('ogren.html', 'Mali tablolar'), ('analiz.html', 'Hisse analizi'), ('sektorler.html', 'Sektörler')]),
  ('Rehberler', [('sorular.html', 'Aklına takılan'), ('hikaye.html', 'Paktolos\'un hikâyesi')]),
  ('Araçlar', [('araclar.html', 'Hesaplayıcılar'), ('lab.html', 'Şirket laboratuvarı'), ('checkup.html', 'Finansal check-up')]),
]

# Logo: ilk Lidya sikkesinin damgalı arka yüzü (icon.svg ile aynı çizim)
LOGO_MARK = '<svg class="logo-mark" viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" d="M50 8C75 7 93 26 92 50C93 75 74 93 50 92C25 93 7 74 8 50C7 25 26 9 50 8ZM31 30H45A4 4 0 0 1 49 34V66A4 4 0 0 1 45 70H31A4 4 0 0 1 27 66V34A4 4 0 0 1 31 30ZM58 38H70A4 4 0 0 1 74 42V60A4 4 0 0 1 70 64H58A4 4 0 0 1 54 60V42A4 4 0 0 1 58 38Z"/></svg>'

SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>'
PROFIL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>'

def header(current):
    tab = SEKME_GRUBU.get(current, current)
    cur = lambda f: ' aria-current="page"' if f == tab else ''
    # Etkin sekmenin işareti: sayfa geçişinde eski sekmeden yenisine kayar
    hap = lambda f, sinif: f'<span class="{sinif}" aria-hidden="true"></span>' if f == tab else ''
    links = '\n'.join(f'          <a href="{f}"{cur(f)}>{t}{hap(f, "nav-hap")}</a>' for f, t in NAV)
    tabs = '\n'.join(f'    <a href="{f}"{cur(f)}>{hap(f, "tab-hap")}<svg viewBox="0 0 24 24" aria-hidden="true">{ICON[i]}</svg>{t}</a>' for f, t, i in TABS)
    return f'''<a class="atla" href="#icerik">İçeriğe geç</a>
  <header class="nav-bar">
    <div class="container nav-inner">
      <a href="index.html" class="logo" aria-label="Paktolos ana sayfa">{LOGO_MARK}<span>PAKTOLOS</span></a>
      <div class="nav-end">
        <nav class="nav" aria-label="Ana menü">
{links}
        </nav>
        <div class="nav-actions">
          <button type="button" class="search-trigger" aria-label="Sitede ara (⌘K)">{SEARCH_ICON}<kbd class="nav-kbd">⌘K</kbd></button>
          <a href="karnem.html" class="nav-profil" aria-label="Karnem: öğrenme ilerlemen"{' aria-current="page"' if current == 'karnem.html' else ''}>{PROFIL_ICON}</a>
          <a href="dersler.html" class="btn btn-birincil btn-kucuk nav-cta">Öğrenmeye başla</a>
        </div>
      </div>
    </div>
  </header>

  <nav class="tabbar" aria-label="Sekmeler">
{tabs}
  </nav>'''

FOOTER = '''<footer>
    <div class="container footer-inner">
      <div class="footer-top">
        <a href="index.html" class="logo footer-logo" aria-label="Paktolos ana sayfa">''' + LOGO_MARK + '''<span>PAKTOLOS</span></a>
        <nav class="footer-cols" aria-label="Alt menü">
''' + '\n'.join('          <div><h2>' + baslik + '</h2>' + ''.join(f'<a href="{f}">{t}</a>' for f, t in linkler) + '</div>' for baslik, linkler in ALT_MENU) + '''
        </nav>
      </div>
      <div class="footer-bottom">
        <p>Paktolos yalnızca eğitim amaçlıdır. Bu sitedeki hiçbir içerik yatırım tavsiyesi değildir; örneklerdeki şirket ve rakamlar hayalidir.</p>
        <div class="footer-meta">
          <span>© 2026 Paktolos</span>
          <div class="segmented theme-switch" role="radiogroup" aria-label="Görünüm">
            <button type="button" role="radio" data-tema="auto">Otomatik</button>
            <button type="button" role="radio" data-tema="light">Açık</button>
            <button type="button" role="radio" data-tema="dark">Koyu</button>
          </div>
        </div>
      </div>
    </div>
  </footer>'''

HEAD_EXTRA = '''<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F7F7F5">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Paktolos">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="preload" href="tasarim/fontlar/nr-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="tasarim/fontlar/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="tasarim/tokenlar.css">
<link rel="stylesheet" href="tasarim/bilesenler.css">
<script src="tema.js"></script>'''

for path in sys.argv[1:]:
    s = open(path).read()
    s = re.sub(r'<a class="atla"[^>]*>[^<]*</a>\s*', '', s)
    s = re.sub(r'<main(?![^>]*\bid=)', '<main id="icerik" tabindex="-1"', s, count=1)
    s = re.sub(r'<header class="nav-bar">.*?</header>(\s*<nav class="tabbar".*?</nav>)?', lambda m: header(path), s, count=1, flags=re.S)
    s = re.sub(r'<footer>.*?</footer>', lambda m: FOOTER, s, count=1, flags=re.S)
    # <head>: önce eski eklemeleri temizle, sonra tek blok olarak yaz
    s = re.sub(r'<meta name="viewport"[^>]*>\n', '', s)
    for pat in [r'<meta name="theme-color"[^>]*>\n', r'<meta name="apple-mobile-web-app-[^>]*>\n', r'<meta name="mobile-web-app-capable"[^>]*>\n',
                r'<link rel="manifest"[^>]*>\n', r'<link rel="icon"[^>]*>\n', r'<link rel="apple-touch-icon"[^>]*>\n', r'<link rel="stylesheet" href="tasarim/[^"]*">\n', r'<link rel="preload" href="tasarim/fontlar/[^"]*"[^>]*>\n', r'<script src="tema.js"></script>\n']:
        s = re.sub(pat, '', s)
    s = s.replace('<meta charset="UTF-8">\n', '<meta charset="UTF-8">\n' + HEAD_EXTRA + '\n', 1)
    open(path, 'w').write(s)
    print(path, 'ok')
