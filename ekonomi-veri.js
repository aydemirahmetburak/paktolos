// Ekonomi içeriği: göstergeler ve neden-sonuç zincirleri.
// Arayüzden ayrıdır; ana sayfa ve ekonomi.html aynı veriyi kullanır.
//
// Paktolos rakam yayınlamaz. Her gösterge ne ölçtüğünü, resmî kaynağını ve
// yükseldiğinde ne anlama gelebileceğini anlatır. Sonuçlar kesinlik değil,
// eğilim diliyle yazılır: ekonomide etkiler zamanlamaya ve koşullara bağlıdır.

const GOSTERGELER = [
  {
    id: 'enflasyon', ad: 'Enflasyon', olcu: 'TÜFE, yıllık değişim',
    neOlcer: 'Fiyatların bir yıl öncesine göre ortalama ne kadar arttığını.',
    kisa: 'Fiyatlar ne hızla artıyor?',
    kaynak: 'TÜİK', siklik: 'Aylık', url: 'https://www.tuik.gov.tr', urlAd: 'tuik.gov.tr',
    soru: 'Enflasyon yükselirse',
    anlam: ['Aynı maaşla daha az mal ve hizmet alınır.', 'Birikimin reel getirisi düşebilir, hatta eksiye dönebilir.', 'Merkez Bankası faizi artırmayı değerlendirebilir.'],
    kavram: 'enflasyon'
  },
  {
    id: 'politika-faizi', ad: 'Politika faizi', olcu: 'TCMB bir hafta vadeli repo faizi',
    neOlcer: 'Merkez Bankası\'nın bankalara borç verdiği temel faizi; ekonomideki diğer faizlerin çıpasıdır.',
    kisa: 'Paranın temel fiyatı ne?',
    kaynak: 'TCMB', siklik: 'Karar toplantılarında', url: 'https://www.tcmb.gov.tr', urlAd: 'tcmb.gov.tr',
    soru: 'Politika faizi yükselirse',
    anlam: ['Kredi faizleri artabilir; borçlanmak pahalılaşır.', 'Mevduat getirileri yükselebilir.', 'Harcama ve talep yavaşlayabilir; hedeflenen de fiyat artışlarının frenlenmesidir.'],
    kavram: 'politika-faizi'
  },
  {
    id: 'kur', ad: 'Döviz kuru', olcu: 'USD/TRY',
    neOlcer: 'Bir ABD dolarının kaç Türk lirası ettiğini.',
    kisa: 'Lira dünyada ne ediyor?',
    kaynak: 'TCMB gösterge kurları', siklik: 'Her iş günü', url: 'https://www.tcmb.gov.tr', urlAd: 'tcmb.gov.tr',
    soru: 'Kur yükselirse (TL değer kaybederse)',
    anlam: ['İthal ürünler ve enerji pahalanabilir.', 'Dövizle borçlu şirketlerin yükü artar.', 'İhracat yapan şirketlerin TL cinsinden geliri artabilir.'],
    kavram: 'doviz-kuru'
  },
  {
    id: 'buyume', ad: 'Büyüme', olcu: 'GSYH, yıllık değişim',
    neOlcer: 'Ekonominin ürettiği toplam mal ve hizmet değerinin bir yıl öncesine göre değişimini.',
    kisa: 'Ekonomi genişliyor mu?',
    kaynak: 'TÜİK', siklik: 'Çeyreklik', url: 'https://www.tuik.gov.tr', urlAd: 'tuik.gov.tr',
    soru: 'Büyüme hızlanırsa',
    anlam: ['İstihdam ve gelirler artma eğilimine girebilir.', 'Şirketlerin satış ve kârları desteklenebilir.', 'Talep çok hızlı artarsa enflasyon baskısı doğabilir.'],
    kavram: 'gsyh'
  }
];

// "Faiz değişince ne olur?" — parasal aktarım zinciri, basitleştirilmiş.
// yon: 'artar' | 'azalir' (iyi ya da kötü anlamı taşımaz)
const FAIZ_ZINCIRI = {
  artis: {
    baslik: 'Politika faizi artarsa',
    adimlar: [
      { ad: 'Kredi faizleri', yon: 'artar', not: 'Bankalar da borç verirken daha yüksek faiz ister.' },
      { ad: 'Borçlanma', yon: 'azalir', not: 'Kredi pahalılaşınca ev, araba ve işletme yatırımları ertelenir.' },
      { ad: 'Mevduat getirisi', yon: 'artar', not: 'Parayı bankada tutmak cazipleşir; harcamanın bir kısmı birikime döner.' },
      { ad: 'Toplam talep', yon: 'azalir', not: 'Hanehalkı ve şirketlerin toplam harcaması yavaşlar.' },
      { ad: 'Fiyat artışları', yon: 'azalir', not: 'Satıcılar zam yapmakta zorlanır. Etki genellikle aylar içinde görülür.' }
    ],
    bedel: 'Diğer yüzü: büyüme yavaşlayabilir, işsizlik artabilir. Merkez bankaları bu dengeyi gözeterek karar verir.'
  },
  dusus: {
    baslik: 'Politika faizi düşerse',
    adimlar: [
      { ad: 'Kredi faizleri', yon: 'azalir', not: 'Borç almak ucuzlar.' },
      { ad: 'Borçlanma', yon: 'artar', not: 'Ev, araba ve işletme yatırımları için kredi talebi artar.' },
      { ad: 'Mevduat getirisi', yon: 'azalir', not: 'Parayı bankada tutmanın getirisi azalır; harcama öne çekilir.' },
      { ad: 'Toplam talep', yon: 'artar', not: 'Hanehalkı ve şirketlerin toplam harcaması hızlanır.' },
      { ad: 'Fiyat artışları', yon: 'artar', not: 'Talep üretimden hızlı artarsa fiyatlar da hızlanabilir.' }
    ],
    bedel: 'Diğer yüzü: büyüme ve istihdam desteklenebilir. Ama enflasyon yüksekken faiz indirimi fiyat artışlarını hızlandırabilir.'
  },
  not: 'Basitleştirilmiş bir anlatımdır. Gerçekte etkiler zamanlamaya, beklentilere, kura ve diğer koşullara bağlıdır.'
};

// Ana sayfadaki soyut ekonomi ağı: düğümler ve aralarındaki neden-sonuç
const EKONOMI_AGI = {
  dugumler: [
    { id: 'faiz', ad: 'Faiz', x: 130, y: 110, tanim: 'Paranın fiyatı. Merkez Bankası belirler, diğer faizler onu izler.' },
    { id: 'para', ad: 'Para ve kredi', x: 90, y: 300, tanim: 'Ekonomide dolaşan para ve bankaların verdiği krediler.' },
    { id: 'buyume', ad: 'Büyüme', x: 330, y: 390, tanim: 'Ekonominin ürettiği toplam değerin artışı.' },
    { id: 'enflasyon', ad: 'Enflasyon', x: 470, y: 230, tanim: 'Fiyatların genel olarak yükselme hızı.' },
    { id: 'piyasalar', ad: 'Piyasalar', x: 380, y: 70, tanim: 'Hisse, tahvil ve dövizin alınıp satıldığı yerler.' }
  ],
  baglar: [
    { a: 'faiz', b: 'para', metin: 'Faiz yükselirse kredi pahalılaşır; kredi hacmi yavaşlar.' },
    { a: 'para', b: 'buyume', metin: 'Kredi ve harcama, üretimi ve büyümeyi besler.' },
    { a: 'buyume', b: 'enflasyon', metin: 'Talep üretimden hızlı artarsa fiyatlar yükselir.' },
    { a: 'enflasyon', b: 'faiz', metin: 'Enflasyon yükselirse Merkez Bankası faizi artırmayı değerlendirir.' },
    { a: 'faiz', b: 'piyasalar', metin: 'Faiz değişimi hisse, tahvil ve döviz fiyatlarını etkiler.' },
    { a: 'piyasalar', b: 'enflasyon', metin: 'Kurdaki hareket, ithal ürünler yoluyla fiyatlara yansır.' }
  ]
};
