// Testlerin ortak araçları: küçük bir statik sunucu, sayfa listesi ve
// veri dosyalarını tarayıcı olmadan okumak için bir yardımcı.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Kökteki tüm HTML sayfaları (ör. 'index.html')
export const SAYFALAR = fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();

const TURLER = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

// GitHub Pages'e benzer statik sunucu; boş bir port seçer
export function sunucuBaslat() {
  const sunucu = http.createServer((istek, yanit) => {
    let yol = decodeURIComponent(new URL(istek.url, 'http://x').pathname);
    if (yol.endsWith('/')) yol += 'index.html';
    const dosya = path.join(KOK, yol);
    if (!dosya.startsWith(KOK) || !fs.existsSync(dosya) || fs.statSync(dosya).isDirectory()) {
      yanit.writeHead(404, { 'Content-Type': 'text/plain' }); yanit.end('bulunamadı'); return;
    }
    yanit.writeHead(200, { 'Content-Type': TURLER[path.extname(dosya)] || 'application/octet-stream' });
    fs.createReadStream(dosya).pipe(yanit);
  });
  return new Promise(coz => sunucu.listen(0, '127.0.0.1', () => coz({ taban: `http://127.0.0.1:${sunucu.address().port}/`, kapat: () => sunucu.close() })));
}

// Sitedeki veri dosyalarını tarayıcıdaki gibi aynı ortamda çalıştırıp
// içlerindeki sabitleri döndürür: veriYukle(['sozluk-veri.js'], ['SOZLUK'])
export function veriYukle(dosyalar, adlar) {
  const ortam = vm.createContext({ console });
  for (const d of dosyalar) vm.runInContext(fs.readFileSync(path.join(KOK, d), 'utf8'), ortam, { filename: d });
  return vm.runInContext(`({ ${adlar.join(', ')} })`, ortam);
}

export const oku = d => fs.readFileSync(path.join(KOK, d), 'utf8');
export const varMi = d => fs.existsSync(path.join(KOK, d));
