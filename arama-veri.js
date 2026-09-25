// Site geneli arama dizini
//
// Sözlükteki kavramlar arama sırasında sozluk-veri.js'ten otomatik eklenir.
// Buraya sitedeki sayfa ve bölümler girilir.
//
//   baslik    sonuçta görünen ad
//   aciklama  kısa açıklama
//   href      gidilecek adres
//   tur       'ders' | 'arac' | 'sektor' | 'sayfa'  (simgeyi ve grubu belirler)
//   anahtar   aramada eşleşmesi istenen ek kelimeler

const ARAMA_DIZINI = [
  // Öğren
  { tur: 'ders', baslik: 'Bilanço', aciklama: 'Varlıklar, borçlar ve özkaynak: şirketin fotoğrafı', href: 'ogren.html#bilanco',
    anahtar: 'dönen duran varlık kısa uzun vadeli yükümlülük özkaynak finansal durum tablosu' },
  { tur: 'ders', baslik: 'Gelir tablosu', aciklama: 'Hasılattan net kâra: şirket ne kazandı?', href: 'ogren.html#gelir-tablosu',
    anahtar: 'hasılat brüt kâr faaliyet kârı net kâr favök tek seferlik enflasyon muhasebesi tms 29' },
  { tur: 'ders', baslik: 'Nakit akışı', aciklama: 'Kâr gerçekten kasaya giriyor mu?', href: 'ogren.html#nakit-akis',
    anahtar: 'işletme yatırım finansman serbest nakit akışı' },
  { tur: 'ders', baslik: 'Temel oranlar', aciklama: 'F/K, PD/DD, FD/FAVÖK, ROE, marj, cari oran, net borç', href: 'ogren.html#oranlar',
    anahtar: 'fk pd dd fd favök roe özkaynak kârlılığı net kâr marjı cari oran net borç değerleme' },

  // Analiz
  { tur: 'ders', baslik: 'Bir hisseyi yedi adımda oku', aciklama: 'Örnek A.Ş. üzerinden adım adım analiz', href: 'analiz.html#adimlar',
    anahtar: 'büyüme kârlılık borç nakit değerleme karşılaştır risk şirket analizi' },
  { tur: 'arac', baslik: 'Oran hesaplayıcı', aciklama: 'KAP rakamlarını gir, yedi oranı anında gör', href: 'analiz.html#hesapla',
    anahtar: 'hesapla hesaplayıcı fk pd dd roe cari oran net borç favök' },

  // Sektörler
  { tur: 'sektor', baslik: 'Bankacılık', aciklama: 'PD/DD, ROE, net faiz marjı, takipteki krediler', href: 'sektorler.html#banka',
    anahtar: 'banka mevduat kredi sermaye yeterlilik akbnk garan isctr ykbnk' },
  { tur: 'sektor', baslik: 'Holdingler', aciklama: 'Net aktif değer ve iskonto', href: 'sektorler.html#holding',
    anahtar: 'holding nad iştirak kchol sahol' },
  { tur: 'sektor', baslik: 'Gayrimenkul (GYO)', aciklama: 'Portföy değeri, kira geliri, borçluluk', href: 'sektorler.html#gyo',
    anahtar: 'gyo gayrimenkul emlak kira ekspertiz ekgyo' },
  { tur: 'sektor', baslik: 'Perakende', aciklama: 'Düşük marj, yüksek hacim, stok devir hızı', href: 'sektorler.html#perakende',
    anahtar: 'market mağaza perakende bimas mgros' },
  { tur: 'sektor', baslik: 'Sanayi ve üretim', aciklama: 'Hammadde, kur ve döngüsellik', href: 'sektorler.html#sanayi',
    anahtar: 'sanayi üretim fabrika çelik otomotiv eregl arclk froto toaso sise' },
  { tur: 'sektor', baslik: 'Havacılık ve ulaştırma', aciklama: 'Doluluk oranı, yakıt, kiralama yükümlülükleri', href: 'sektorler.html#ulastirma',
    anahtar: 'havayolu uçak havalimanı thyao pgsus tavhl' },

  // Sayfalar
  { tur: 'sayfa', baslik: 'Finans sözlüğü', aciklama: 'Günlük hayattan borsaya 67 kavram', href: 'sozluk.html',
    anahtar: 'sözlük kavram terim tanım' },
  { tur: 'sayfa', baslik: 'Kendini sına', aciklama: 'On durumda oran yorumlama testi', href: 'test.html',
    anahtar: 'test sınav soru quiz' },
  { tur: 'sayfa', baslik: 'Paktolos\'un hikâyesi', aciklama: 'Kral Midas, altın nehir ve ilk para', href: 'hikaye.html',
    anahtar: 'hikaye midas lidya sardes nehir sart çayı ilk para sikke karun isim' }
];
