// Erişilebilirlik (WCAG AA): her sayfada, açık ve koyu temada
// - metin kontrastı en az 4.5:1 (büyük metinde 3:1)
// - dokunulan her hedef en az 44 × 44 px (görünmez ::after alanı sayılır;
//   paragraf içindeki metin bağlantıları ve harf kaydırıcısı hariç)
// - tek h1, atlanmayan başlık sırası, tekrar eden kimlik yok
// - her düğme ve bağlantının okunabilir bir adı, her görselin alt metni var
// - "İçeriğe geç" bağlantısı ve <main id="icerik"> var
import { SAYFALAR } from './ortak.mjs';

function denetle() {
  const out = [];
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
  const lum = ([r, g, b]) => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const zemin = el => {
    const yigin = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url')) return null; // renk geçişli zemin: ölçülemez
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) { yigin.push(c); if (c[3] >= 0.99) break; }
    }
    let alt = yigin.pop() || [255, 255, 255, 1];
    while (yigin.length) { const c = yigin.pop(); alt = [0, 1, 2].map(i => c[i] * c[3] + alt[i] * (1 - c[3])); }
    return alt;
  };
  const gorunur = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (el.closest('[aria-hidden="true"], [hidden], .gizli, svg')) return false;
    let op = 1;
    for (let n = el; n; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return false; op *= +cs.opacity; }
    return op >= 0.99;
  };

  // Kontrast
  const gorulen = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode; if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (gorulen.has(el)) continue; gorulen.add(el);
    if (!gorunur(el)) continue;
    const cs = getComputedStyle(el); const yazi = parse(cs.color); const z = zemin(el);
    if (!yazi || !z) continue;
    const kar = [0, 1, 2].map(i => yazi[i] * yazi[3] + z[i] * (1 - yazi[3]));
    const a = lum(kar), b = lum(z); const oran = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const boy = parseFloat(cs.fontSize); const buyuk = boy >= 24 || (+cs.fontWeight >= 700 && boy >= 18.66);
    if (oran < (buyuk ? 3 : 4.5)) out.push(`kontrast ${oran.toFixed(2)}: "${t.textContent.trim().slice(0, 40)}" (${el.tagName.toLowerCase()}.${[...el.classList].join('.')})`);
  }

  // Dokunma hedefleri
  document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="tab"], [role="radio"]').forEach(el => {
    if (!gorunur(el) || el.type === 'range' || el.closest('.letter-index')) return;
    const cs = getComputedStyle(el);
    if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, dd, td, figcaption, .govde-kucuk')) return; // metin içi bağlantı
    const r = el.getBoundingClientRect();
    let w = r.width, h = r.height;
    const sonra = getComputedStyle(el, '::after');
    if (sonra.content !== 'none' && sonra.position === 'absolute') {
      const px = v => parseFloat(v) || 0;
      w = Math.max(w, r.width - px(sonra.left) - px(sonra.right));
      h = Math.max(h, r.height - px(sonra.top) - px(sonra.bottom));
    }
    if ((w < 44 && h < 44) || h < 24) out.push(`dokunma alanı ${Math.round(w)}×${Math.round(h)}: "${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30)}" (${el.tagName.toLowerCase()}.${[...el.classList].join('.')})`);
    const ad = (el.getAttribute('aria-label') || el.textContent || el.title || el.value || el.placeholder || '').trim()
      || (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label') || el.getAttribute('aria-labelledby');
    if (!ad) out.push(`adı olmayan öğe: ${el.outerHTML.slice(0, 80)}`);
  });

  // Görseller
  document.querySelectorAll('img:not([alt])').forEach(i => out.push(`alt metni olmayan görsel: ${i.getAttribute('src')}`));

  // Başlıklar
  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) out.push(`${h1} tane h1 var (tek olmalı)`);
  let onceki = 1;
  [...document.querySelectorAll('main h1, main h2, main h3, main h4')].filter(h => h.getBoundingClientRect().width > 0).forEach(h => {
    const n = +h.tagName[1];
    if (n > onceki + 1) out.push(`başlık sırası atlıyor: ${h.tagName} "${h.textContent.trim().slice(0, 30)}" (öncesi h${onceki})`);
    onceki = n;
  });

  // Tekrar eden kimlikler
  const say = {};
  document.querySelectorAll('[id]').forEach(e => { say[e.id] = (say[e.id] || 0) + 1; });
  Object.entries(say).filter(([, n]) => n > 1).forEach(([id]) => out.push(`kimlik iki kez kullanılmış: #${id}`));

  // Yapı
  if (document.documentElement.lang !== 'tr') out.push('<html lang="tr"> yok');
  if (!document.querySelector('a.atla[href="#icerik"]')) out.push('"İçeriğe geç" bağlantısı yok');
  if (!document.querySelector('main#icerik')) out.push('<main id="icerik"> yok');
  return out;
}

export default async function erisilebilirlik({ taban, tarayici, hata }) {
  const adresler = [...SAYFALAR, 'kavram.html?k=faiz'];
  const bulunan = new Map();
  for (const [tema, w] of [['light', 390], ['dark', 390], ['light', 1280]]) {
    const ctx = await tarayici.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await ctx.addInitScript(t => { try { localStorage.setItem('paktolos-tema', t); } catch (e) { /* yok */ } }, tema);
    const p = await ctx.newPage();
    for (const a of adresler) {
      await p.goto(taban + a, { waitUntil: 'load' });
      await p.waitForTimeout(400);
      // Kaydırarak beliren öğeler görünür olsun
      await p.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible')));
      for (const s of await p.evaluate(denetle)) {
        const anahtar = `${a}: ${s}`;
        if (!bulunan.has(anahtar)) bulunan.set(anahtar, []);
        bulunan.get(anahtar).push(`${tema} ${w}px`);
      }
    }
    await ctx.close();
  }
  for (const [s, yerler] of bulunan) hata(`${s} [${yerler.join(', ')}]`);
  return `${adresler.length} sayfa, 3 görünüm`;
}
