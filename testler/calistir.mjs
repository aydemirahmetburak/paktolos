// Paktolos testleri
//
//   npm test                    hepsi
//   npm test -- veri tarama     yalnızca adı verilen gruplar
//
// Her grup hataları toplar; sonunda özet yazılır. Hata varsa çıkış kodu 1
// olur ve CI'daki kontrol kırmızıya döner.
import { sunucuBaslat } from './ortak.mjs';

const GRUPLAR = {
  veri: { ad: 'Veri ve bağlantılar', tarayici: false },
  tarama: { ad: 'Tüm sayfalar: hata, taşma, bozuk yazı', tarayici: true },
  erisilebilirlik: { ad: 'Erişilebilirlik: kontrast, dokunma, başlık', tarayici: true },
  akislar: { ad: 'Kullanıcı akışları', tarayici: true },
  kararlilik: { ad: 'Yükleme kayması (CLS)', tarayici: true }
};

const secilen = process.argv.slice(2).filter(a => GRUPLAR[a]);
const calisacak = secilen.length ? secilen : Object.keys(GRUPLAR);

let sunucu = null, tarayici = null;
if (calisacak.some(g => GRUPLAR[g].tarayici)) {
  const { chromium } = await import('playwright');
  sunucu = await sunucuBaslat();
  tarayici = await chromium.launch();
}

const sonuc = [];
let toplamHata = 0;
for (const g of calisacak) {
  const hatalar = [];
  const baslangic = Date.now();
  process.stdout.write(`▶ ${GRUPLAR[g].ad} … `);
  let not = '';
  try {
    const grup = (await import(`./${g}.mjs`)).default;
    not = await grup({ taban: sunucu?.taban, tarayici, hata: m => hatalar.push(m) }) || '';
  } catch (e) {
    hatalar.push('Test kendisi çöktü: ' + (e.stack || e.message));
  }
  const sure = ((Date.now() - baslangic) / 1000).toFixed(1);
  console.log(hatalar.length ? `✗ ${hatalar.length} hata (${sure} sn)` : `✓ (${sure} sn)${not ? ' · ' + not : ''}`);
  for (const h of hatalar.slice(0, 40)) console.log('   · ' + h);
  if (hatalar.length > 40) console.log(`   · …ve ${hatalar.length - 40} hata daha`);
  toplamHata += hatalar.length;
  sonuc.push([g, hatalar.length]);
}

await tarayici?.close();
sunucu?.kapat();
console.log(toplamHata ? `\n✗ Toplam ${toplamHata} hata.` : `\n✓ Tüm testler geçti (${sonuc.length} grup).`);
process.exit(toplamHata ? 1 : 0);
