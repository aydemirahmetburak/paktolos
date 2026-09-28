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

// "Ekonomi nasıl çalışır?" haritası (ekonomi-haritasi.html)
// Altı oyuncu ve aralarındaki para, kredi ve sermaye akışları. Basitleştirilmiştir:
// gerçek ekonomide dış dünya (ihracat, ithalat, yabancı sermaye) da vardır.
// tur: 'para' (düz çizgi) | 'kredi' (kesikli) | 'sermaye' (noktalı)
// bukum: akışın kavis miktarı (piksel, işaretli); karşılıklı akışlar kendiliğinden iki yana ayrılır.
const EKONOMI_HARITASI = {
  dugumler: [
    { id: 'devlet', ad: 'Devlet', rol: 'Maliye politikası', x: 130, y: 120,
      ne: 'Vergi toplar; eğitim, sağlık, altyapı ve sosyal destekler için harcama yapar.',
      kontrol: 'Vergi oranlarını, kamu harcamalarını ve borçlanmayı belirler. Buna maliye politikası denir.',
      etkiler: [
        ['hanehalki', 'Vergiler harcanabilir geliri azaltır; transferler ve kamu hizmetleri destekler.'],
        ['sirketler', 'Vergi, teşvik ve kamu alımlarıyla şirketlerin kârını ve yatırımını etkiler.'],
        ['piyasalar', 'Açığını kapatmak için tahvil çıkarır; yüksek borçlanma, faizleri yukarı itebilir.']],
      kavramlar: ['tahvil-bono', 'gsyh', 'gelir-vergisi-dilimi'] },
    { id: 'merkez', ad: 'Merkez Bankası', rol: 'Para politikası', x: 400, y: 50,
      ne: 'Para politikasını yönetir. Temel amacı fiyat istikrarıdır.',
      kontrol: 'Politika faizini belirler, bankaların likiditesini ayarlar ve döviz rezervlerini yönetir.',
      etkiler: [
        ['bankalar', 'Bankaların fonlama maliyetini belirler; bu da kredi ve mevduat faizlerine yansır.'],
        ['hanehalki', 'Faiz ve beklentiler üzerinden harcama ve birikim kararlarını etkiler.'],
        ['piyasalar', 'Faiz kararları hisse, tahvil ve döviz fiyatlarını hareketlendirir.']],
      kavramlar: ['politika-faizi', 'enflasyon', 'doviz-kuru'] },
    { id: 'piyasalar', ad: 'Sermaye piyasaları', rol: 'Hisse, tahvil, fon', x: 670, y: 120,
      ne: 'Hisse, tahvil ve fonların alınıp satıldığı yerdir; birikimi yatırıma yönlendirir.',
      kontrol: 'Kimse tek başına kontrol etmez: fiyatlar alıcı ve satıcıların beklentileriyle oluşur. SPK düzenler ve denetler.',
      etkiler: [
        ['sirketler', 'Banka kredisine alternatif sermaye sağlar.'],
        ['hanehalki', 'Birikimi büyütme imkânı sunar; karşılığında risk taşır.'],
        ['devlet', 'Devletin borçlanmasını finanse eder; tahvil faizleri ekonomiye dair beklentileri yansıtır.']],
      kavramlar: ['hisse-senedi', 'tahvil-bono', 'yatirim-fonu'] },
    { id: 'bankalar', ad: 'Bankalar', rol: 'Mevduat ve kredi', x: 400, y: 300,
      ne: 'Mevduat toplar, kredi verir ve ödemelerin dolaşmasını sağlar.',
      kontrol: 'Kime, hangi faizle ve ne kadar kredi vereceğine karar verir.',
      etkiler: [
        ['hanehalki', 'Kredi faizleri konut, taşıt ve ihtiyaç harcamalarını hızlandırır ya da yavaşlatır.'],
        ['sirketler', 'Kredi, şirketlerin yatırımını ve işletme sermayesini finanse eder.'],
        ['merkez', 'Politika faizini ekonomiye taşıyan ilk halkadır. Kredi verilirken yeni mevduat da oluşur; bu yüzden kredi büyümesi dolaşımdaki parayı artırır.']],
      kavramlar: ['faiz', 'vadeli-mevduat', 'kredi-notu'] },
    { id: 'hanehalki', ad: 'Hanehalkı', rol: 'Çalışır, harcar, biriktirir', x: 150, y: 510,
      ne: 'Çalışır, harcar, biriktirir ve borçlanır. Ekonomideki harcamanın en büyük kaynağıdır.',
      kontrol: 'Ne kadar harcayacağına, ne kadar biriktireceğine ve birikimini nereye koyacağına karar verir.',
      etkiler: [
        ['sirketler', 'Harcaması, şirketlerin satışıdır.'],
        ['bankalar', 'Mevduatı, bankaların kaynaklarının önemli bir parçasıdır.'],
        ['devlet', 'Gelir ve harcamaları üzerinden vergi öder.'],
        ['piyasalar', 'Birikimini hisse, tahvil ya da fona yatırabilir.']],
      kavramlar: ['butce', 'enflasyon', 'vadeli-mevduat'] },
    { id: 'sirketler', ad: 'Şirketler', rol: 'Üretir, istihdam eder', x: 650, y: 510,
      ne: 'Mal ve hizmet üretir, istihdam yaratır ve yatırım yapar.',
      kontrol: 'Fiyatlarına, üretimine, yatırımına ve kaç kişi çalıştıracağına karar verir.',
      etkiler: [
        ['hanehalki', 'Maaş öder ve istihdam sağlar.'],
        ['bankalar', 'Yatırım ve işletme sermayesi için kredi kullanır.'],
        ['piyasalar', 'Hisse ve tahvil çıkararak sermaye toplar; kâr payı dağıtır.'],
        ['devlet', 'Kazancı üzerinden vergi öder.']],
      kavramlar: ['hisse-senedi', 'favok', 'bilanco'] }
  ],
  akislar: [
    { id: 'likidite', a: 'merkez', b: 'bankalar', tur: 'para', ad: 'Likidite ve politika faizi' },
    { id: 'mevduat', a: 'hanehalki', b: 'bankalar', tur: 'para', ad: 'Mevduat' },
    { id: 'kredi-hane', a: 'bankalar', b: 'hanehalki', tur: 'kredi', ad: 'Tüketici kredisi' },
    { id: 'kredi-sirket', a: 'bankalar', b: 'sirketler', tur: 'kredi', ad: 'Ticari kredi' },
    { id: 'harcama', a: 'hanehalki', b: 'sirketler', tur: 'para', ad: 'Harcama' },
    { id: 'maas', a: 'sirketler', b: 'hanehalki', tur: 'para', ad: 'Maaş' },
    { id: 'vergi-hane', a: 'hanehalki', b: 'devlet', tur: 'para', ad: 'Vergi' },
    { id: 'transfer', a: 'devlet', b: 'hanehalki', tur: 'para', ad: 'Kamu hizmeti ve destekler' },
    { id: 'vergi-sirket', a: 'sirketler', b: 'devlet', tur: 'para', ad: 'Vergi', bukum: 150 },
    { id: 'yatirim', a: 'hanehalki', b: 'piyasalar', tur: 'sermaye', ad: 'Yatırım', bukum: 110 },
    { id: 'getiri', a: 'piyasalar', b: 'hanehalki', tur: 'sermaye', ad: 'Kâr payı ve faiz getirisi', bukum: 110 },
    { id: 'sermaye', a: 'piyasalar', b: 'sirketler', tur: 'sermaye', ad: 'Hisse ve tahvil ile sermaye' },
    { id: 'kar-payi', a: 'sirketler', b: 'piyasalar', tur: 'sermaye', ad: 'Kâr payı ve faiz ödemesi' },
    { id: 'borclanma', a: 'piyasalar', b: 'devlet', tur: 'kredi', ad: 'Devlet tahvili ile borçlanma', bukum: 30 }
  ],
  senaryolar: {
    faiz: {
      ad: 'Faiz artarsa ne olur?',
      adimlar: [
        { akislar: ['likidite'], metin: 'Merkez Bankası politika faizini artırır. Bankaların fonlanma maliyeti yükselir.' },
        { akislar: ['kredi-hane', 'kredi-sirket'], metin: 'Bankalar kredi faizlerini artırır. Borç almak hem haneler hem şirketler için pahalılaşır.' },
        { akislar: ['mevduat'], metin: 'Mevduat faizleri de yükselir. Parayı harcamak yerine bankada tutmak cazipleşir.' },
        { akislar: ['harcama'], metin: 'Harcama ve yatırım yavaşlar. Şirketlerin satışları ve yatırım iştahı azalır.' },
        { akislar: ['yatirim', 'sermaye'], metin: 'Yüksek faiz, hisse ve tahvil fiyatlarını aşağı çekebilir. Şirketlerin sermaye toplaması zorlaşır.' },
        { akislar: ['borclanma'], metin: 'Devletin borçlanma maliyeti de artar.' }
      ],
      sonuc: 'Hedef: talep yavaşlayarak fiyat artışlarının frenlenmesi. Bedel: büyüme ve istihdam üzerinde baskı. Etkiler aylar içinde, zamanlamaya ve beklentilere bağlı olarak yayılır.'
    }
  }
};
