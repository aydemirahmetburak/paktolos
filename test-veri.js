// "Kendini sına" soruları
//
// Her soru bir durum anlatır ve dört yorum sunar. Amaç ezber değil,
// oranları doğru yorumlayabilmek. Tüm şirketler ve rakamlar hayalidir.
//
//   durum     sorunun bağlamı (hayali şirket ve rakamlar)
//   veri      durum kartında gösterilen rakamlar [etiket, değer]
//   soru      sorulan şey
//   secenekler dört yorum
//   dogru     doğru seçeneğin sırası (0'dan başlar)
//   aciklama  cevaptan sonra gösterilen açıklama
//   ders      ilgili ders { ad, href }

const SORULAR = [
  {
    durum: 'A Şirketi, aynı sektördeki rakiplerinden belirgin şekilde düşük bir F/K oranıyla işlem görüyor.',
    veri: [['A Şirketi F/K', '5,0'], ['Sektör ortalaması', '12,0']],
    soru: 'Bu bilgiyle yapılabilecek en doğru yorum hangisi?',
    secenekler: [
      'Hisse kesinlikle ucuzdur, fırsattır.',
      'Piyasa, kârın düşeceğini ya da şirkette bir risk olduğunu düşünüyor olabilir; nedenini araştırmak gerekir.',
      'Şirket zarar ediyordur.',
      'F/K düşük olduğu için şirket yüksek temettü dağıtıyordur.'
    ],
    dogru: 1,
    aciklama: 'Düşük F/K bir ucuzluk işareti olabilir, ama tek başına kanıt değildir. Piyasa kârın düşeceğini, tek seferlik bir kârı ya da bir riski fiyatlıyor olabilir. Zarar eden bir şirketin F/K\'sı ise anlamlı değildir.',
    ders: { ad: 'F/K oranı', href: 'ogren.html#oranlar' }
  },
  {
    durum: 'B Şirketi geçen yıl %30 özkaynak kârlılığı açıkladı. Aynı yıl yıllık enflasyon %45 oldu.',
    veri: [['Özkaynak kârlılığı (ROE)', '%30'], ['Yıllık enflasyon', '%45']],
    soru: 'Bu tablo ortaklar için ne anlama gelebilir?',
    secenekler: [
      '%30 çok yüksek bir kârlılık, şirket harika gidiyor.',
      'ROE ile enflasyonun ilgisi yoktur.',
      'Ortakların sermayesi reel olarak değer kaybediyor olabilir.',
      'Şirketin borcu çok yüksektir.'
    ],
    dogru: 2,
    aciklama: 'ROE nominal bir orandır. Enflasyon %45 iken %30\'luk ROE, ortakların koyduğu sermayenin satın alma gücünü korumaya yetmeyebilir. Yüksek enflasyonda kârlılık her zaman enflasyonla karşılaştırılmalıdır.',
    ders: { ad: 'Özkaynak kârlılığı', href: 'ogren.html#oranlar' }
  },
  {
    durum: 'Büyük bir market zincirinin bilançosunda cari oran 1\'in altında.',
    veri: [['Cari oran', '0,8'], ['Sektör', 'Gıda perakendesi']],
    soru: 'Bu durumu nasıl değerlendirirsin?',
    secenekler: [
      'Şirket iflasın eşiğinde.',
      'Perakendede müşteriden peşin tahsil edip tedarikçiye vadeli ödemek iş modelinin parçasıdır; tek başına alarm işareti değildir.',
      'Cari oran perakende şirketleri için hesaplanamaz.',
      'Şirket çok fazla stok tutuyor demektir.'
    ],
    dogru: 1,
    aciklama: 'Market zincirleri ürünü kasada peşin satar, tedarikçiye ise haftalar sonra öder. Bu yüzden kısa vadeli borçları dönen varlıklarından fazla olabilir. Oranlar sektörüyle birlikte okunmalıdır.',
    ders: { ad: 'Perakende sektörü', href: 'sektorler.html#perakende' }
  },
  {
    durum: 'C Şirketinin bilançosunda nakit ve nakit benzerleri, finansal borçlarından fazla.',
    veri: [['Net borç / FAVÖK', '−0,5']],
    soru: 'Negatif net borç / FAVÖK oranı ne anlatır?',
    secenekler: [
      'Şirket zarar ediyordur.',
      'Hesaplamada bir hata vardır.',
      'Şirketin nakdi, finansal borcundan fazladır (net nakit pozisyonu).',
      'Şirketin borcu çok hızlı artıyordur.'
    ],
    dogru: 2,
    aciklama: 'Net borç = finansal borçlar − nakit. Nakit borçtan fazlaysa net borç negatif çıkar. Bu, şirketin borç yükü açısından rahat olduğunu gösterir.',
    ders: { ad: 'Net borç / FAVÖK', href: 'ogren.html#oranlar' }
  },
  {
    durum: 'D Şirketi son üç yılda her yıl net kârını artırdı. Ancak aynı üç yılda işletme faaliyetlerinden nakit akışı her yıl negatif.',
    veri: [['Net kâr eğilimi', 'Artıyor ↑'], ['İşletme nakit akışı', 'Üç yıldır negatif']],
    soru: 'Bu tabloda dikkat edilmesi gereken nokta nedir?',
    secenekler: [
      'Kâr artıyorsa nakit akışının önemi yoktur.',
      'Kâr nakde dönüşmüyor; alacakların veya stokların neden bu kadar arttığına bakmak gerekir.',
      'Negatif nakit akışı her zaman büyümenin işaretidir.',
      'Şirket çok fazla temettü dağıtıyordur.'
    ],
    dogru: 1,
    aciklama: 'Sağlıklı bir şirkette kâr, zamanla kasaya nakit olarak girer. Kâr artarken işletme nakit akışı sürekli negatifse, satışlar tahsil edilemiyor ya da stoklar birikiyor olabilir. Bu, kârın kalitesini sorgulatır.',
    ders: { ad: 'Nakit akışı', href: 'ogren.html#nakit-akis' }
  },
  {
    durum: 'Bir bankayı analiz etmek istiyorsun.',
    veri: [['Şirket türü', 'Banka']],
    soru: 'Aşağıdaki göstergelerden hangisi bankalar için anlamlı değildir?',
    secenekler: [
      'PD/DD',
      'Özkaynak kârlılığı (ROE)',
      'FD/FAVÖK',
      'Takipteki krediler oranı'
    ],
    dogru: 2,
    aciklama: 'Bankalar için borç, işin kendisidir: mevduat toplar, kredi verir. Bu yüzden borcu hesaba katan FD/FAVÖK ve net borç gibi oranlar bankalarda kullanılmaz. Bankalarda PD/DD ve ROE birlikte okunur.',
    ders: { ad: 'Bankacılık', href: 'sektorler.html#banka' }
  },
  {
    durum: 'E Şirketinin net kârı bu çeyrekte bir önceki yılın aynı dönemine göre üç katına çıktı. Esas faaliyet kârı ise neredeyse hiç değişmedi.',
    veri: [['Net kâr değişimi', '+%200'], ['Esas faaliyet kârı değişimi', '+%2']],
    soru: 'Net kârdaki sıçramanın en olası açıklaması hangisi?',
    secenekler: [
      'Şirketin satışları üç katına çıkmıştır.',
      'Kâr, arsa satışı gibi ana faaliyet dışı ya da tek seferlik bir kalemden gelmiş olabilir.',
      'Şirketin maliyetleri sıfırlanmıştır.',
      'Şirket yeni bir fabrika açmıştır.'
    ],
    dogru: 1,
    aciklama: 'Ana işten gelen kâr değişmediyse, net kârdaki artış başka bir yerden gelmiştir: bir varlık satışı, kur farkı geliri ya da benzeri. Bu tür kârlar tekrarlanmayabilir; değerlemede dikkatli olunmalıdır.',
    ders: { ad: 'Gelir tablosu', href: 'ogren.html#gelir-tablosu' }
  },
  {
    durum: 'F Şirketinin satışları (hasılat) bir yılda %30 arttı. Aynı dönemde yıllık enflasyon %40 oldu.',
    veri: [['Hasılat büyümesi', '%30'], ['Yıllık enflasyon', '%40']],
    soru: 'Şirketin büyümesini nasıl yorumlarsın?',
    secenekler: [
      'Şirket güçlü büyüyor.',
      'Reel olarak şirketin satışları küçülmüş olabilir.',
      'Enflasyon satışları etkilemez.',
      'Şirket kâr marjını artırmıştır.'
    ],
    dogru: 1,
    aciklama: 'Fiyatlar %40 artarken satışlar %30 arttıysa, şirket muhtemelen daha az ürün satmıştır. Enflasyondan arındırıldığında satışlar yaklaşık %7 küçülmüş olur: 1,30 ÷ 1,40 ≈ 0,93.',
    ders: { ad: 'Adım adım analiz: Büyüyor mu?', href: 'analiz.html#adimlar' }
  },
  {
    durum: 'G Şirketinin piyasa değeri, bilançosundaki özkaynaklarının altında.',
    veri: [['PD/DD', '0,7']],
    soru: 'Bu durum ne anlama gelir?',
    secenekler: [
      'Hisse kesinlikle ucuzdur.',
      'Şirket, defter değerinin altında işlem görüyor; piyasanın neden şüpheli olduğunu araştırmak gerekir.',
      'Şirketin özkaynağı negatiftir.',
      'Şirket borçsuzdur.'
    ],
    dogru: 1,
    aciklama: 'PD/DD\'nin 1\'in altında olması, piyasanın şirkete özkaynağından daha düşük değer biçtiğini gösterir. Bu bir fırsat olabilir; ama piyasa varlıkların gerçek değerinden ya da şirketin kâr üretme gücünden şüphe ediyor da olabilir.',
    ders: { ad: 'PD/DD oranı', href: 'ogren.html#oranlar' }
  },
  {
    durum: 'H Şirketi %100 bedelsiz sermaye artırımı yaptı. Önceden hisse fiyatı 50 TL\'ydi ve senin 100 payın vardı.',
    veri: [['Bedelsiz oranı', '%100'], ['Önceki durum', '100 pay × 50 TL']],
    soru: 'Bedelsiz sonrası, diğer her şey aynı kalırsa ne olur?',
    secenekler: [
      'Payın 200 olur ve toplam yatırımın 10.000 TL\'ye çıkar.',
      'Payın 200 olur, fiyat yaklaşık 25 TL\'ye düzeltilir; yatırımının toplam değeri değişmez.',
      'Payın 100 kalır, fiyat 100 TL olur.',
      'Şirketin kârı iki katına çıkar.'
    ],
    dogru: 1,
    aciklama: 'Bedelsiz, pastayı daha çok dilime bölmektir. Pay sayısı ikiye katlanır, fiyat yarıya düzeltilir: 100 × 50 = 200 × 25 = 5.000 TL. Şirketin değeri, varlıkları ve kârı değişmez.',
    ders: { ad: 'Sözlük: Bedelsiz sermaye artırımı', href: 'sozluk.html#bedelsiz' }
  }
];
