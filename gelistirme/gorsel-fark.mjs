// Görsel karşılaştırma: CSS'te bir şey değiştirirken sitenin görünüşü bozuldu mu?
//
//   npm run gorsel -- kaydet       şimdiki görünüşü temel olarak kaydet
//   npm run gorsel -- karsilastir  şimdiki görünüşü temelle karşılaştır
//
// Her sayfa açık/koyu temada, telefon ve masaüstü genişliğinde baştan sona
// fotoğraflanır; ayrıca arama paleti ve ders oynatıcı gibi birkaç durum.
// Saat sabitlenir ve hareket kapatılır; aynı kod her seferinde aynı resmi verir.
// Fark varsa farklı pikseller kırmızıyla işaretlenmiş resim
// testler/cikti/gorsel/fark/ altına yazılır.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { KOK, SAYFALAR, sunucuBaslat } from '../testler/ortak.mjs';

const KLASOR = path.join(KOK, 'testler/cikti/gorsel');
const kip = process.argv[2];
if (!['kaydet', 'karsilastir'].includes(kip)) { console.log('Kullanım: npm run gorsel -- kaydet | karsilastir [sayfa…]'); process.exit(1); }
const suzgec = process.argv.slice(3);

const ADRESLER = [...SAYFALAR, 'kavram/faiz.html', 'kavram/bilesik-getiri.html', 'ders/sektor.html', '404.html'];
const GORUNUMLER = [['light', 390], ['dark', 390], ['light', 1280], ['dark', 1280]];
// Etkileşimle açılan durumlar: [ad, sayfa, yapılacak]
const DURUMLAR = [
  ['arama', 'index.html', async p => { await p.click('.search-trigger'); await p.fill('dialog.spotlight[open] input', 'faiz'); await p.waitForSelector('.spot-item'); }],
  ['ders', 'dersler.html#faiz', async p => { await p.waitForTimeout(400); }],
  ['test', 'test.html', async p => { await p.locator('#quiz-stage button').first().click(); await p.waitForTimeout(200); }]
];

const temel = path.join(KLASOR, 'temel'), simdi = path.join(KLASOR, 'simdi'), fark = path.join(KLASOR, 'fark');
const hedef = kip === 'kaydet' ? temel : simdi;
fs.rmSync(hedef, { recursive: true, force: true });
if (kip === 'karsilastir') fs.rmSync(fark, { recursive: true, force: true });
fs.mkdirSync(hedef, { recursive: true });

const sunucu = await sunucuBaslat();
const tarayici = await chromium.launch();

async function hazirla(p) {
  await p.evaluate(async () => {
    document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'));
    // Türkçe harf alt kümeleri (ğ, ş, İ) ayrı dosyada ve geç yüklenir: hepsini bekle
    await Promise.all([...document.fonts].map(f => f.load().catch(() => {})));
    await document.fonts.ready;
  });
  await p.waitForTimeout(150);
}

const cekilen = [];
for (const [tema, w] of GORUNUMLER) {
  const ctx = await tarayici.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block', deviceScaleFactor: 1 });
  await ctx.addInitScript(t => { try { localStorage.setItem('paktolos-tema', t); } catch (e) { /* yok */ } }, tema);
  // Yazı tipleri sitede 'optional'/'swap': yüklenme hızına göre bazen yedek
  // yazı tipi kalır. Fotoğrafta her zaman asıl yazı tipi görünsün diye 'block'.
  await ctx.route('**/tasarim/tokenlar.css', async r => {
    const y = await r.fetch();
    await r.fulfill({ response: y, body: (await y.text()).replace(/font-display: (optional|swap)/g, 'font-display: block') });
  });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date('2026-03-15T10:00:00'));
  const cek = async (ad, adres, eylem) => {
    if (suzgec.length && !suzgec.some(s => ad.includes(s))) return;
    await p.goto(sunucu.taban + adres, { waitUntil: 'load' });
    await p.waitForTimeout(250);
    if (eylem) await eylem(p);
    await hazirla(p);
    const dosya = `${ad.replace(/[/#]/g, '_')}-${tema}-${w}.png`;
    await p.screenshot({ path: path.join(hedef, dosya), fullPage: !eylem, animations: 'disabled', caret: 'hide' });
    cekilen.push(dosya);
  };
  for (const a of ADRESLER) await cek(a, a);
  for (const [ad, a, eylem] of DURUMLAR) await cek('durum-' + ad, a, eylem);
  await ctx.close();
}
console.log(`${cekilen.length} görüntü → ${path.relative(KOK, hedef)}`);

if (kip === 'karsilastir') {
  // Pikselleri tarayıcının kendisinde karşılaştır (ek bağımlılık gerekmez)
  const p = await tarayici.newPage();
  const farklar = [];
  for (const dosya of cekilen) {
    const a = path.join(temel, dosya);
    if (!fs.existsSync(a)) { farklar.push(`${dosya}: temelde yok`); continue; }
    const s = fs.readFileSync(path.join(simdi, dosya));
    const t = fs.readFileSync(a);
    if (s.equals(t)) continue;
    const sonuc = await p.evaluate(async ([t64, s64]) => {
      const yukle = async b => { const i = new Image(); i.src = 'data:image/png;base64,' + b; await i.decode(); return i; };
      const [ti, si] = await Promise.all([yukle(t64), yukle(s64)]);
      const w = Math.max(ti.width, si.width), h = Math.max(ti.height, si.height);
      const veri = img => { const c = new OffscreenCanvas(w, h); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h); };
      const A = veri(ti), B = veri(si);
      const c = new OffscreenCanvas(w, h); const x = c.getContext('2d'); x.drawImage(si, 0, 0); x.globalAlpha = 0.25; x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      const out = x.getImageData(0, 0, w, h);
      let say = 0, ilkY = -1;
      for (let i = 0; i < A.data.length; i += 4) {
        const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
        if (d > 24) { say++; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 255; if (ilkY < 0) ilkY = Math.floor(i / 4 / w); }
      }
      x.putImageData(out, 0, 0);
      const blob = await c.convertToBlob();
      const b64 = await new Promise(coz => { const r = new FileReader(); r.onload = () => coz(r.result.split(',')[1]); r.readAsDataURL(blob); });
      return { say, ilkY, boy: [ti.width, ti.height, si.width, si.height], b64: say ? b64 : '' };
    }, [t.toString('base64'), s.toString('base64')]);
    if (!sonuc.say && sonuc.boy[1] === sonuc.boy[3]) continue;
    fs.mkdirSync(fark, { recursive: true });
    if (sonuc.b64) fs.writeFileSync(path.join(fark, dosya), Buffer.from(sonuc.b64, 'base64'));
    const boy = sonuc.boy[1] !== sonuc.boy[3] ? ` · yükseklik ${sonuc.boy[1]} → ${sonuc.boy[3]}` : '';
    farklar.push(`${dosya}: ${sonuc.say} piksel farklı (ilk y=${sonuc.ilkY})${boy}`);
  }
  await p.close();
  console.log(farklar.length ? `✗ ${farklar.length} görüntüde fark:\n  · ${farklar.join('\n  · ')}` : '✓ Görünüş aynı.');
  process.exitCode = farklar.length ? 1 : 0;
}

await tarayici.close();
sunucu.kapat();
