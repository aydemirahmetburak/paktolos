// Tüm sayfalar × açık/koyu tema × telefon/tablet/masaüstü:
// sayfa hatası, konsol hatası, eksik dosya (404), yatay taşma ve ekranda
// "undefined / NaN / null" gibi bozuk yazı aranır; hiçbir sayfa dışarıya
// istek yapmamalı (ölçüm aracı bağlı değilken). Ardından 67 kavram
// sayfasının her biri açılır.
import { SAYFALAR, STATIK, veriYukle } from './ortak.mjs';

const GENISLIKLER = [320, 390, 820, 1280];
const BOZUK = /\b(undefined|NaN|null|Infinity|\[object Object\])\b/;

async function sayfaDenetle(p, adres) {
  const sorunlar = [];
  await p.goto(adres, { waitUntil: 'load' });
  await p.waitForTimeout(250);
  const r = await p.evaluate(BOZUK_KAYNAK => {
    const o = [];
    const fazla = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (fazla > 1) o.push(`yatay taşma ${fazla} px`);
    const m = document.body.innerText.match(new RegExp(BOZUK_KAYNAK));
    if (m) o.push(`ekranda "${m[0]}" yazıyor`);
    return o;
  }, BOZUK.source);
  return sorunlar.concat(r);
}

export default async function tarama({ taban, tarayici, hata }) {
  let sayac = 0;
  for (const tema of ['light', 'dark']) {
    for (const w of GENISLIKLER) {
      const ctx = await tarayici.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
      await ctx.addInitScript(t => { try { localStorage.setItem('paktolos-tema', t); } catch (e) { /* yok */ } }, tema);
      const p = await ctx.newPage();
      let simdiki = '';
      p.on('pageerror', e => hata(`${simdiki} [${tema} ${w}px]: sayfa hatası: ${e.message}`));
      p.on('console', m => { if (m.type() === 'error') hata(`${simdiki} [${tema} ${w}px]: konsol: ${m.text()}`); });
      p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(taban)) hata(`${simdiki} [${tema} ${w}px]: ${r.status()} ${r.url().slice(taban.length)}`); });
      // Gizlilik: ölçüm aracı bağlı değilken hiçbir sayfa dışarıya istek yapmamalı
      p.on('request', r => { const u = r.url(); if (!u.startsWith(taban) && !u.startsWith('data:') && !u.startsWith('blob:')) hata(`${simdiki} [${tema} ${w}px]: dışarıya istek: ${u.slice(0, 80)}`); });
      for (const s of SAYFALAR) {
        simdiki = s;
        (await sayfaDenetle(p, taban + s)).forEach(x => hata(`${s} [${tema} ${w}px]: ${x}`));
        sayac++;
      }
      await ctx.close();
    }
  }

  // Üretilen statik sayfalar: 67 kavram + 12 ders (alt klasörde, <base href="../">)
  const { SOZLUK, DERSLER } = veriYukle(['sozluk-veri.js', 'dersler-veri.js'], ['SOZLUK', 'DERSLER']);
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  let simdiki = '';
  p.on('pageerror', e => hata(`${simdiki}: sayfa hatası: ${e.message}`));
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(taban)) hata(`${simdiki}: ${r.status()} ${r.url().slice(taban.length)}`); });
  for (const f of STATIK) {
    simdiki = f;
    (await sayfaDenetle(p, taban + f)).forEach(x => hata(`${f}: ${x}`));
    const beklenen = f.startsWith('kavram/') ? SOZLUK.find(t => 'kavram/' + t.id + '.html' === f)?.terim : DERSLER.find(d => 'ders/' + d.id + '.html' === f)?.baslik;
    const baslik = (await p.textContent('main h1').catch(() => null))?.trim();
    if (baslik !== beklenen) hata(`${f}: başlık "${beklenen}" olmalı, "${baslik}" görünüyor`);
    sayac++;
  }
  // Eski adres (kaydedilmiş bağlantılar için) hâlâ çalışıyor ve asıl adresi gösteriyor
  simdiki = 'kavram.html?k=faiz';
  (await sayfaDenetle(p, taban + simdiki)).forEach(x => hata(`${simdiki}: ${x}`));
  const kanonik = await p.getAttribute('link[rel="canonical"]', 'href').catch(() => null);
  if (!kanonik?.endsWith('kavram/faiz.html')) hata(`${simdiki}: asıl adres kavram/faiz.html olmalı, "${kanonik}"`);
  await ctx.close();
  return `${sayac} sayfa görünümü`;
}
