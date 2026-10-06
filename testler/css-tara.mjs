// CSS'te kullanılmayan kuralları bulur (tarayıcı gerekmez).
//
// Bir kural, seçicisinin ŞART koştuğu bir sınıf ya da kimlik sitedeki hiçbir
// HTML/JS dosyasında geçmiyorsa ölüdür. Şart koşulan = parantez dışında
// kalan (:not(.x) içindeki .x şart değil; :is()/:where() içindekiler
// seçenektir). Bir kuralın tüm seçicileri ölüyse kural ölüdür; bazı seçicileri
// ölüyse yalnızca o seçiciler raporlanır.
//
// Kodda birleştirilerek yazılan sınıflar (`eh-${tur}` gibi) DINAMIK
// listesindeki kalıplarla canlı sayılır.
import fs from 'node:fs';
import path from 'node:path';
import { KOK } from './ortak.mjs';

export const CSS_DOSYALARI = ['style.css', 'tasarim/tokenlar.css', 'tasarim/bilesenler.css'];

// Kodda parça parça kurulan sınıf adları
const DINAMIK = [
  /^eh-/,      // harita.js: `eh-${y.tur}`, `eh-${durum}`, 'eh-ok-' + k
  /^v\d$/,     // akis.js: 'sh-nokta v' + v
  /^k-\d+$/    // tasarım sisteminin 12 sütunlu ızgarası (.izgara .k-1 … .k-12)
];

function kaynakMetni() {
  const dosyalar = [];
  for (const f of fs.readdirSync(KOK)) if (/\.(html|js)$/.test(f)) dosyalar.push(f);
  for (const k of ['kavram', 'ders']) if (fs.existsSync(path.join(KOK, k))) for (const f of fs.readdirSync(path.join(KOK, k))) dosyalar.push(k + '/' + f);
  return dosyalar.map(f => fs.readFileSync(path.join(KOK, f), 'utf8')).join('\n');
}

// Basit CSS ayrıştırıcı: { secici, satir, govde, ust } listesi ve anahtar kare adları
export function cssKurallari(metin) {
  const kurallar = [], kareler = [];
  const temiz = metin.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  let i = 0;
  const satir = n => temiz.slice(0, n).split('\n').length;
  function blok(ust) {
    while (i < temiz.length) {
      const bas = i;
      // Bir sonraki { ya da } ya da ; (at-kuralları için)
      let j = i;
      while (j < temiz.length && !'{};'.includes(temiz[j])) j++;
      if (j >= temiz.length) { i = j; return; }
      const on = temiz.slice(i, j).trim();
      if (temiz[j] === '}') { i = j + 1; return; }
      if (temiz[j] === ';') { i = j + 1; continue; }
      i = j + 1;
      if (/^@(media|supports|layer|container|document)/.test(on)) { blok([...ust, on]); continue; }
      const basKonum = bas + temiz.slice(bas).search(/\S/);
      // Gövdeyi atla (iç içe kural olmayan blok)
      let derinlik = 1, k = i;
      while (k < temiz.length && derinlik) { if (temiz[k] === '{') derinlik++; else if (temiz[k] === '}') derinlik--; k++; }
      const govde = temiz.slice(i, k - 1);
      i = k;
      if (/^@keyframes/.test(on)) { kareler.push({ ad: on.split(/\s+/)[1], satir: satir(basKonum), bas: basKonum, son: k }); continue; }
      if (on.startsWith('@')) continue;
      kurallar.push({ secici: on, satir: satir(basKonum), govde, ust, bas: basKonum, son: k });
    }
  }
  blok([]);
  return { kurallar, kareler };
}

// Seçici listesini en üst düzeydeki virgüllerden böl
export function seciciler(liste) {
  const out = []; let d = 0, bas = 0;
  for (let i = 0; i < liste.length; i++) {
    const c = liste[i];
    if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') d--;
    else if (c === ',' && !d) { out.push(liste.slice(bas, i).trim()); bas = i + 1; }
  }
  out.push(liste.slice(bas).trim());
  return out;
}

// Parantez ve köşeli parantez dışındaki .sinif ve #kimlik adları
function sartlar(secici) {
  let duz = '', d = 0;
  for (const c of secici) { if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') { d--; continue; } if (!d) duz += c; }
  return [...duz.matchAll(/([.#])(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1] + m[2]);
}

export function cssTara() {
  const kaynak = kaynakMetni();
  const gecer = new Map();
  const var_ = ad => {
    if (gecer.has(ad)) return gecer.get(ad);
    const ham = ad.slice(1);
    const kacis = ham.replace(/[-]/g, '\\-');
    const sonuc = new RegExp(`(^|[^\\w-])${kacis}($|[^\\w-])`).test(kaynak) || DINAMIK.some(r => r.test(ham));
    gecer.set(ad, sonuc);
    return sonuc;
  };
  const olu = [], oluSecici = [], oluKare = [], oluDegisken = [];
  const tumCss = CSS_DOSYALARI.map(f => fs.readFileSync(path.join(KOK, f), 'utf8')).join('\n');
  for (const dosya of CSS_DOSYALARI) {
    const { kurallar, kareler } = cssKurallari(fs.readFileSync(path.join(KOK, dosya), 'utf8'));
    for (const k of kurallar) {
      const liste = seciciler(k.secici);
      const eksik = liste.map(s => sartlar(s).find(a => !var_(a)));
      if (eksik.every(Boolean)) olu.push({ dosya, satir: k.satir, bas: k.bas, son: k.son, secici: k.secici.replace(/\s+/g, ' '), neden: [...new Set(eksik)].join(' ') });
      else liste.forEach((s, n) => { if (eksik[n]) oluSecici.push({ dosya, satir: k.satir, bas: k.bas, kural: k.secici, secici: s.replace(/\s+/g, ' '), neden: eksik[n] }); });
    }
    for (const kare of kareler) {
      const kullanim = new RegExp(`animation(-name)?\\s*:[^;}]*\\b${kare.ad}\\b`);
      if (!kullanim.test(tumCss) && !new RegExp(`['"\`]${kare.ad}['"\`\\s]`).test(kaynak)) oluKare.push({ dosya, satir: kare.satir, bas: kare.bas, son: kare.son, ad: kare.ad });
    }
  }
  // Tanımlanıp hiçbir yerde okunmayan değişkenler (--ad: … ama var(--ad) yok).
  // JS'te setProperty('--ad') ya da style="--ad: …" ile verilenler de okunmuş sayılmaz;
  // yalnızca var(--ad) okumadır.
  const okunan = new Set([...(tumCss + kaynak).matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1]));
  for (const dosya of CSS_DOSYALARI) {
    const metin = fs.readFileSync(path.join(KOK, dosya), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
    const gorulen = new Set();
    for (const m of metin.matchAll(/(?:^|[\s;{])(--[\w-]+)\s*:/g)) {
      const ad = m[1];
      if (okunan.has(ad) || gorulen.has(ad)) continue;
      gorulen.add(ad);
      oluDegisken.push({ dosya, satir: metin.slice(0, m.index).split('\n').length, ad });
    }
  }
  return { olu, oluSecici, oluKare, oluDegisken };
}

// Doğrudan çalıştırılırsa rapor yazar: node testler/css-tara.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const { olu, oluSecici, oluKare, oluDegisken } = cssTara();
  for (const k of olu) console.log(`ölü kural   ${k.dosya}:${k.satir}  ${k.secici.slice(0, 110)}   [${k.neden}]`);
  for (const k of oluSecici) console.log(`ölü seçici  ${k.dosya}:${k.satir}  ${k.secici.slice(0, 110)}   [${k.neden}]`);
  for (const k of oluKare) console.log(`ölü animasyon ${k.dosya}:${k.satir}  @keyframes ${k.ad}`);
  for (const k of oluDegisken) console.log(`okunmayan değişken ${k.dosya}:${k.satir}  ${k.ad}`);
  console.log(`\n${olu.length} ölü kural, ${oluSecici.length} ölü seçici, ${oluKare.length} ölü animasyon, ${oluDegisken.length} okunmayan değişken`);
}
