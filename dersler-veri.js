// Paktolos Okulu: dersler
//
// Her ders kısa kartlardan oluşur. Kart türleri:
//   { tur: 'metin', baslik, metin }             anlatım
//   { tur: 'ornek', baslik, metin }             hayattan örnek (vurgulu)
//   { tur: 'soru', soru, secenekler, dogru, aciklama }   ara soru
//   { tur: 'ozet', maddeler }                   dersin özeti (son kart)
//
//   bag  dersin sonunda gösterilen bağlantılar: kavramlar (sözlük id'leri),
//        arac { ad, href }, ders { ad, href }

const DERS_YOLLARI = [
  { id: 'kisisel', ad: 'Kişisel finans', aciklama: 'Paranın dili: enflasyon, faiz, borç ve bütçe.' },
  { id: 'borsa', ad: 'Borsa ve şirket analizi', aciklama: 'Bir şirketin rakamlarını okumaya giriş.' }
];

const DERSLER = [
  {
    id: 'enflasyon', yol: 'kisisel', sure: 5,
    baslik: 'Enflasyon ve alım gücü',
    ozet: 'Paranın değeri neden sabit kalmaz ve bunu nasıl ölçeriz?',
    kartlar: [
      { tur: 'metin', baslik: 'Paranın değeri sabit değildir.',
        metin: 'Cüzdanındaki 1.000 TL bugün de, bir yıl sonra da 1.000 TL\'dir. Ama bir yıl sonra aynı parayla daha az şey alabilirsin. Fiyatların genel olarak ve sürekli artmasına enflasyon denir.' },
      { tur: 'ornek', baslik: 'Bir market sepeti',
        metin: 'Geçen yıl 1.000 TL olan sepet bu yıl 1.400 TL ise, sepetteki fiyatlar %40 artmıştır. Aynı 1.000 TL artık sepetin yalnızca yaklaşık %71\'ini alabilir.' },
      { tur: 'soru', soru: 'Maaşın bir yılda %30 arttı, fiyatlar ise %40. Ne oldu?',
        secenekler: ['Alım gücüm arttı', 'Alım gücüm değişmedi', 'Alım gücüm yaklaşık %7 azaldı', 'Alım gücüm tam %10 azaldı'],
        dogru: 2,
        aciklama: '1,30 ÷ 1,40 ≈ 0,93. Yani alım gücü yaklaşık %7 azaldı. Oranları çıkarmak (%40 − %30) kabaca bir fikir verir; doğru hesap bölmektir.' },
      { tur: 'metin', baslik: 'Resmî enflasyon: TÜFE',
        metin: 'TÜİK her ay, hanelerin satın aldığı mal ve hizmetlerden oluşan bir sepetin fiyat değişimini açıklar. Ama senin kişisel enflasyonun, kendi harcama sepetine göre bundan farklı olabilir.' },
      { tur: 'metin', baslik: 'Nominal ve reel',
        metin: 'Rakamdaki artışa nominal, alım gücündeki artışa reel değişim denir. Bir zammın, birikimin ya da yatırımın gerçekten kazandırıp kazandırmadığını reel değişim gösterir.' },
      { tur: 'soru', soru: 'Birikimin bir yılda %35 getiri sağladı. Aynı yıl enflasyon %45 oldu. Sonuç ne?',
        secenekler: ['%35 kazandım', 'Reel olarak yaklaşık %7 kaybettim', '%10 kazandım', 'Hiçbir şey değişmedi'],
        dogru: 1,
        aciklama: '1,35 ÷ 1,45 ≈ 0,93. Hesaptaki rakam arttı ama alım gücün yaklaşık %7 azaldı.' },
      { tur: 'ozet', maddeler: [
        'Enflasyon, paranın alım gücünü eritir.',
        'Zam, getiri ve büyümeyi her zaman enflasyonla karşılaştır.',
        'Reel değişim = (1 + nominal) ÷ (1 + enflasyon) − 1'
      ] }
    ],
    bag: { kavramlar: ['enflasyon', 'alim-gucu', 'reel-getiri', 'tufe'], arac: { ad: 'Birikim hedefi aracı', href: 'araclar.html#hedef' } }
  },
  {
    id: 'faiz', yol: 'kisisel', sure: 5,
    baslik: 'Faiz ve bileşik getiri',
    ozet: 'Faizin faizi: zaman nasıl en güçlü yatırım aracına dönüşür?',
    kartlar: [
      { tur: 'metin', baslik: 'Faiz, paranın kirasıdır.',
        metin: 'Başkasının parasını bir süre kullanmanın bedelidir. Bankaya para yatırınca banka sana faiz öder; kredi çekince sen bankaya faiz ödersin.' },
      { tur: 'metin', baslik: 'Basit ve bileşik',
        metin: 'Basit faizde her yıl yalnızca ana para kazanır. Bileşik getiride kazanç da ana paraya eklenir ve bir sonraki yıl o da kazanır. Zaman uzadıkça fark katlanır.' },
      { tur: 'ornek', baslik: '10.000 TL, yıllık %40, 3 yıl',
        metin: 'Basit faizle 22.000 TL olur. Bileşik getiriyle 27.440 TL olur. Aradaki 5.440 TL, faizin faizidir.' },
      { tur: 'soru', soru: 'Aşağıdakilerden hangisi bileşik getirinin etkisini en çok büyütür?',
        secenekler: ['Daha yüksek başlangıç tutarı', 'Daha uzun süre', 'Kazancı sık sık çekmek', 'Daha kısa vade'],
        dogru: 1,
        aciklama: 'Başlangıç tutarı sonucu aynı oranda büyütür. Süre ise katlayarak büyütür; her yıl bir öncekinin üzerine eklenir. Kazancı çekmek bileşik etkiyi durdurur.' },
      { tur: 'metin', baslik: 'Aynı etki borçta da çalışır.',
        metin: 'Kredi kartı borcunu ertelediğinde, faizin de faizini ödersin. Bileşik getiri birikimde lehine, borçta aleyhine çalışır.' },
      { tur: 'soru', soru: 'Yıllık %40 bileşik getiriyle para yaklaşık kaç yılda iki katına çıkar?',
        secenekler: ['1 yıl', '2 yıl', '3 yıl', '5 yıl'],
        dogru: 1,
        aciklama: '1,40 × 1,40 = 1,96. Yani yaklaşık 2 yılda iki katına çıkar. Pratik bir kural: 72\'yi yüzde getiriye bölmek (72 ÷ 40 ≈ 1,8) kabaca bir tahmin verir.' },
      { tur: 'ozet', maddeler: [
        'Bileşik getiride kazanç da kazanç üretir.',
        'Süre, etkiyi katlayarak büyütür: erken başlamak çoğu zaman çok yatırmaktan etkilidir.',
        'Aynı etki borçta aleyhine çalışır.'
      ] }
    ],
    bag: { kavramlar: ['faiz', 'bilesik-getiri', 'reel-getiri'], arac: { ad: 'Erken başlamanın gücü', href: 'araclar.html#erken' } }
  },
  {
    id: 'borc', yol: 'kisisel', sure: 6,
    baslik: 'Borcu yönetmek',
    ozet: 'Kredinin gerçek maliyeti ve asgari ödemenin tuzağı.',
    kartlar: [
      { tur: 'metin', baslik: 'Borcun bedeli, toplam faizdir.',
        metin: 'Aylık taksit küçük görünebilir. Asıl soru, borç bittiğinde toplam ne kadar geri ödediğindir.' },
      { tur: 'ornek', baslik: '250.000 TL, aylık %3,49, 24 ay',
        metin: 'Aylık taksit 15.552 TL. Toplam geri ödeme 373.245 TL. Yani borç aldığın 250.000 TL için 123.245 TL faiz ödersin.' },
      { tur: 'soru', soru: 'İki banka aynı aylık faizi ilan ediyor. Kredileri neyle karşılaştırmalısın?',
        secenekler: ['Aylık taksit tutarıyla', 'Yıllık maliyet oranı ve toplam geri ödemeyle', 'Bankanın büyüklüğüyle', 'Yalnızca vadeyle'],
        dogru: 1,
        aciklama: 'Faiz dışındaki masraflar ve vergiler eklendiğinde aynı faizli iki kredinin maliyeti farklı olabilir. Yıllık maliyet oranı bunların hepsini içerir.' },
      { tur: 'metin', baslik: 'Asgari ödemenin tuzağı',
        metin: 'Asgari ödeme borcun bir yüzdesidir. Borç küçüldükçe asgari tutar da küçülür; bu yüzden borç çok yavaş biter ve kalan borca her ay faiz işler.' },
      { tur: 'ornek', baslik: '50.000 TL kart borcu, aylık %4,25 faiz',
        metin: 'Hep %20 asgari ödersen borç 3 yıl 4 ay sürer ve 10.232 TL faiz ödersin. Her ay 12.000 TL ödersen 5 ayda biter ve 3.736 TL faiz ödersin. Vergiler hariç.' },
      { tur: 'soru', soru: 'Kart borcunu daha düşük faizli bir krediyle kapattın. En büyük risk nedir?',
        secenekler: ['Kredi notunun anında düşmesi', 'Kartı yeniden doldurup borcu ikiye katlamak', 'Faizin sıfırlanması', 'Hiçbir risk yoktur'],
        dogru: 1,
        aciklama: 'Kart boşalınca yeniden harcamak kolaydır. O zaman hem kredi taksiti hem de yeni kart borcu olur.' },
      { tur: 'ozet', maddeler: [
        'Taksite değil, toplam geri ödemeye bak.',
        'Kredileri yıllık maliyet oranıyla karşılaştır.',
        'Asgari ödeme bir çözüm değil, bir ertelemedir.'
      ] }
    ],
    bag: { kavramlar: ['asgari-odeme', 'yillik-maliyet-orani', 'kredi-notu'], arac: { ad: 'Asgari ödeme simülatörü', href: 'araclar.html#asgari' } }
  },
  {
    id: 'butce', yol: 'kisisel', sure: 5,
    baslik: 'Bütçe ve acil durum fonu',
    ozet: 'Paranın haritasını çıkar, beklenmedik günlere hazırlan.',
    kartlar: [
      { tur: 'metin', baslik: 'Bütçe, paranın haritasıdır.',
        metin: 'Amaç kendini kısıtlamak değil, paranın nereye gittiğini bilmektir. İlk adım basit: bir ay boyunca her harcamayı kaydetmek.' },
      { tur: 'metin', baslik: 'Önce kendine öde.',
        metin: 'Maaş yatar yatmaz birikim payını ayır, kalanını harca. Ay sonunda artanı biriktirmeye çalışmak çoğu zaman işe yaramaz.' },
      { tur: 'ornek', baslik: '50/30/20 kuralı',
        metin: 'Aylık net gelir 20.000 TL ise: 10.000 TL ihtiyaçlara (kira, fatura, market), 6.000 TL isteklere, 4.000 TL birikime. Oranları kendi hayatına göre ayarlayabilirsin.' },
      { tur: 'soru', soru: 'Acil durum fonu için en önemli özellik hangisidir?',
        secenekler: ['Yüksek getiri', 'Hızlı ve değer kaybetmeden ulaşılabilmesi', 'Uzun vadeli olması', 'Döviz cinsinden olması'],
        dogru: 1,
        aciklama: 'Acil durum fonu getiri için değil güvence için tutulur. İhtiyaç anında hemen ve kayıpsız kullanılabilmelidir.' },
      { tur: 'metin', baslik: 'Ne kadar olmalı?',
        metin: 'Genellikle 3 ila 6 aylık zorunlu gider önerilir. İşin ne kadar güvenceliyse alt sınıra, gelirin ne kadar dalgalıysa üst sınıra yakın olmalı.' },
      { tur: 'soru', soru: 'Aylık zorunlu giderin 18.000 TL. 3–6 aylık acil durum fonu hangi aralıkta olur?',
        secenekler: ['18.000 – 36.000 TL', '54.000 – 108.000 TL', '36.000 – 72.000 TL', '108.000 – 216.000 TL'],
        dogru: 1,
        aciklama: '18.000 × 3 = 54.000 TL, 18.000 × 6 = 108.000 TL.' },
      { tur: 'ozet', maddeler: [
        'Önce paranın nereye gittiğini gör.',
        'Birikimi otomatikleştir: önce kendine öde.',
        'Acil durum fonu, diğer tüm finansal adımların temelidir.'
      ] }
    ],
    bag: { kavramlar: ['butce', 'acil-durum-fonu', 'likidite'], arac: { ad: 'Birikim hedefi aracı', href: 'araclar.html#hedef' } }
  },
  {
    id: 'bilanco', yol: 'borsa', sure: 6,
    baslik: 'Bilanço okumaya giriş',
    ozet: 'Bir şirketin sahip oldukları ve bunları nasıl finanse ettiği.',
    kartlar: [
      { tur: 'metin', baslik: 'Bir şirketin fotoğrafı',
        metin: 'Bilanço, belirli bir gündeki durumu gösterir: bir tarafta şirketin sahip oldukları (varlıklar), diğer tarafta bunları neyle finanse ettiği (borçlar ve özkaynak). İki taraf her zaman eşittir.' },
      { tur: 'metin', baslik: 'Dönen ve duran varlıklar',
        metin: 'Dönen varlıklar bir yıl içinde nakde dönmesi beklenenlerdir: kasa, alacaklar, stoklar. Duran varlıklar uzun süre kullanılanlardır: fabrika, makine, bina.' },
      { tur: 'soru', soru: 'Bir şirketin varlıkları 10 milyar TL, yükümlülükleri 6 milyar TL. Özkaynağı ne kadar?',
        secenekler: ['16 milyar TL', '4 milyar TL', '6 milyar TL', '10 milyar TL'],
        dogru: 1,
        aciklama: 'Varlıklar = Yükümlülükler + Özkaynaklar. Yani özkaynak = 10 − 6 = 4 milyar TL.' },
      { tur: 'metin', baslik: 'Kısa vadeli borçlar',
        metin: 'Bir yıl içinde ödenecek borçların, bir yıl içinde nakde dönecek varlıklarla karşılanıp karşılanamadığını cari oran gösterir: dönen varlıklar ÷ kısa vadeli yükümlülükler.' },
      { tur: 'soru', soru: 'Dönen varlıklar 4.000, kısa vadeli yükümlülükler 2.500 milyon TL. Cari oran kaç?',
        secenekler: ['0,6', '1,6', '2,5', '6,5'],
        dogru: 1,
        aciklama: '4.000 ÷ 2.500 = 1,6. Şirketin her 1 TL kısa vadeli borcuna karşılık 1,6 TL dönen varlığı var.' },
      { tur: 'metin', baslik: 'Nerede bulurum?',
        metin: 'Halka açık şirketlerin bilançosu KAP\'ta, finansal rapor bildirimlerinde "Finansal Durum Tablosu" başlığıyla yer alır.' },
      { tur: 'ozet', maddeler: [
        'Varlıklar = Yükümlülükler + Özkaynaklar',
        'Özkaynak, borçlar ödendiğinde ortaklara kalan kısımdır.',
        'Cari oran, kısa vadeli ödeme gücünü gösterir; sektörüyle birlikte okunmalıdır.'
      ] }
    ],
    bag: { kavramlar: ['bilanco', 'ozkaynak', 'cari-oran', 'kap'], ders: { ad: 'Bilanço: ayrıntılı anlatım', href: 'ogren.html#bilanco' } }
  },
  {
    id: 'degerleme', yol: 'borsa', sure: 6,
    baslik: 'Değerleme: F/K ve PD/DD',
    ozet: 'Bir hissenin ucuz mu pahalı mı olduğunu nasıl düşünürüz?',
    kartlar: [
      { tur: 'metin', baslik: 'Hisse fiyatı ucuzluğu söylemez.',
        metin: '5 TL\'lik bir hisse, 500 TL\'lik bir hisseden daha pahalı olabilir. Önemli olan şirketin toplam değeridir: piyasa değeri = hisse fiyatı × toplam pay sayısı.' },
      { tur: 'metin', baslik: 'F/K: kârın kaç katı?',
        metin: 'F/K = piyasa değeri ÷ yıllık net kâr. Yatırımcıların, şirketin bir yıllık kârı için kaç katı ödemeye razı olduğunu gösterir.' },
      { tur: 'soru', soru: 'Piyasa değeri 8 milyar TL, yıllık net kârı 1 milyar TL olan şirketin F/K oranı kaçtır?',
        secenekler: ['0,125', '8', '9', '80'],
        dogru: 1,
        aciklama: '8 milyar ÷ 1 milyar = 8. Bugünkü kâr sabit kalsa, piyasa değerini kazanmak 8 yıl sürerdi.' },
      { tur: 'metin', baslik: 'PD/DD: özkaynağın kaç katı?',
        metin: 'PD/DD = piyasa değeri ÷ özkaynak. Piyasanın şirkete, bilançodaki özkaynağının kaç katı değer biçtiğini gösterir. Bankalar ve holdingler için özellikle önemlidir.' },
      { tur: 'soru', soru: 'Bir şirketin PD/DD oranı 0,7. Bu ne anlatır?',
        secenekler: ['Hisse kesinlikle ucuzdur', 'Piyasa değeri özkaynağının altında; nedenini araştırmak gerekir', 'Şirket zarar ediyordur', 'Şirketin hiç borcu yoktur'],
        dogru: 1,
        aciklama: '1\'in altındaki PD/DD bir fırsat olabilir; ama piyasa, varlıkların gerçek değerinden ya da şirketin kâr üretme gücünden şüphe ediyor da olabilir.' },
      { tur: 'metin', baslik: 'Her zaman karşılaştır.',
        metin: 'Hiçbir oranın evrensel bir "iyi" değeri yoktur. Oranları aynı sektördeki şirketlerle ve şirketin kendi geçmişiyle karşılaştır. Döngüsel sektörlerde, zirve kârla hesaplanan düşük F/K yanıltıcı olabilir.' },
      { tur: 'ozet', maddeler: [
        'Fiyatı değil, piyasa değerini düşün.',
        'F/K kârla, PD/DD özkaynakla karşılaştırır.',
        'Düşük oran "ucuz" demek değildir; nedenini araştır.'
      ] }
    ],
    bag: { kavramlar: ['fk', 'pddd', 'piyasa-degeri', 'dongusellik'], ders: { ad: 'Bir hisseyi yedi adımda oku', href: 'analiz.html' } }
  },
  {
    id: 'uc-tablo', yol: 'borsa', sure: 6,
    baslik: 'Üç tablo nasıl bağlanır?',
    ozet: 'Gelir tablosu, bilanço ve nakit akışı: tek hikâyenin üç bölümü.',
    kartlar: [
      { tur: 'metin', baslik: 'Üç ayrı belge değil, tek hikâye.',
        metin: 'Gelir tablosu bir yılda ne kazanıldığını, nakit akışı kasaya gerçekte ne girip çıktığını, bilanço ise yıl sonunda elde ne kaldığını anlatır. Birinde değişen bir rakam, diğer ikisine de yansır.' },
      { tur: 'metin', baslik: 'Birinci bağ: net kâr özkaynağa akar.',
        metin: 'Gelir tablosunun son satırı net kârdır. Kârın ortaklara dağıtılmayan kısmı şirkette kalır ve bilançodaki özkaynağı büyütür. Zarar ise özkaynağı küçültür.' },
      { tur: 'soru', soru: 'Şirket yılı 800 milyon TL net kârla kapattı ve 200 milyon TL temettü dağıttı. Başka bir değişiklik yoksa özkaynak nasıl değişir?',
        secenekler: ['800 milyon TL artar', '600 milyon TL artar', '200 milyon TL azalır', 'Değişmez'],
        dogru: 1,
        aciklama: 'Dağıtılmayan kâr özkaynağa eklenir: 800 − 200 = 600 milyon TL artış.' },
      { tur: 'metin', baslik: 'İkinci bağ: kâr, nakit değildir.',
        metin: 'Satış yapıldığı an kâra yazılır, ama müşteri parayı aylar sonra ödeyebilir. Amortisman ise kârı düşürür ama kasadan para çıkarmaz. Nakit akışı tablosu bu farkları düzelterek net kârdan kasaya giren gerçek paraya ulaşır.' },
      { tur: 'ornek', baslik: 'Laboratuvarda dene',
        metin: 'Şirket laboratuvarında müşterilerin 60 yerine 150 günde ödemesine izin verdiğinde net kâr kuruşu kuruşuna aynı kalır. Ama işletme faaliyetlerinden nakit akışı eksiye döner ve şirket açığı kapatmak için borçlanmak zorunda kalır.' },
      { tur: 'soru', soru: 'Bir şirketin kârı arttı ama kasasındaki nakit azaldı. Bunun olası nedeni hangisidir?',
        secenekler: ['Muhasebe hatası yapılmıştır', 'Alacaklar ve stoklar büyümüş, satışlar henüz tahsil edilmemiştir', 'Amortisman artmıştır', 'Bu imkânsızdır'],
        dogru: 1,
        aciklama: 'Kâr tahakkuk esasına, nakit ise tahsilata bakar. Tahsil edilmemiş satışlar ve depoda bekleyen stok, kârda görünür ama kasada görünmez.' },
      { tur: 'metin', baslik: 'Üçüncü bağ: nakit bilançoya iner.',
        metin: 'Nakit akışı tablosunun son satırı, dönem sonu nakittir. Bu rakam bilançonun varlıklar tarafındaki "nakit ve nakit benzerleri" satırıyla birebir aynıdır. Bu yüzden bilanço her zaman denk kalır.' },
      { tur: 'ozet', maddeler: [
        'Net kâr − dağıtılan temettü = özkaynaktaki artış',
        'Kâr ile nakit farklıdır; farkı alacaklar, stoklar ve amortisman yaratır.',
        'Nakit akışının son satırı, bilançodaki nakittir.'
      ] }
    ],
    bag: { kavramlar: ['gelir-tablosu', 'nakit-akisi', 'bilanco', 'amortisman'], arac: { ad: 'Şirket laboratuvarı', href: 'lab.html' } }
  }
];
