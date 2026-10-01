// Veri ve bağlantı testleri (tarayıcı gerekmez)
//
// - Dersler, test ve günün sorusu: doğru cevap geçerli, kavramlar sözlükte var
// - Site içi her bağlantı var olan bir sayfaya ve bölüme gider
// - Çevrimdışı önbellek listesi (sw.js) eksiksiz
// - Menü ve alt bilgi güncel (gelistirme/ortak-duzen.py ile aynı)
// - Önbelleğe giren bir dosya değiştiyse sw.js sürümü de artırılmış
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { KOK, SAYFALAR, STATIK, veriYukle, oku, varMi } from './ortak.mjs';

export default async function veri({ hata }) {
  const V = veriYukle(
    ['sozluk-veri.js', 'dersler-veri.js', 'test-veri.js', 'sorular-veri.js', 'arama-veri.js', 'kavramlar-veri.js', 'ekonomi-veri.js'],
    ['SOZLUK', 'KATEGORILER', 'DERSLER', 'DERS_YOLLARI', 'SORULAR', 'SORULAR_KUTUPHANE', 'SORU_KATEGORILERI', 'ARAMA_DIZINI', 'KAVRAM_DERIN', 'GOSTERGELER']
  );
  const kavramlar = new Set(V.SOZLUK.map(t => t.id));
  const dersler = new Set(V.DERSLER.map(d => d.id));
  const sorular = new Set(V.SORULAR_KUTUPHANE.map(q => q.id));

  // ---------- Kimlikler tekil mi? ----------
  const tekil = (liste, ad) => {
    const gor = new Set();
    liste.forEach(x => { if (gor.has(x.id)) hata(`${ad}: "${x.id}" kimliği iki kez kullanılmış`); gor.add(x.id); });
  };
  tekil(V.SOZLUK, 'Sözlük'); tekil(V.DERSLER, 'Dersler'); tekil(V.SORULAR_KUTUPHANE, 'Soru kütüphanesi');

  // ---------- Sözlük ----------
  V.SOZLUK.forEach(t => {
    if (!V.KATEGORILER[t.kategori]) hata(`Sözlük "${t.id}": bilinmeyen kategori "${t.kategori}"`);
    for (const alan of ['terim', 'kisa', 'aciklama']) if (!t[alan]) hata(`Sözlük "${t.id}": "${alan}" boş`);
    (t.ilgili || []).forEach(id => { if (!kavramlar.has(id)) hata(`Sözlük "${t.id}": ilgili kavram "${id}" sözlükte yok`); });
  });
  Object.keys(V.KAVRAM_DERIN).forEach(id => { if (!kavramlar.has(id)) hata(`kavramlar-veri.js: "${id}" sözlükte yok`); });

  // ---------- Çoktan seçmeli sorular ----------
  const soruKontrol = (q, yer) => {
    if (!Array.isArray(q.secenekler) || q.secenekler.length < 2) return hata(`${yer}: en az iki şık olmalı`);
    if (!(Number.isInteger(q.dogru) && q.dogru >= 0 && q.dogru < q.secenekler.length)) hata(`${yer}: doğru cevap (${q.dogru}) şıklar arasında değil`);
    if (new Set(q.secenekler).size !== q.secenekler.length) hata(`${yer}: aynı şık iki kez yazılmış`);
    if (!q.aciklama) hata(`${yer}: açıklama yok`);
  };

  // ---------- Dersler ----------
  const yollar = new Set(V.DERS_YOLLARI.map(y => y.id));
  V.DERSLER.forEach(d => {
    const yer = `Ders "${d.id}"`;
    if (!yollar.has(d.yol)) hata(`${yer}: bilinmeyen yol "${d.yol}"`);
    if (!d.kartlar?.length) return hata(`${yer}: kart yok`);
    if (d.kartlar.at(-1).tur !== 'ozet') hata(`${yer}: son kart özet olmalı`);
    d.kartlar.forEach((k, i) => {
      if (!['metin', 'ornek', 'soru', 'ozet'].includes(k.tur)) hata(`${yer}, kart ${i + 1}: bilinmeyen tür "${k.tur}"`);
      if (k.tur === 'soru') soruKontrol(k, `${yer}, kart ${i + 1}`);
    });
    (d.bag?.kavramlar || []).forEach(id => { if (!kavramlar.has(id)) hata(`${yer}: bağlı kavram "${id}" sözlükte yok`); });
  });

  // ---------- Kendini sına ve soru kütüphanesi ----------
  V.SORULAR.forEach((q, i) => soruKontrol(q, `Test sorusu ${i + 1}`));
  V.SORULAR_KUTUPHANE.forEach(q => {
    if (!V.SORU_KATEGORILERI[q.kategori]) hata(`Soru "${q.id}": bilinmeyen kategori "${q.kategori}"`);
    (q.ilgili || []).forEach(id => { if (!kavramlar.has(id)) hata(`Soru "${q.id}": ilgili kavram "${id}" sözlükte yok`); });
  });

  // ---------- Site içi bağlantılar ----------
  // Sayfalardaki sabit kimlikler + betiklerin oluşturduğu bilinen kimlikler
  const kimlikler = {};
  for (const s of SAYFALAR) kimlikler[s] = new Set([...oku(s).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const dinamik = { 'sozluk.html': kavramlar, 'dersler.html': dersler, 'sorular.html': sorular };
  for (const harf of 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ') (kimlikler['sozluk.html'] ||= new Set()).add('harf-' + harf);

  const bagKontrol = (hedef, kaynak) => {
    const [yolSorgu, bolum] = hedef.split('#');
    const [dosya, sorgu] = yolSorgu.split('?');
    if (!dosya) return; // yalnızca "#bolum": aynı sayfa, aşağıda ayrıca bakılmaz
    if (dosya.startsWith('kavram/') || dosya.startsWith('ders/')) {
      if (!varMi(dosya)) hata(`${kaynak}: "${hedef}" statik sayfası yok (npm run uret)`);
      return;
    }
    if (!varMi(dosya)) return hata(`${kaynak}: "${hedef}" sayfası yok`);
    if (dosya === 'kavram.html' && sorgu) {
      const k = new URLSearchParams(sorgu).get('k');
      if (k && !kavramlar.has(k)) hata(`${kaynak}: "${hedef}" kavramı sözlükte yok`);
    }
    if (bolum && dosya.endsWith('.html') && !kimlikler[dosya]?.has(bolum) && !dinamik[dosya]?.has(bolum)) {
      hata(`${kaynak}: "${hedef}" bölümü sayfada yok`);
    }
  };
  const BAG = /["'`](?:\.\/)?((?:kavram\/|ders\/)?[a-z0-9-]+\.html(?:[?#][^"'`\s<>]*)?)["'`]/g;
  const kaynaklar = [...SAYFALAR, ...STATIK, ...fs.readdirSync(KOK).filter(f => f.endsWith('.js') && f !== 'sw.js')];
  for (const k of kaynaklar) {
    for (const m of oku(k).matchAll(BAG)) {
      if (m[1].includes('${')) continue; // şablonla kurulan adresler çalışma anında denetlenir
      bagKontrol(m[1], k);
    }
  }
  V.ARAMA_DIZINI.forEach(x => bagKontrol(x.href, `Arama dizini "${x.baslik}"`));

  // ---------- Çevrimdışı önbellek listesi ----------
  const sw = oku('sw.js');
  const liste = new Function(sw.match(/const DOSYALAR = (\[[\s\S]*?\]);/)[0] + '; return DOSYALAR;')();
  liste.filter(d => d !== './').forEach(d => { if (!varMi(d)) hata(`sw.js: önbellek listesindeki "${d}" dosyası yok`); });
  const gerekli = [
    ...SAYFALAR,
    ...fs.readdirSync(KOK).filter(f => /\.(js|css)$/.test(f) && f !== 'sw.js'),
    ...fs.readdirSync(path.join(KOK, 'tasarim')).filter(f => f.endsWith('.css')).map(f => 'tasarim/' + f),
    ...fs.readdirSync(path.join(KOK, 'tasarim/fontlar')).filter(f => f.endsWith('.woff2')).map(f => 'tasarim/fontlar/' + f)
  ];
  gerekli.forEach(d => { if (!liste.includes(d)) hata(`sw.js: "${d}" çevrimdışı önbellek listesinde yok`); });

  // ---------- Menü ve alt bilgi güncel mi? ----------
  // ortak-duzen.py geçici bir kopyada çalıştırılır; sonuç dosyalardan farklıysa
  // biri betiği çalıştırmayı unutmuştur.
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'paktolos-duzen-'));
  for (const s of SAYFALAR) fs.copyFileSync(path.join(KOK, s), path.join(gecici, s));
  try {
    execFileSync('python3', [path.join(KOK, 'gelistirme/ortak-duzen.py'), ...SAYFALAR], { cwd: gecici, stdio: 'pipe' });
    for (const s of SAYFALAR) {
      if (fs.readFileSync(path.join(gecici, s), 'utf8') !== oku(s)) hata(`${s}: menü/alt bilgi güncel değil; "python3 gelistirme/ortak-duzen.py *.html" çalıştır`);
    }
  } catch (e) {
    hata('gelistirme/ortak-duzen.py çalıştırılamadı: ' + (e.stderr?.toString() || e.message));
  } finally {
    fs.rmSync(gecici, { recursive: true, force: true });
  }

  // ---------- Önbellek sürümü artırıldı mı? (yalnızca PR'da) ----------
  // CI, TABAN_REF ortam değişkenine karşılaştırılacak dalı (ör. origin/main) yazar.
  const taban = process.env.TABAN_REF;
  if (taban) {
    try {
      const degisen = execFileSync('git', ['diff', '--name-only', `${taban}...HEAD`], { cwd: KOK }).toString().split('\n').filter(Boolean);
      const onbellekte = degisen.filter(d => liste.includes(d));
      const surumDegisti = execFileSync('git', ['diff', `${taban}...HEAD`, '--', 'sw.js'], { cwd: KOK }).toString().includes("SURUM = '");
      if (onbellekte.length && !surumDegisti) hata(`sw.js: önbellekteki dosyalar değişti (${onbellekte.slice(0, 4).join(', ')}${onbellekte.length > 4 ? '…' : ''}) ama SURUM artırılmamış`);
    } catch (e) {
      hata('Sürüm kontrolü için git karşılaştırması yapılamadı: ' + e.message);
    }
  }

  // ---------- Statik sayfalar güncel mi? (gelistirme/statik-uret.mjs) ----------
  // Veri ya da menü değişip "npm run uret" unutulursa burada yakalanır.
  const kabuk = oku('kavram.html');
  const parca = (html, ac, kapa) => { const i = html.indexOf(ac); return i < 0 ? null : html.slice(i, html.indexOf(kapa, i)); };
  const menu = parca(kabuk, '<header class="nav-bar">', '</header>');
  const altBilgi = parca(kabuk, '<footer>', '</footer>');
  const esc = m => String(m).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const beklenen = new Set([...V.SOZLUK.map(t => `kavram/${t.id}.html`), ...V.DERSLER.map(d => `ders/${d.id}.html`)]);
  STATIK.forEach(f => { if (!beklenen.has(f)) hata(`${f}: artık karşılığı olmayan statik sayfa (npm run uret)`); });
  for (const f of beklenen) {
    if (!varMi(f)) { hata(`${f} yok (npm run uret)`); continue; }
    const h = oku(f);
    if (parca(h, '<header class="nav-bar">', '</header>') !== menu || parca(h, '<footer>', '</footer>') !== altBilgi) hata(`${f}: menü/alt bilgi kavram.html ile aynı değil (npm run uret)`);
    if (!h.includes('<base href="../">')) hata(`${f}: <base href="../"> yok`);
  }
  V.SOZLUK.forEach(t => {
    const f = `kavram/${t.id}.html`; if (!varMi(f)) return;
    const h = oku(f);
    if (!h.includes(`<h1>${esc(t.terim)}</h1>`) || !h.includes(esc(t.kisa)) || !h.includes(`data-kavram="${t.id}"`)) hata(`${f}: içerik sözlükle uyuşmuyor (npm run uret)`);
  });
  V.DERSLER.forEach(d => {
    const f = `ders/${d.id}.html`; if (!varMi(f)) return;
    const h = oku(f);
    const metinler = [d.baslik, d.ozet, ...d.kartlar.flatMap(k => [k.baslik, k.metin, k.soru].filter(Boolean))];
    const eksik = metinler.find(m => !h.includes(esc(m)));
    if (eksik) hata(`${f}: "${eksik.slice(0, 40)}" sayfada yok; ders verisi değişmiş (npm run uret)`);
  });

  // Paylaşım görselleri ve asıl adresler
  for (const f of [...SAYFALAR, ...STATIK, '404.html']) {
    if (!varMi(f)) { hata(`${f} yok (npm run uret)`); continue; }
    const h = oku(f);
    const gorsel = h.match(/<meta property="og:image" content="[^"]*\/(paylas\/[^"]+)">/);
    if (!gorsel) hata(`${f}: paylaşım görseli (og:image) yok`);
    else if (!varMi(gorsel[1])) hata(`${f}: ${gorsel[1]} dosyası yok (npm run uret)`);
    if (!/<meta property="og:title" content="[^"]+">/.test(h) || !/<meta property="og:description" content="[^"]+">/.test(h)) hata(`${f}: og:title / og:description yok`);
    if (!['kavram.html', '404.html'].includes(f) && !/<link rel="canonical" href="https:\/\/[^"]+">/.test(h)) hata(`${f}: asıl adres (canonical) yok`);
  }

  // Site haritası: kök sayfalar (Karnem, katalog ve eski kavram adresi hariç) + statik sayfalar
  const harita = varMi('sitemap.xml') ? [...oku('sitemap.xml').matchAll(/<loc>[^<]*\/paktolos\/([^<]*)<\/loc>/g)].map(m => m[1] || 'index.html') : [];
  const haritaBeklenen = [...SAYFALAR.filter(f => !['karnem.html', 'tasarim.html', 'kavram.html'].includes(f)), ...beklenen];
  haritaBeklenen.forEach(f => { if (!harita.includes(f)) hata(`sitemap.xml: ${f} yok (npm run uret)`); });
  harita.forEach(f => { if (!haritaBeklenen.includes(f)) hata(`sitemap.xml: ${f} fazladan`); });

  // ---------- Ölçüm olayları katalogda mı? ----------
  // olcum.js'teki OLAYLAR listesinde olmayan bir olay gönderilmez; koddaki her
  // olc('…') çağrısı katalogda olmalı, katalogdaki her olay da kullanılmalı.
  const olcum = oku('olcum.js');
  const katalog = new Set([...olcum.match(/var OLAYLAR = \{([\s\S]*?)\n  \};/)[1].matchAll(/^\s+([a-z_]+):/gm)].map(m => m[1]));
  const kullanilan = new Set();
  for (const k of fs.readdirSync(KOK).filter(f => f.endsWith('.js'))) {
    for (const m of oku(k).matchAll(/\bolc\('([a-z_]+)'/g)) {
      kullanilan.add(m[1]);
      if (!katalog.has(m[1])) hata(`${k}: "${m[1]}" ölçüm olayı olcum.js kataloğunda yok`);
    }
  }
  katalog.forEach(o => { if (!kullanilan.has(o)) hata(`olcum.js: "${o}" olayı katalogda var ama hiçbir yerde gönderilmiyor`); });
  if (!/saglayici: null/.test(olcum) && !process.env.OLCUM_BAGLI) hata('olcum.js: bir ölçüm sağlayıcısı bağlanmış; README "Kullanıcı Verisi" bölümünü güncelleyip OLCUM_BAGLI=1 ile çalıştır');

  return `${STATIK.length} statik sayfa, ${harita.length} adreslik site haritası, ${katalog.size} ölçüm olayı, ${V.SOZLUK.length} kavram, ${V.DERSLER.length} ders, ${V.SORULAR.length + V.SORULAR_KUTUPHANE.length} soru, ${liste.length} önbellek dosyası`;
}
