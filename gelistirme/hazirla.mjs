// Yayından önce tek komut: npm run hazirla
//
//   1. Ortak menü, alt bilgi ve <head> etiketleri (ortak-duzen.py)
//   2. Statik kavram/ders sayfaları, paylaşım görselleri, sitemap (statik-uret.mjs)
//   3. Çevrimdışı önbellek listesi ve sürümü (sw.js)
//
// Testler bu üçünün güncel olduğunu denetler; unutulursa CI kırmızı olur.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { swGuncelle } from './onbellek.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sayfalar = fs.readdirSync(KOK).filter(f => f.endsWith('.html'));

console.log('1/3 Ortak düzen…');
execFileSync('python3', ['gelistirme/ortak-duzen.py', ...sayfalar], { cwd: KOK, stdio: 'inherit' });
console.log('2/3 Statik sayfalar…');
execFileSync(process.execPath, ['gelistirme/statik-uret.mjs', ...process.argv.slice(2)], { cwd: KOK, stdio: 'inherit' });
console.log('3/3 Önbellek…');
console.log(swGuncelle() ? '    sw.js güncellendi' : '    sw.js zaten güncel');
