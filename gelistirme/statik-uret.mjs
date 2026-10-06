// Statik sayfa üretici: npm run uret
//
// Arama motorları ve paylaşım önizlemeleri (WhatsApp, X, LinkedIn…) JavaScript
// çalıştırmadan sayfayı okur. Bu betik, içeriği önceden yazılmış sayfalar üretir:
//
//   kavram/<id>.html   67 kavram; içerik, sitenin kendi kavram.js'i tarayıcıda
//                      çalıştırılarak alınır (aynı kod, iki ayrı kopya yok)
//   ders/<id>.html     her dersin okunabilir özeti; "Derse başla" oynatıcıyı açar
//   paylas/*.jpg       her sayfa için 1200×630 paylaşım görseli
//   sitemap.xml        tüm sayfaların listesi (Search Console'a gönderilir)
//   404.html           bulunamayan adresler için sayfa
//
// Veri (sozluk-veri.js, kavramlar-veri.js, dersler-veri.js) ya da kavram.js
// değiştiğinde yeniden çalıştır. Testler, üretilen sayfaların güncel olduğunu
// denetler.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { KOK, SAYFALAR, sunucuBaslat, veriYukle, oku } from '../testler/ortak.mjs';

const SITE = 'https://aydemirahmetburak.github.io/paktolos/';
const KAPSAM = process.argv.slice(2); // ör. "gorsel" ya da "sayfa"; boşsa hepsi

const V = veriYukle(['sozluk-veri.js', 'kavramlar-veri.js', 'dersler-veri.js'],
  ['SOZLUK', 'KATEGORILER', 'KAVRAM_DERIN', 'DERSLER', 'DERS_YOLLARI']);

const esc = m => String(m).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const yaz = (yol, icerik) => { fs.mkdirSync(path.dirname(path.join(KOK, yol)), { recursive: true }); fs.writeFileSync(path.join(KOK, yol), icerik); };

// ---------- Kabuk: kavram.html'in menü, alt bilgi ve <head>'i ----------
// Alt klasördeki sayfalar <base href="../"> ile kök göreli adresleri kullanır;
// böylece menü, stiller ve betikler hiç değişmeden çalışır.
const KABUK = oku('kavram.html');

function sayfa({ yol, baslik, aciklama, gorsel, govde, betikler, jsonld, base = '../', tur = 'article' }) {
  let s = KABUK;
  s = s.replace('<meta charset="UTF-8">\n', `<meta charset="UTF-8">\n<base href="${base}">\n`);
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(baslik)}</title>`);
  s = s.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(aciklama)}">`);
  const adres = SITE + yol;
  s = s.replace(/<!-- paylasim -->[\s\S]*?<!-- \/paylasim -->\n/, [
    '<!-- paylasim -->',
    yol === '404.html' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${adres}">`,
    `<meta property="og:type" content="${tur}">`,
    '<meta property="og:site_name" content="Paktolos">',
    '<meta property="og:locale" content="tr_TR">',
    `<meta property="og:title" content="${esc(baslik)}">`,
    `<meta property="og:description" content="${esc(aciklama)}">`,
    `<meta property="og:url" content="${adres}">`,
    `<meta property="og:image" content="${SITE}paylas/${gorsel}.jpg">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<!-- /paylasim -->', ''
  ].join('\n'));
  if (jsonld) s = s.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n</head>`);
  // "İçeriğe geç": <base> varken "#icerik" kök sayfaya gider; sayfanın kendi yolunu yaz
  s = s.replace('<a class="atla" href="#icerik">', `<a class="atla" href="${yol}#icerik">`);
  s = s.replace(/<main id="icerik" tabindex="-1">[\s\S]*?<\/main>/, `<main id="icerik" tabindex="-1">\n${govde}\n  </main>`);
  s = s.replace(/(\n  <script src="[^"]+"><\/script>)+\n/, '\n' + betikler.map(b => `  <script src="${b}"></script>`).join('\n') + '\n');
  return s;
}

const KAVRAM_BETIKLERI = ['sozluk-veri.js', 'kavramlar-veri.js', 'ekonomi-veri.js', 'script.js', 'grafik.js', 'araclar.js', 'kavram.js', 'ekonomi.js'];

// ---------- Ders sayfası: veriden okunabilir özet ----------
const HARF = ['A', 'B', 'C', 'D'];
function dersGovdesi(d) {
  const yol = V.DERS_YOLLARI.find(y => y.id === d.yol);
  const sira = V.DERSLER.indexOf(d);
  const onceki = V.DERSLER[sira - 1], sonraki = V.DERSLER[sira + 1];
  const kavramAd = new Map(V.SOZLUK.map(t => [t.id, t.terim]));
  const kartlar = d.kartlar.map(k => {
    if (k.tur === 'metin') return `      <section class="kv-bolum"><h2>${esc(k.baslik)}</h2><p>${esc(k.metin)}</p></section>`;
    if (k.tur === 'ornek') return `      <aside class="card ders-ornek"><span class="overline">Örnek</span><h3>${esc(k.baslik)}</h3><p>${esc(k.metin)}</p></aside>`;
    if (k.tur === 'soru') return `      <details class="deep-dive ders-soru"><summary>Kendini dene: ${esc(k.soru)}</summary><div>
        <ol class="ders-secenek">${k.secenekler.map((x, j) => `<li${j === k.dogru ? ' class="dogru"' : ''}><span>${HARF[j]}</span> ${esc(x)}</li>`).join('')}</ol>
        <p><strong>Doğru cevap: ${HARF[k.dogru]}.</strong> ${esc(k.aciklama)}</p></div></details>`;
    if (k.tur === 'ozet') return `      <div class="key-takeaway"><span class="overline">Akılda kalsın</span><ul>${k.maddeler.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>`;
    return '';
  }).join('\n');
  const baglar = [
    ...(d.bag.kavramlar || []).filter(id => kavramAd.has(id)).map(id => `<a class="tag" href="kavram/${id}.html">${esc(kavramAd.get(id))}</a>`),
    d.bag.arac ? `<a class="tag" href="${esc(d.bag.arac.href)}">${esc(d.bag.arac.ad)} ›</a>` : '',
    d.bag.ders ? `<a class="tag" href="${esc(d.bag.ders.href)}">${esc(d.bag.ders.ad)} ›</a>` : ''
  ].filter(Boolean).join('');
  const soruSayisi = d.kartlar.filter(k => k.tur === 'soru').length;
  return `    <article class="okuma-genislik kavram ders-sayfa" id="ders">
      <nav class="breadcrumbs" aria-label="Konum"><ol><li><a href="dersler.html">Öğren</a></li><li><a href="dersler.html">Dersler</a></li><li aria-current="page">${esc(yol.ad)}</li></ol></nav>
      <header class="kv-bas">
        <span class="overline">${esc(yol.ad)} · ${d.sure} dk · ${d.kartlar.length} kart, ${soruSayisi} soru</span>
        <h1>${esc(d.baslik)}</h1>
        <p class="govde-giris">${esc(d.ozet)}</p>
        <div class="hero-eylemler"><a class="btn btn-birincil" href="dersler.html#${d.id}">Derse başla</a><a class="btn btn-sade ok-sonu" href="dersler.html">Tüm dersler</a></div>
      </header>
${kartlar}
      <div class="ilgili kv-ilgili"><h2>İlgili</h2><div class="ilgili-liste">${baglar}</div></div>
      <nav class="kv-sirali" aria-label="Diğer dersler">
        ${onceki ? `<a class="card kv-onceki" href="ders/${onceki.id}.html"><span class="overline">Önceki ders</span><strong>${esc(onceki.baslik)}</strong></a>` : '<span></span>'}
        ${sonraki ? `<a class="card kv-sonraki" href="ders/${sonraki.id}.html"><span class="overline">Sonraki ders</span><strong>${esc(sonraki.baslik)}</strong></a>` : '<span></span>'}
      </nav>
      <p class="kv-uyari govde-kucuk">Bu içerik eğitim amaçlıdır; yatırım tavsiyesi değildir. Dersi kartlar ve sorularla etkileşimli oynamak için "Derse başla".</p>
    </article>`;
}

// ---------- Paylaşım görseli ----------
function gorselHtml({ ust, baslik, aciklama }) {
  const boy = baslik.length > 34 ? 68 : baslik.length > 20 ? 84 : 104;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<link rel="stylesheet" href="tasarim/tokenlar.css"><link rel="stylesheet" href="tasarim/bilesenler.css">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #fff; }
  .kart { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 72px 88px; display: grid; grid-template-rows: auto 1fr auto; font-family: var(--font-sans); color: var(--text-primary); }
  .kart::before { content: ""; position: absolute; inset: -20% -10% -30% 30%; z-index: 0; background:
    radial-gradient(30% 36% at 60% 55%, rgba(248,170,130,.55), transparent 72%),
    radial-gradient(24% 28% at 46% 40%, rgba(252,214,170,.5), transparent 70%),
    radial-gradient(24% 30% at 74% 66%, rgba(244,184,196,.4), transparent 70%); filter: blur(40px); }
  .kart > * { position: relative; z-index: 1; }
  .marka { display: flex; align-items: center; gap: 14px; font-size: 22px; font-weight: 500; letter-spacing: .14em; }
  .marka svg { width: 34px; height: 34px; fill: #FF6B35; }
  .orta { align-self: center; }
  .ust { font-size: 26px; color: var(--text-muted); margin-bottom: 18px; }
  h1 { margin: 0; font-family: var(--font-serif); font-weight: 400; font-size: ${boy}px; line-height: 1.05; letter-spacing: -0.02em; max-width: 980px; }
  p { margin: 26px 0 0; max-width: 900px; font-size: 28px; line-height: 1.4; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .alt { font-size: 20px; color: var(--text-muted); }
</style></head><body><div class="kart">
  <div class="marka"><svg viewBox="0 0 100 100"><path fill-rule="evenodd" d="M50 8C75 7 93 26 92 50C93 75 74 93 50 92C25 93 7 74 8 50C7 25 26 9 50 8ZM31 30H45A4 4 0 0 1 49 34V66A4 4 0 0 1 45 70H31A4 4 0 0 1 27 66V34A4 4 0 0 1 31 30ZM58 38H70A4 4 0 0 1 74 42V60A4 4 0 0 1 70 64H58A4 4 0 0 1 54 60V42A4 4 0 0 1 58 38Z"/></svg>PAKTOLOS</div>
  <div class="orta"><div class="ust">${esc(ust)}</div><h1>${esc(baslik)}</h1>${aciklama ? `<p>${esc(aciklama)}</p>` : ''}</div>
  <div class="alt">Finansal okuryazarlık · Yatırım tavsiyesi değildir</div>
</div></body></html>`;
}

// ---------- Çalıştır ----------
const sunucu = await sunucuBaslat();
const tarayici = await chromium.launch();
const ctx = await tarayici.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
const p = await ctx.newPage();
const gorseller = []; // { ad, ust, baslik, aciklama }
const haritaya = [];  // sitemap'e girecek yollar

// Kök sayfalar (Karnem kişisel, tasarım kataloğu ve eski kavram adresi hariç)
for (const s of SAYFALAR) {
  const html = oku(s);
  const baslik = html.match(/<title>([^<]*)<\/title>/)[1].replace(/ — Paktolos$/, '');
  const aciklama = html.match(/<meta name="description" content="([^"]*)"/)[1];
  gorseller.push({ ad: s.replace('.html', ''), ust: s === 'index.html' ? 'Paranın dili' : 'Paktolos', baslik: s === 'index.html' ? 'Paranın nasıl çalıştığını gerçekten anla.' : baslik, aciklama });
  if (!['karnem.html', 'tasarim.html', 'kavram.html'].includes(s)) haritaya.push(s === 'index.html' ? '' : s);
}

// Kavramlar
if (!KAPSAM.length || KAPSAM.includes('sayfa')) fs.rmSync(path.join(KOK, 'kavram'), { recursive: true, force: true });
for (const t of V.SOZLUK) {
  const yol = `kavram/${t.id}.html`;
  haritaya.push(yol);
  gorseller.push({ ad: `kavram-${t.id}`, ust: 'Kavram · ' + V.KATEGORILER[t.kategori], baslik: t.terim, aciklama: t.kisa });
  if (KAPSAM.length && !KAPSAM.includes('sayfa')) continue;
  await p.goto(sunucu.taban + 'kavram.html?k=' + t.id);
  await p.waitForSelector('#kavram h1');
  const ic = await p.$eval('#kavram', k => k.innerHTML);
  yaz(yol, sayfa({
    yol, gorsel: `kavram-${t.id}`,
    baslik: `${t.terim} nedir? — Paktolos`,
    aciklama: `${t.terim}: ${t.kisa} Basitçe, nasıl çalışır, gerçek hayattan örnek ve dikkat edilmesi gerekenler.`,
    govde: `    <article class="okuma-genislik kavram" id="kavram" data-kavram="${t.id}">${ic}</article>`,
    betikler: KAVRAM_BETIKLERI,
    jsonld: { '@context': 'https://schema.org', '@type': 'DefinedTerm', name: t.terim, description: t.kisa, inLanguage: 'tr', url: SITE + yol,
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Paktolos Finans Sözlüğü', url: SITE + 'sozluk.html' } }
  }));
}

// Dersler
if (!KAPSAM.length || KAPSAM.includes('sayfa')) fs.rmSync(path.join(KOK, 'ders'), { recursive: true, force: true });
for (const d of V.DERSLER) {
  const yol = `ders/${d.id}.html`;
  const yolAd = V.DERS_YOLLARI.find(y => y.id === d.yol).ad;
  haritaya.push(yol);
  gorseller.push({ ad: `ders-${d.id}`, ust: `Ders · ${yolAd} · ${d.sure} dk`, baslik: d.baslik, aciklama: d.ozet });
  if (KAPSAM.length && !KAPSAM.includes('sayfa')) continue;
  yaz(yol, sayfa({
    yol, gorsel: `ders-${d.id}`,
    baslik: `${d.baslik} — Paktolos Okulu`,
    aciklama: `${d.sure} dakikalık ders: ${d.ozet}`,
    govde: dersGovdesi(d),
    betikler: ['script.js'],
    jsonld: { '@context': 'https://schema.org', '@type': 'LearningResource', name: d.baslik, description: d.ozet, inLanguage: 'tr',
      timeRequired: `PT${d.sure}M`, isAccessibleForFree: true, learningResourceType: 'Ders', url: SITE + yol,
      isPartOf: { '@type': 'Course', name: 'Paktolos Okulu: ' + yolAd, url: SITE + 'dersler.html' } }
  }));
}

// 404: GitHub Pages bilinmeyen her adreste bunu gösterir; adres herhangi bir
// derinlikte olabileceği için kök mutlak verilir.
if (!KAPSAM.length || KAPSAM.includes('sayfa')) {
  yaz('404.html', sayfa({
    yol: '404.html', base: new URL(SITE).pathname, gorsel: 'index', tur: 'website',
    baslik: 'Sayfa bulunamadı — Paktolos', aciklama: 'Aradığın sayfa taşınmış ya da hiç olmamış olabilir.',
    govde: `    <section class="okuma-genislik kavram"><div class="error-state">
      <h1 class="baslik-alt">Bu sayfayı bulamadık.</h1>
      <p>Adres yanlış yazılmış ya da sayfa taşınmış olabilir. Aradığın bir kavramsa sözlükte bulabilirsin.</p>
      <div class="hero-eylemler"><a class="btn btn-birincil" href="index.html">Ana sayfa</a><a class="btn btn-ikincil" href="sozluk.html">Sözlük</a><button type="button" class="btn btn-sade" data-arama-ac>Sitede ara</button></div>
    </div></section>`,
    betikler: ['script.js']
  }));
  yaz('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${haritaya.map(y => `  <url><loc>${SITE}${y}</loc></url>`).join('\n')}\n</urlset>\n`);
}

// Paylaşım görselleri
if (!KAPSAM.length || KAPSAM.includes('gorsel')) {
  fs.rmSync(path.join(KOK, 'paylas'), { recursive: true, force: true });
  fs.mkdirSync(path.join(KOK, 'paylas'));
  const gctx = await tarayici.newContext({ viewport: { width: 1200, height: 630 } });
  // Sitede yazı tipleri 'optional'/'swap': geç yüklenirse yedek yazı tipi kalır.
  // Görsel her seferinde aynı çıksın diye burada asıl yazı tipi beklenir.
  await gctx.route('**/tasarim/tokenlar.css', async r => {
    const y = await r.fetch();
    await r.fulfill({ response: y, body: (await y.text()).replace(/font-display: (optional|swap)/g, 'font-display: block') });
  });
  const gp = await gctx.newPage();
  for (const g of gorseller) {
    await gp.goto(sunucu.taban + 'index.html');
    await gp.setContent(gorselHtml(g), { waitUntil: 'load' });
    await gp.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => {}))); await document.fonts.ready; });
    await gp.screenshot({ path: path.join(KOK, 'paylas', g.ad + '.jpg'), type: 'jpeg', quality: 82 });
  }
}

await tarayici.close();
sunucu.kapat();
console.log(`✓ ${V.SOZLUK.length} kavram, ${V.DERSLER.length} ders sayfası, ${gorseller.length} görsel, ${haritaya.length} adreslik site haritası`);
