// "Aklına takılan" soru kütüphanesi
//
// Cevaplar ne yapılması gerektiğini söylemez; nasıl düşünüleceğini gösterir.
//
//   id        adres çubuğunda görünen kısa ad (sorular.html#kart-borcu)
//   soru      sorunun kendisi
//   kategori  SORU_KATEGORILERI'ndeki anahtar
//   kisa      tek paragraflık kısa cevap
//   adimlar   "Nasıl düşünmeli?" adımları
//   dikkat    (isteğe bağlı) sık yapılan hata
//   ilgili    sözlükteki ilgili kavramların id'leri
//   arac      (isteğe bağlı) { ad, href }
//   ders      (isteğe bağlı) { ad, href }
//
// Mevzuatla değişen oran ve tutarlar bilerek yazılmadı.

const SORU_KATEGORILERI = {
  borc:     'Borç ve kredi',
  birikim:  'Birikim',
  butce:    'Maaş ve bütçe',
  yatirim:  'Yatırım ve borsa',
  haber:    'Haberi anla'
};

const SORULAR_KUTUPHANE = [

  // ---------- BORÇ VE KREDİ ----------
  {
    id: 'kart-borcu', kategori: 'borc',
    soru: 'Kredi kartı borcumu nasıl kapatırım?',
    kisa: 'Önce borcun büyümesini durdur: karta yeni harcama eklemeyi bırak ve her ay asgariden fazlasını öde. Sonra borçlarını faizlerine göre sırala ve bir kapatma planı yap.',
    adimlar: [
      'Tüm borçlarını tek bir listeye yaz: kalan tutar, aylık faiz ve asgari ödeme.',
      'Borcunu kapatmaya çalıştığın kartla yeni harcama yapma; gerekirse kartı uygulamadan geçici olarak kapat.',
      'Ödemeye bir sıra belirle: en yüksek faizliden başlamak toplam faizi en aza indirir; en küçük borçtan başlamak ise hızlı bir başarı hissi verir. İkisi de işe yarar, önemli olan birini seçip sürdürmek.',
      'Kart borcunu daha düşük faizli bir krediyle kapatmayı düşünüyorsan, iki seçeneği faiz oranıyla değil yıllık maliyet oranı ve toplam geri ödemeyle karşılaştır.',
      'Asgari ödeme simülatöründe farklı aylık tutarları deneyerek borcun ne zaman biteceğini gör.'
    ],
    dikkat: 'Kart borcunu krediyle kapatıp kartı yeniden doldurmak, borcu kapatmak yerine ikiye katlar.',
    ilgili: ['asgari-odeme', 'bilesik-getiri', 'yillik-maliyet-orani', 'kredi-notu'],
    arac: { ad: 'Asgari ödeme simülatörü', href: 'araclar.html#asgari' }
  },
  {
    id: 'kredi-cekmeli-mi', kategori: 'borc',
    soru: 'Kredi çekmeli miyim? Nasıl karar veririm?',
    kisa: 'Kredinin bedeli, toplamda ödeyeceğin faizdir. Bu bedeli, alacağın şeyin sana sağlayacağı faydayla ve beklenmedik bir durumda bile taksitleri ödeyip ödeyemeyeceğinle birlikte tart.',
    adimlar: [
      'Aylık taksite değil, toplam geri ödemeye bak: 250.000 TL\'lik kredi için kaç lira geri ödeyeceksin?',
      'Taksitin gelirine oranını hesapla. Gelirin bir süre azalsa ya da beklenmedik bir masraf çıksa bile ödemeye devam edebilir misin?',
      'Acil durum fonun var mı? Yoksa, taksit döneminde çıkacak bir sorun seni yeni bir borca itebilir.',
      'Alacağın şey zamanla değer mi kaybediyor (telefon, tatil), yoksa gelir mi getiriyor ya da değerini koruyor mu?',
      'Yüksek enflasyon döneminde sabit taksitlerin gerçek yükü zamanla azalır; ama bu yalnızca gelirin de enflasyonla birlikte artıyorsa işe yarar.'
    ],
    dikkat: '"Taksiti küçük" diye karar vermek, vadenin uzadıkça toplam faizin katlandığını gözden kaçırır.',
    ilgili: ['faiz', 'yillik-maliyet-orani', 'acil-durum-fonu', 'enflasyon'],
    arac: { ad: 'Kredi hesaplayıcı', href: 'araclar.html#kredi' }
  },
  {
    id: 'kredi-notu-yukselt', kategori: 'borc',
    soru: 'Kredi notumu nasıl yükseltirim?',
    kisa: 'Kredi notu, geçmiş ödeme alışkanlıklarını yansıtır; hızlı bir yolu yoktur. Zamanında ödemeler, limitlerini sonuna kadar kullanmamak ve kısa sürede çok sayıda başvuru yapmamak notu zamanla yükseltir.',
    adimlar: [
      'Findeks üzerinden kredi raporunu al ve notunu neyin etkilediğine bak.',
      'Tüm taksit ve kart ödemelerini zamanında yap; tek bir gecikme bile notu düşürebilir. Otomatik ödeme talimatı bu konuda yardımcı olur.',
      'Kart limitlerinin tamamını kullanma; kullandığın tutarın toplam limitine oranı notu etkiler.',
      'Kısa sürede birçok bankaya kredi ya da kart başvurusu yapma.',
      'Sabırlı ol: düzenli ödeme geçmişi birkaç ay içinde değil, zamanla etkisini gösterir.'
    ],
    ilgili: ['kredi-notu', 'asgari-odeme']
  },
  {
    id: 'erken-kapama', kategori: 'borc',
    soru: 'Kredimi erken kapatmalı mıyım?',
    kisa: 'Kalan borcun faizi, elindeki paranın başka yerde kazanabileceği (vergi sonrası) getiriden yüksekse, erken kapatmak genellikle kazançlıdır. Tersi durumda parayı tutmak daha mantıklı olabilir.',
    adimlar: [
      'Bankadan kalan anaparayı ve erken kapama tutarını öğren. Tüketici kredilerinde erken ödemede, ödenmemiş dönemlerin faizi düşülür.',
      'Konut kredilerinde banka erken ödeme ücreti alabilir; bunu hesaba kat.',
      'Kredinin faizini, aynı paranın mevduat gibi bir yerde kazanacağı vergi sonrası getiriyle karşılaştır.',
      'Erken kapatmak için acil durum fonunu bozma; beklenmedik bir durumda yeniden ve daha pahalıya borçlanabilirsin.',
      'Enflasyon yüksekse, sabit faizli kredinin kalan taksitleri gerçek değer olarak her ay biraz daha küçülür; bu da erken kapatmanın avantajını azaltır.'
    ],
    ilgili: ['faiz', 'reel-getiri', 'acil-durum-fonu', 'vadeli-mevduat'],
    arac: { ad: 'Kredi hesaplayıcı', href: 'araclar.html#kredi' }
  },

  // ---------- BİRİKİM ----------
  {
    id: 'maas-yatinca', kategori: 'birikim',
    soru: 'Maaşım yatınca ilk ne yapmalıyım?',
    kisa: '"Önce kendine öde": maaş yatar yatmaz zorunlu giderleri ve birikim payını ayır, kalanını harca. Ay sonunda artanı biriktirmeye çalışmak çoğu zaman işe yaramaz, çünkü genellikle artan olmaz.',
    adimlar: [
      'Kira, fatura ve taksit gibi sabit ödemeleri otomatik ödeme talimatına bağla.',
      'Maaş günü için ayrı bir birikim hesabına otomatik transfer talimatı ver; tutar küçük de olsa düzenli olsun.',
      'Acil durum fonun yoksa, birikimin ilk hedefi o olsun.',
      'Kalan tutarı ay boyunca harcayabileceğin para olarak düşün.',
      'Bir ay boyunca harcamalarını kaydet; paranın nereye gittiğini görmek, en etkili bütçe adımıdır.'
    ],
    ilgili: ['butce', 'acil-durum-fonu', 'duzenli-yatirim'],
    arac: { ad: 'Birikim hedefi aracı', href: 'araclar.html#hedef' }
  },
  {
    id: 'acil-fon-nerede', kategori: 'birikim',
    soru: 'Acil durum fonumu nerede tutmalıyım?',
    kisa: 'Acil durum fonu getiri için değil güvence için tutulur. Bu yüzden hızlıca ve değer kaybetmeden ulaşabileceğin bir yerde durmalı; fiyatı dalgalanan yatırımlar bu iş için uygun değildir.',
    adimlar: [
      'Kaç aylık gidere ihtiyacın olduğunu belirle; genellikle 3 ila 6 aylık zorunlu gider önerilir.',
      'Paraya aynı gün ya da birkaç gün içinde ulaşabilmelisin; vadesi dolmadan bozulunca faizi yanan bir hesap bu açıdan dezavantajlıdır.',
      'Fiyatı günlük dalgalanan araçlar (hisse senedi, kripto) tam ihtiyaç anında değer kaybetmiş olabilir.',
      'Yüksek enflasyonda paranın tamamen getirisiz beklemesi de alım gücünü eritir; kısa vadeli, düşük riskli seçeneklerin getirisini ve likiditesini karşılaştır.',
      'Fonu kullandığında, ilk iş onu yeniden doldurmak olsun.'
    ],
    ilgili: ['acil-durum-fonu', 'likidite', 'vadeli-mevduat', 'volatilite']
  },
  {
    id: 'enflasyonda-birikim', kategori: 'birikim',
    soru: 'Enflasyon yüksekken birikimimi nasıl korurum?',
    kisa: 'Amaç, rakamın değil alım gücünün korunması; yani birikimin enflasyondan hızlı büyümesi. Bunu garanti eden tek bir araç yoktur; her birinin getirisi farklı bir riske dayanır.',
    adimlar: [
      'Birikiminin yıllık getirisini enflasyonla karşılaştır; reel getirin pozitif mi?',
      'Getirinin vergi sonrası olduğundan emin ol; brüt faiz yanıltıcı olabilir.',
      'Paraya ne zaman ihtiyacın olacağını belirle: kısa vadeli birikimde güvenlik, uzun vadelide büyüme daha önemlidir.',
      'Tüm birikimini tek bir araca bağlama; farklı risklere dayanan araçlara dağıtmak kayıp riskini sınırlar.',
      '"Enflasyonun çok üzerinde garanti getiri" vaatlerine karşı dikkatli ol; risk ile getiri her zaman birlikte gelir.'
    ],
    ilgili: ['reel-getiri', 'enflasyon', 'cesitlendirme', 'risk-getiri', 'stopaj'],
    arac: { ad: 'Birikim hedefi aracı', href: 'araclar.html#hedef' }
  },
  {
    id: 'altin-doviz-mevduat', kategori: 'birikim',
    soru: 'Altın mı, döviz mi, mevduat mı?',
    kisa: 'Tek bir doğru cevap yok. Mevduatın getirisi faizden, dövizin getirisi kurdaki değişimden, altının getirisi ise ons fiyatı ile kurdan gelir. Her birinin riski de getirisinin kaynağıyla aynı yerdedir.',
    adimlar: [
      'Mevduat: Getiri önceden bellidir ve TL cinsindendir. Risk, faizin enflasyonun altında kalmasıdır.',
      'Döviz: Tek başına faiz getirmez (döviz mevduatının faizi genellikle düşüktür). Getiri tamamen kurun artmasına bağlıdır; kur beklenenden yavaş artarsa ya da düşerse kayıp olur.',
      'Altın: Faiz ya da temettü getirmez. Gram altının TL fiyatı hem dünyadaki ons fiyatına hem de dolar kuruna bağlıdır. Fiziki altında alış ile satış arasındaki fark (makas) maliyettir.',
      'Karar verirken paranın ne zaman lazım olacağını, ne kadar dalgalanmaya dayanabileceğini ve vergi ile makas gibi maliyetleri düşün.',
      'Birbirinden farklı nedenlerle hareket eden varlıklara dağıtmak, tek bir tahmine bağlı kalma riskini azaltır.'
    ],
    dikkat: 'Geçen yıl en çok kazandıran aracın bu yıl da kazandıracağının bir garantisi yoktur.',
    ilgili: ['vadeli-mevduat', 'doviz-kuru', 'altin', 'cesitlendirme', 'reel-getiri']
  },
  {
    id: 'bes-girmeli-mi', kategori: 'birikim',
    soru: 'BES\'e girmeli miyim?',
    kisa: 'BES\'in en büyük avantajı devlet katkısı ve uzun vadede bileşik getiridir. Ama erken çıkarsan devlet katkısının tamamını alamazsın, fon giderleri de getiriyi azaltır. Karar, sistemde ne kadar kalabileceğine bağlıdır.',
    adimlar: [
      'Birikimi uzun yıllar sistemde tutabilecek misin? BES kısa vadeli bir araç değildir.',
      'Devlet katkısının ne kadarını hak edeceğin, sistemde kaldığın süreye bağlıdır; kuralları şirketinden öğren.',
      'Fon dağılımını kendin seçebilirsin: fonların içeriğine, geçmiş getirisine ve giderlerine bak.',
      'Otomatik katılım kapsamındaysan, sistemden çıkmak için tanınan cayma süresini ve sonuçlarını bil.',
      'Aynı parayla sistem dışında neler yapabileceğini de düşün; devlet katkısı bu karşılaştırmada önemli bir artıdır.'
    ],
    ilgili: ['bes', 'yatirim-fonu', 'bilesik-getiri'],
    arac: { ad: 'Erken başlamanın gücü', href: 'araclar.html#erken' }
  },

  // ---------- MAAŞ VE BÜTÇE ----------
  {
    id: 'zam-fakir', kategori: 'butce',
    soru: 'Zam aldım, ama neden daha fakir hissediyorum?',
    kisa: 'Zam oranın, harcadığın şeylerin fiyat artışından düşükse, maaşının rakamı artsa bile alım gücün azalır. Buna ek olarak yıl içinde üst vergi dilimine geçmek de net maaşını düşürebilir.',
    adimlar: [
      'Zam oranını yıllık enflasyonla karşılaştır: %30 zam, %40 enflasyonda alım gücünü yaklaşık %7 azaltır.',
      'Kendi harcama sepetine bak: kira ya da gıda gibi senin için büyük kalemler genel enflasyondan hızlı artıyorsa, hissettiğin enflasyon daha yüksektir.',
      'Net maaşının yıl içinde nasıl değiştiğine bak; vergi dilimi etkisi yılın ikinci yarısında hissedilir.',
      'Karşılaştırmayı tek bir aya göre değil, yıllık toplam net gelire göre yap.'
    ],
    ilgili: ['alim-gucu', 'enflasyon', 'tufe', 'gelir-vergisi-dilimi']
  },
  {
    id: 'maas-neden-dustu', kategori: 'butce',
    soru: 'Brüt maaşım aynı, net maaşım neden yılın ortasında düştü?',
    kisa: 'Gelir vergisi yıl boyunca biriken kazancına göre hesaplanır. Toplam kazancın bir dilim sınırını aştığında, sınırı aşan kısım daha yüksek oranla vergilenir ve eline geçen tutar azalır. Yeni yılda sayaç sıfırlanır.',
    adimlar: [
      'Maaş bordronda "kümülatif vergi matrahı" satırına bak; yıl boyunca artan tutar budur.',
      'Hangi ayda bir dilim sınırını geçtiğini bul; o aydan itibaren kesinti artar.',
      'Bu bir hata değil, artan oranlı vergi sisteminin doğal sonucudur. Yalnızca sınırı aşan kısım daha yüksek oranla vergilenir; toplamda zam yine de kazandırır.',
      'Yıllık bütçeni yaparken yılın son aylarındaki daha düşük net maaşı hesaba kat.'
    ],
    ilgili: ['gelir-vergisi-dilimi', 'brut-net-maas']
  },
  {
    id: 'taksit-pesin', kategori: 'butce',
    soru: 'Taksit mi, peşin mi almalıyım?',
    kisa: 'Taksitli fiyat daha yüksek olsa bile, paran bu sürede başka bir yerde kazanıyorsa taksit daha ucuza gelebilir. Doğru karşılaştırma, taksitlerin bugünkü değerini peşin fiyatla kıyaslamaktır.',
    adimlar: [
      'Vade farkını hesapla: taksitli toplam fiyattan peşin fiyatı çıkar.',
      'Peşin ödemeyip parayı bekletirsen aylık ne kazanırdın (vergi sonrası)?',
      'Taksitli planın gizli faizi bu getiriden düşükse taksit, yüksekse peşin daha avantajlıdır.',
      'Peşin ödemede ek indirim var mı? Bu da karşılaştırmaya girmeli.',
      'Taksitin bütçeni aylarca bağlayacağını ve başka ihtiyaçlarla çakışabileceğini unutma.'
    ],
    ilgili: ['vade-farki', 'faiz', 'enflasyon'],
    arac: { ad: 'Taksit mi, peşin mi? aracı', href: 'araclar.html#taksit' }
  },
  {
    id: 'butce-baslangic', kategori: 'butce',
    soru: 'Bütçe yapmaya nereden başlarım?',
    kisa: 'Bütçe, paranın nereye gittiğini bilmekle başlar. Bir ay boyunca harcamalarını kaydet, kategorilere ayır, sonra gerçekçi hedefler koy. Mükemmel bir tablo değil, sürdürülebilir bir alışkanlık hedefle.',
    adimlar: [
      'Bir ay boyunca her harcamayı kaydet; banka ve kart uygulamalarının harcama özetleri işini kolaylaştırır.',
      'Harcamaları ikiye ayır: sabit (kira, fatura, taksit) ve değişken (market, dışarıda yemek, eğlence).',
      'Değişken harcamalarda seni en çok şaşırtan kalemi bul; en kolay tasarruf genellikle oradadır.',
      'Başlangıç için 50/30/20 gibi basit bir oran dene: ihtiyaçlar, istekler, birikim. Oranları kendi hayatına göre ayarla.',
      'Birikimi otomatikleştir ve ayda bir bütçeni gözden geçir.'
    ],
    ilgili: ['butce', 'acil-durum-fonu'],
    arac: { ad: 'Birikim hedefi aracı', href: 'araclar.html#hedef' }
  },

  // ---------- YATIRIM VE BORSA ----------
  {
    id: 'borsaya-baslamak', kategori: 'yatirim',
    soru: 'Borsaya nasıl başlanır?',
    kisa: 'Teknik olarak kolay: SPK yetkili bir aracı kurumda hesap açarsın. Asıl hazırlık öncesinde: acil durum fonun olmalı, yüksek faizli borcun olmamalı ve aldığın şirketin ne iş yaptığını anlamalısın.',
    adimlar: [
      'Önce temelleri kur: acil durum fonu ve yüksek faizli borçların kapatılması, borsadan önce gelir.',
      'Kısa vadede ihtiyacın olacak parayı borsaya yatırma; fiyatlar aylarca düşük kalabilir.',
      'SPK\'dan yetkili bir aracı kurum ya da banka seç; komisyon oranlarını karşılaştır.',
      'Bir hisse almadan önce şirketin mali tablolarını ve faaliyet raporunu oku; hisse, bir işletmenin ortağı olmaktır.',
      'Tüm parayı tek bir hisseye yatırma; çeşitlendirme ilk kuraldır.'
    ],
    dikkat: 'Başkasının tavsiyesiyle, ne olduğunu anlamadığın bir şirkete yatırım yapmak yatırım değil, tahmindir.',
    ilgili: ['araci-kurum', 'spk', 'hisse-senedi', 'cesitlendirme', 'kap'],
    ders: { ad: 'Bir hisseyi yedi adımda oku', href: 'analiz.html' }
  },
  {
    id: 'hisse-ucuz-mu', kategori: 'yatirim',
    soru: 'Hissenin fiyatı çok düşük, ucuz mu?',
    kisa: 'Hisse fiyatı tek başına ucuzluğu ya da pahalılığı göstermez. 5 TL\'lik bir hisse, 500 TL\'lik bir hisseden daha pahalı olabilir. Önemli olan, şirketin toplam değerinin ürettiği kâra ve sahip olduğu özkaynağa göre nerede durduğudur.',
    adimlar: [
      'Hisse fiyatını değil piyasa değerini düşün: fiyat × toplam pay sayısı.',
      'Piyasa değerini kârla (F/K) ve özkaynakla (PD/DD) karşılaştır.',
      'Bu oranları aynı sektördeki şirketlerle ve şirketin kendi geçmişiyle kıyasla.',
      'Fiyatı sert düşmüş bir hissede, düşüşün nedenini araştır: piyasa bir şeyi fiyatlıyor olabilir.'
    ],
    ilgili: ['piyasa-degeri', 'fk', 'pddd'],
    ders: { ad: 'Temel oranlar', href: 'ogren.html#oranlar' }
  },
  {
    id: 'tuyo-grubu', kategori: 'yatirim',
    soru: 'Sosyal medyada hisse öneren gruplara güvenmeli miyim?',
    kisa: 'Temkinli ol. Türkiye\'de yatırım danışmanlığı yapmak SPK izni gerektirir. "Kesin yükselecek" gibi mesajlar, çoğu zaman bir hisseyi yapay olarak şişirip yükselişte başkalarına satma oyununun parçasıdır.',
    adimlar: [
      'Öneriyi yapan kişi ya da kurum SPK\'dan yetkili mi? Bunu SPK\'nın sitesinden kontrol edebilirsin.',
      'Önerinin arkasında bir analiz var mı, yoksa yalnızca "fırsat kaçıyor" baskısı mı?',
      'Şirketle ilgili iddiayı KAP\'tan doğrula; resmî duyuru yoksa haber de yoktur.',
      'Halka açıklığı düşük hisselerde küçük alımlar fiyatı sert etkiler; bu tür hisseler manipülasyona daha açıktır.',
      'Ücretli "VIP grup" üyelikleri ve kazanç garantisi vaatleri güçlü uyarı işaretleridir.'
    ],
    ilgili: ['pompala-bosalt', 'spk', 'kap', 'halka-aciklik']
  },
  {
    id: 'temettu-iyi-mi', kategori: 'yatirim',
    soru: 'Temettü veren hisse her zaman iyi midir?',
    kisa: 'Düzenli temettü, şirketin nakit ürettiğinin iyi bir işareti olabilir. Ama yüksek temettü verimi her zaman iyi değildir: şirket büyüme fırsatı bulamadığı için ya da borçlanarak temettü dağıtıyor olabilir.',
    adimlar: [
      'Temettünün serbest nakit akışından mı karşılandığına, yoksa borçla mı ödendiğine bak.',
      'Temettü veriminin neden yüksek olduğunu sorgula: fiyat sert düştüğü için mi?',
      'Şirketin temettü geçmişine bak: düzenli mi, yoksa tek seferlik mi?',
      'Temettü verimini mevduat faizi ve enflasyonla karşılaştır.'
    ],
    ilgili: ['temettu', 'temettu-verimi', 'serbest-nakit-akisi']
  },
  {
    id: 'bedelsiz-zengin', kategori: 'yatirim',
    soru: 'Bedelsiz sermaye artırımı beni zengin eder mi?',
    kisa: 'Hayır. Bedelsizde elindeki pay sayısı artar ama hisse fiyatı aynı oranda düzeltilir; yatırımının toplam değeri değişmez. Şirketin değeri, kârı ya da varlıkları bir anda artmaz.',
    adimlar: [
      '%100 bedelsizde 100 payın 200 olur, fiyat yaklaşık yarıya iner: 100 × 50 TL = 200 × 25 TL.',
      'Bedelsiz haberiyle yaşanan hızlı fiyat artışları, şirketin gerçek değerindeki bir değişimden kaynaklanmaz.',
      'Değerlendirmeyi bedelsize göre değil, şirketin kârına, nakit akışına ve değerlemesine göre yap.'
    ],
    ilgili: ['bedelsiz', 'bedelli', 'piyasa-degeri']
  },
  {
    id: 'halka-arz-katilim', kategori: 'yatirim',
    soru: 'Halka arzlar hep kazandırır mı?',
    kisa: 'Hayır. Bazı halka arzlar ilk günlerde yükselir, bazıları ise halka arz fiyatının altına düşer. Her halka arzı ayrı bir şirket olarak değerlendirmek gerekir; bunun için en önemli belge izahnamedir.',
    adimlar: [
      'İzahnamede toplanan paranın nereye gideceğine bak: şirkete mi (büyüme için), yoksa mevcut ortakların cebine mi?',
      'Şirketin son yıllardaki mali tablolarını ve borçluluğunu incele.',
      'Halka arz fiyatının, benzer şirketlerin değerlemesine göre nerede durduğunu karşılaştır.',
      'Dağıtılan pay sayısı az olduğunda ilk günlerdeki fiyat hareketleri çok sert olabilir; bu, şirketin değerinden çok arz-talep dengesinden kaynaklanır.'
    ],
    ilgili: ['halka-arz', 'halka-aciklik', 'spk']
  },
  {
    id: 'fon-secimi', kategori: 'yatirim',
    soru: 'Yatırım fonu nasıl seçilir?',
    kisa: 'Önce fonun neye yatırım yaptığını anla, sonra giderlerini ve risk düzeyini kontrol et. Geçmiş getiriye bakarken onu benzer fonlarla ve enflasyonla karşılaştır; geçmiş getiri geleceğin garantisi değildir.',
    adimlar: [
      'Fonun türüne ve içeriğine bak: hisse, tahvil, para piyasası, altın ya da karma mı?',
      'Fonun risk değerine bak; yatırımcı bilgi formunda 1 (düşük) ile 7 (yüksek) arasında gösterilir.',
      'Yönetim ücretini ve toplam gider oranını karşılaştır; uzun vadede getiriyi belirgin şekilde etkiler.',
      'Geçmiş getiriyi aynı türdeki fonlarla ve enflasyonla karşılaştır; tek bir iyi yıla değil, birkaç yıla bak.',
      'Fonları TEFAS üzerinden karşılaştırabilirsin.'
    ],
    ilgili: ['yatirim-fonu', 'cesitlendirme', 'risk-getiri']
  },

  // ---------- HABERİ ANLA ----------
  {
    id: 'baz-puan', kategori: 'haber',
    soru: '"Merkez Bankası politika faizini 250 baz puan artırdı." Ne demek?',
    kisa: '100 baz puan, 1 puan demektir. Yani faiz 2,5 puan arttı; örneğin %40\'tan %42,5\'e çıktı. Bu karar genellikle kredileri pahalandırır, mevduat faizlerini yükseltir ve enflasyonu düşürmeyi amaçlar.',
    adimlar: [
      'Baz puanı puana çevir: 250 baz puan = 2,5 puan. "%2,5 arttı" demek yanlış olur; %40\'ın %2,5 artışı %41 ederdi.',
      'Kredi çekmeyi düşünüyorsan: bankaların kredi faizleri genellikle yükselir.',
      'Birikimin varsa: mevduat faizleri genellikle yükselir.',
      'Borsa ve kur: etkisi piyasanın kararı önceden ne kadar beklediğine bağlıdır; beklenen bir artış çoğu zaman fiyatlara zaten yansımıştır.',
      'Asıl soru: faiz enflasyonun üzerinde mi? Reel faiz, kararın gerçek sıkılığını gösterir.'
    ],
    ilgili: ['politika-faizi', 'faiz', 'reel-getiri', 'enflasyon']
  },
  {
    id: 'enflasyon-dustu', kategori: 'haber',
    soru: '"Yıllık enflasyon düştü." Ama fiyatlar neden hâlâ artıyor?',
    kisa: 'Enflasyonun düşmesi, fiyatların düşmesi değil, daha yavaş artması demektir. Yıllık enflasyon %60\'tan %40\'a düştüğünde fiyatlar hâlâ bir yıl öncesine göre %40 daha yüksektir.',
    adimlar: [
      'Fiyatların gerçekten düşmesine "deflasyon" denir; bu, enflasyonun düşmesinden farklıdır.',
      'Yıllık oran, son 12 aydaki değişimi gösterir. Aylık oranlar hâlâ artıdaysa fiyatlar artmaya devam eder.',
      'Geçen yılın aynı ayında çok yüksek bir artış varsa, yıllık oran bu ay kendiliğinden düşük görünebilir; buna "baz etkisi" denir.',
      'Kendi harcama sepetine bak: kira gibi senin için büyük kalemler genel ortalamadan farklı hareket edebilir.'
    ],
    ilgili: ['enflasyon', 'tufe', 'alim-gucu']
  },
  {
    id: 'borsa-rekor', kategori: 'haber',
    soru: '"Borsa rekor kırdı." Herkes kazandı mı?',
    kisa: 'Hayır. Rekor, genellikle BIST 100 endeksinin TL cinsinden en yüksek seviyesidir. Endeks yükselirken birçok hisse düşebilir; ayrıca TL\'nin değer kaybı ve enflasyon hesaba katıldığında rekor o kadar parlak olmayabilir.',
    adimlar: [
      'Endeks, büyük şirketlerin ortalama gidişatını gösterir; senin hisselerin farklı hareket edebilir.',
      'TL cinsinden rekoru, aynı dönemdeki enflasyonla karşılaştır; reel olarak yükseliş var mı?',
      'Dolar bazında da bak: yabancı bir yatırımcı için rekor aynı anlama gelmeyebilir.',
      'Rekor seviyeler, gelecekteki getiri hakkında tek başına bir şey söylemez.'
    ],
    ilgili: ['endeks', 'enflasyon', 'doviz-kuru', 'reel-getiri']
  },
  {
    id: 'dolar-rekor', kategori: 'haber',
    soru: '"Dolar/TL rekor kırdı." Bu beni nasıl etkiler?',
    kisa: 'Kur artışı, ithal ürünlerin ve dövize bağlı fiyatların TL karşılığını artırır; bu da zamanla enflasyona yansır. Döviz borcu olanlar zarar görürken, ihracat yapan şirketler ve dövizde birikimi olanlar TL bazında kazanır.',
    adimlar: [
      'Günlük hayat: elektronik, otomobil, akaryakıt gibi dövizle ilişkili ürünlerin fiyatları genellikle artar.',
      'Birikim: TL birikimin döviz karşılığında değer kaybeder; döviz birikiminin TL karşılığı artar.',
      'Şirketler: geliri dövizde, borcu TL\'de olan şirketler kazanır; tersi durumda olanlar zorlanır.',
      'Tek günlük bir rekor yerine, kurun enflasyona göre nasıl hareket ettiğine bak.'
    ],
    ilgili: ['doviz-kuru', 'enflasyon', 'altin']
  },
  {
    id: 'resesyon-haberi', kategori: 'haber',
    soru: '"Ekonomi daraldı, resesyon kapıda." Ne demek?',
    kisa: 'Ekonominin toplam üretimi (GSYH) bir önceki döneme göre küçüldü demektir. Arka arkaya iki çeyrek daralma yaygın olarak resesyon olarak adlandırılır. Bu dönemlerde işsizlik ve şirket kârları genellikle olumsuz etkilenir.',
    adimlar: [
      'Daralmanın hangi sektörlerde yaşandığına bak; her sektör aynı şekilde etkilenmez.',
      'Kendi durumun için: işin ne kadar güvende, acil durum fonun yeterli mi?',
      'Borsada döngüsel sektörler (otomotiv, inşaat, çelik) genellikle daha sert etkilenir.',
      'Ekonomik veriler sonradan revize edilebilir; tek bir açıklamaya göre ani kararlar verme.'
    ],
    ilgili: ['resesyon', 'gsyh', 'dongusellik', 'acil-durum-fonu']
  }
];
