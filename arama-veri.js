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

  // Araçlar
  { tur: 'arac', baslik: 'Kredi hesaplayıcı', aciklama: 'Aylık taksit, toplam faiz ve ödeme tablosu', href: 'araclar.html#kredi',
    anahtar: 'kredi taksit faiz ihtiyaç kredisi konut kredisi taşıt vade ödeme planı' },
  { tur: 'arac', baslik: 'Asgari ödeme simülatörü', aciklama: 'Hep asgariyi ödersem kart borcum ne zaman biter?', href: 'araclar.html#asgari',
    anahtar: 'kredi kartı asgari ödeme kart borcu ekstre akdi faiz' },
  { tur: 'arac', baslik: 'Taksit mi, peşin mi?', aciklama: 'Hangisi bugünün parasıyla gerçekten ucuz?', href: 'araclar.html#taksit',
    anahtar: 'taksit peşin vade farkı alışveriş indirim' },
  { tur: 'arac', baslik: 'Birikim hedefi', aciklama: 'Hedefe ulaşmak için her ay ne kadar ayırmalıyım?', href: 'araclar.html#hedef',
    anahtar: 'birikim hedef tasarruf ev peşinat araba aylık enflasyon' },
  { tur: 'arac', baslik: 'Erken başlamanın gücü', aciklama: '25 ile 35 yaşında başlamanın farkı', href: 'araclar.html#erken',
    anahtar: 'erken başlamak bileşik getiri emeklilik birikim zaman' },

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
  { tur: 'sayfa', baslik: 'Paktolos Okulu', aciklama: 'Beş dakikalık etkileşimli dersler', href: 'dersler.html',
    anahtar: 'ders dersler okul öğren eğitim kurs' },
  { tur: 'sayfa', baslik: 'Karnem', aciklama: 'İlerlemen, rozetlerin ve günün sorusu', href: 'karnem.html',
    anahtar: 'karne ilerleme rozet seri günün sorusu' },
  { tur: 'sayfa', baslik: 'Aklına takılan', aciklama: 'Günlük hayatta en çok sorulan para soruları', href: 'sorular.html',
    anahtar: 'soru cevap sss sık sorulan kart borcu maaş birikim haber' },
  { tur: 'sayfa', baslik: 'Kendini sına', aciklama: 'On durumda oran yorumlama testi', href: 'test.html',
    anahtar: 'test sınav soru quiz' },
  { tur: 'sayfa', baslik: 'Paktolos\'un hikâyesi', aciklama: 'Kral Midas, altın nehir ve ilk para', href: 'hikaye.html',
    anahtar: 'hikaye midas lidya sardes nehir sart çayı ilk para sikke karun isim' }
];
