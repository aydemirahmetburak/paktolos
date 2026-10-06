// Çevrimdışı önbellek (sw.js) için dosya listesi ve sürüm.
//
// Liste elle tutulmaz: kökteki sayfalar, betikler, stiller, yazı tipleri ve
// simgeler buradan hesaplanır. Sürüm bu dosyaların içeriğinin özetidir; bir
// dosya değişince sürüm kendiliğinden değişir, hiçbir şey değişmezse aynı
// kalır (kullanıcının önbelleği boşuna yenilenmez).
//
// sw.js'i güncellemek için: npm run hazirla
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ls = (k, uz) => fs.readdirSync(path.join(KOK, k)).filter(f => uz.test(f)).sort().map(f => (k === '.' ? '' : k + '/') + f);

export function onbellekListesi() {
  return [
    './',
    ...ls('.', /\.html$/).filter(f => f !== '404.html'),
    ...ls('.', /\.css$/), ...ls('tasarim', /\.css$/),
    ...ls('tasarim/fontlar', /\.woff2$/),
    ...ls('.', /\.js$/).filter(f => f !== 'sw.js'),
    'manifest.webmanifest', 'icon.svg', ...ls('icons', /\.png$/)
  ];
}

export function onbellekSurumu(liste = onbellekListesi()) {
  const ozet = crypto.createHash('sha256');
  for (const d of liste) if (d !== './') { ozet.update(d + '\0'); ozet.update(fs.readFileSync(path.join(KOK, d))); }
  return 'paktolos-' + ozet.digest('hex').slice(0, 10);
}

// sw.js'teki SURUM ve DOSYALAR satırlarını yeniden yazar; değiştiyse true
export function swGuncelle() {
  const yol = path.join(KOK, 'sw.js');
  const eski = fs.readFileSync(yol, 'utf8');
  const liste = onbellekListesi();
  const satirlar = [];
  let satir = ' ';
  for (const d of liste) {
    const parca = ` '${d}',`;
    if (satir.length + parca.length > 110) { satirlar.push(satir); satir = ' '; }
    satir += parca;
  }
  satirlar.push(satir.replace(/,$/, ''));
  const yeni = eski
    .replace(/const SURUM = '[^']*';/, `const SURUM = '${onbellekSurumu(liste)}';`)
    .replace(/const DOSYALAR = \[[\s\S]*?\];/, `const DOSYALAR = [\n${satirlar.join('\n')}\n];`);
  if (yeni !== eski) fs.writeFileSync(yol, yeni);
  return yeni !== eski;
}
