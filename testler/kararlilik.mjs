// Yükleme kayması (CLS): sayfa açılırken içerik yer değiştirmemeli.
// Betikle dolan alanlar boşken yer ayırır (style.css, YER AYIRMA).
// Sınır 0.05; Google'ın "iyi" eşiği 0.1.
import { SAYFALAR } from './ortak.mjs';

const SINIR = 0.05;

export default async function kararlilik({ taban, tarayici, hata }) {
  const adresler = [...SAYFALAR.filter(s => s !== 'tasarim.html'), 'kavram.html?k=faiz'];
  let enKotu = 0;
  for (const w of [390, 1280]) {
    for (const a of adresler) {
      const ctx = await tarayici.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctx.newPage();
      await p.addInitScript(() => {
        window.__cls = 0; window.__kaynak = [];
        new PerformanceObserver(l => l.getEntries().forEach(e => {
          if (e.hadRecentInput) return;
          window.__cls += e.value;
          window.__kaynak.push((e.sources || []).map(s => s.node?.className || s.node?.nodeName).join(', '));
        })).observe({ type: 'layout-shift', buffered: true });
      });
      await p.goto(taban + a, { waitUntil: 'load' });
      await p.waitForTimeout(1200);
      const { cls, kaynak } = await p.evaluate(() => ({ cls: window.__cls, kaynak: window.__kaynak }));
      enKotu = Math.max(enKotu, cls);
      if (cls > SINIR) hata(`${a} [${w}px]: yükleme kayması ${cls.toFixed(3)} (sınır ${SINIR}); kayan: ${kaynak.slice(0, 3).join(' | ')}`);
      await ctx.close();
    }
  }
  return `en yüksek kayma ${enKotu.toFixed(3)}`;
}
