// Tüm sayfalar × açık/koyu tema × telefon/tablet/masaüstü:
// sayfa hatası, konsol hatası, eksik dosya (404), yatay taşma ve ekranda
// "undefined / NaN / null" gibi bozuk yazı aranır. Ardından 67 kavram
// sayfasının her biri açılır.
import { SAYFALAR, veriYukle } from './ortak.mjs';

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
      for (const s of SAYFALAR) {
        simdiki = s;
        (await sayfaDenetle(p, taban + s)).forEach(x => hata(`${s} [${tema} ${w}px]: ${x}`));
        sayac++;
      }
      await ctx.close();
    }
  }

  // Kavram sayfaları: her biri ayrı bir adres
  const { SOZLUK } = veriYukle(['sozluk-veri.js'], ['SOZLUK']);
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  let simdiki = '';
  p.on('pageerror', e => hata(`${simdiki}: sayfa hatası: ${e.message}`));
  for (const t of SOZLUK) {
    simdiki = 'kavram.html?k=' + t.id;
    (await sayfaDenetle(p, taban + simdiki)).forEach(x => hata(`${simdiki}: ${x}`));
    const baslik = await p.textContent('#kavram h1').catch(() => null);
    if (baslik?.trim() !== t.terim) hata(`${simdiki}: başlık "${t.terim}" olmalı, "${baslik}" görünüyor`);
    sayac++;
  }
  await ctx.close();
  return `${sayac} sayfa görünümü`;
}
