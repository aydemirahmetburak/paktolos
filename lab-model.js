// Şirket laboratuvarı: Nehir Mobilya A.Ş. (hayali) için basitleştirilmiş
// ama muhasebe açısından tutarlı bir yıllık model.
//
// Üç tablo birbirine bağlıdır:
//   gelir tablosu → net kâr
//   net kâr + amortisman − işletme sermayesi artışı → işletme nakit akışı
//   nakit akışı → dönem sonu nakit (bilanço)
//   net kâr − temettü → özkaynak (bilanço)
// Bu yüzden her durumda Varlıklar = Yükümlülükler + Özkaynak eşitliği tutar.
//
// Basitleştirmeler: faiz, yıl sonu borç üzerinden hesaplanır; vergi oranı
// %25 alınır ve zarar durumunda vergi sıfırdır; nakit açığı yıl sonunda
// kısa vadeli krediyle kapatılır (bu kredinin faizi hesaba katılmaz);
// finansal borcun %40'ı kısa vadeli sayılır. Tüm rakamlar milyon TL.

const LAB_SABIT = {
  hasilat0: 10000,     // başlangıç yılı satışları
  smmOran0: 0.70,      // başlangıç yılı satışların maliyeti / hasılat
  alacakGun0: 60,      // başlangıçta müşterilerden tahsilat süresi
  stokGun: 90,         // stok tutma süresi (satışların maliyetine göre)
  borcGun: 45,         // tedarikçiye ödeme süresi (satışların maliyetine göre)
  nakit0: 1000,
  duran0: 5000,
  borc0: 3000,
  bakimYatirimi: 500,  // her yıl eskiyen makinelerin yenilenmesi
  amortOran: 0.10,     // duran varlıkların yıllık amortismanı
  vergi: 0.25,
  kvBorcPayi: 0.40
};

// Başlangıç ayarları: şirketin "normal" bir yılı
const LAB_BAZ = {
  hacim: 0,        // satış hacmi değişimi, %
  brut: 30,        // brüt kâr marjı, %
  gider: 10,       // faaliyet giderleri (amortisman hariç), hasılatın %'si
  tahsilat: 60,    // müşteriden tahsilat süresi, gün
  yatirim: 0,      // yeni yatırım (fabrika, makine), milyon TL
  borc: 3000,      // yıl sonu finansal borç, milyon TL
  faiz: 20,        // yıllık borç faizi, %
  temettu: 30,     // net kârın dağıtılan oranı, %
  piyasa: 5400     // piyasa değeri, milyon TL
};

// Dönem başı bilanço (sabit)
const LAB_BASLANGIC = (() => {
  const K = LAB_SABIT;
  const smm0 = K.hasilat0 * K.smmOran0;
  const alacak = K.hasilat0 * K.alacakGun0 / 365;
  const stok = smm0 * K.stokGun / 365;
  const ticariBorc = smm0 * K.borcGun / 365;
  const ozkaynak = K.nakit0 + alacak + stok + K.duran0 - ticariBorc - K.borc0;
  return { nakit: K.nakit0, alacak, stok, duran: K.duran0, ticariBorc, borc: K.borc0, ozkaynak };
})();

function labModel(a) {
  const K = LAB_SABIT, B = LAB_BASLANGIC;

  // --- Gelir tablosu ---
  const hasilat = K.hasilat0 * (1 + a.hacim / 100);
  const smm = hasilat * (1 - a.brut / 100);
  const brutKar = hasilat - smm;
  const gider = hasilat * a.gider / 100;
  const amortisman = (B.duran + a.yatirim) * K.amortOran;
  const fvok = brutKar - gider - amortisman;       // esas faaliyet kârı
  const favok = fvok + amortisman;
  const faizGideri = a.borc * a.faiz / 100;
  const vok = fvok - faizGideri;
  const vergi = Math.max(0, vok * K.vergi);
  const netKar = vok - vergi;
  const temettu = Math.max(0, netKar) * a.temettu / 100;

  // --- İşletme sermayesi ---
  const alacak = hasilat * a.tahsilat / 365;
  const stok = smm * K.stokGun / 365;
  const ticariBorc = smm * K.borcGun / 365;
  const isletmeSermayesiArtisi = (alacak - B.alacak) + (stok - B.stok) - (ticariBorc - B.ticariBorc);

  // --- Nakit akışı ---
  const isletme = netKar + amortisman - isletmeSermayesiArtisi;
  const yatirimHarcamasi = K.bakimYatirimi + a.yatirim;
  const yatirimAkisi = -yatirimHarcamasi;
  const borcDegisimi = a.borc - B.borc;
  const hamNakit = B.nakit + isletme + yatirimAkisi + borcDegisimi - temettu;
  const ekBorc = hamNakit < 0 ? -hamNakit : 0;   // açık kısa vadeli krediyle kapatılır
  const finansmanAkisi = borcDegisimi - temettu + ekBorc;
  const nakit = hamNakit + ekBorc;

  // --- Bilanço (dönem sonu) ---
  const duran = B.duran + yatirimHarcamasi - amortisman;
  const ozkaynak = B.ozkaynak + netKar - temettu;
  const finansalBorc = a.borc + ekBorc;
  const varliklar = nakit + alacak + stok + duran;
  const kaynaklar = ticariBorc + finansalBorc + ozkaynak;

  // --- Oranlar ---
  const donenVarlik = nakit + alacak + stok;
  const kvYukumluluk = ticariBorc + a.borc * K.kvBorcPayi + ekBorc;
  const netBorc = finansalBorc - nakit;
  const oran = (pay, payda) => (payda > 0 ? pay / payda : null);

  return {
    girdi: a,
    gelir: { hasilat, smm, brutKar, gider, amortisman, fvok, favok, faizGideri, vok, vergi, netKar, temettu },
    nakitAkisi: { baslangic: B.nakit, isletme, yatirim: yatirimAkisi, finansman: finansmanAkisi, borcDegisimi, temettu, ekBorc, isletmeSermayesiArtisi, son: nakit },
    bilanco: { nakit, alacak, stok, duran, ticariBorc, finansalBorc, ekBorc, ozkaynak, varliklar, kaynaklar },
    oranlar: {
      brutMarj: oran(brutKar, hasilat) * 100,
      netMarj: oran(netKar, hasilat) * 100,
      roe: oran(netKar, (B.ozkaynak + ozkaynak) / 2) !== null ? oran(netKar, (B.ozkaynak + ozkaynak) / 2) * 100 : null,
      fk: netKar > 0 ? a.piyasa / netKar : null,
      pddd: oran(a.piyasa, ozkaynak),
      fdFavok: oran(a.piyasa + netBorc, favok),
      netBorcFavok: oran(netBorc, favok),
      cari: oran(donenVarlik, kvYukumluluk)
    }
  };
}
