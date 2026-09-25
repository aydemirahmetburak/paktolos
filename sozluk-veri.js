// Paktolos Finans Sözlüğü
//
// Her kavram:
//   id          adres çubuğunda görünen kısa ad (sozluk.html#enflasyon)
//   terim       kavramın adı
//   kategori    KATEGORILER'deki anahtar
//   kisa        tek cümlelik özet (kartta görünür)
//   aciklama    sade dille ne demek
//   ornek       günlük hayattan örnek
//   degerlendir nasıl yorumlanmalı, nelere dikkat edilmeli
//   ilgili      ilgili kavramların id'leri
//   hesap       (isteğe bağlı) kavramın içinde açılan mini hesaplayıcı
//   ogren       (isteğe bağlı) sitede ayrıntılı anlatıldığı yer
//
// Değişen oranlar (vergi oranları, sigorta limitleri vb.) bilerek
// yazılmadı; bunlar mevzuatla güncellenir.

const KATEGORILER = {
  para:    'Para ve bütçe',
  faiz:    'Faiz ve kredi',
  ekonomi: 'Ekonomi',
  yatirim: 'Yatırım',
  borsa:   'Borsa',
  sirket:  'Şirket analizi'
};

const SOZLUK = [

  // ---------- PARA VE BÜTÇE ----------
  {
    id: 'butce', terim: 'Bütçe', kategori: 'para',
    kisa: 'Gelen ve giden paranın önceden yapılmış planı.',
    aciklama: 'Bütçe, bir ay içinde ne kadar para kazanacağını ve bunu nereye harcayacağını önceden yazmaktır. Amaç kendini kısıtlamak değil, paranın nereye gittiğini bilmektir.',
    ornek: 'Yaygın bir başlangıç yöntemi 50/30/20 kuralıdır: gelirin yaklaşık yarısı zorunlu ihtiyaçlara (kira, fatura, market), %30\'u isteklere, %20\'si birikime ayrılır.',
    degerlendir: 'Oranlar herkese uymaz; kiranın gelirin yarısını aştığı bir şehirde bu kural işlemeyebilir. Asıl önemli olan, ay sonunda "para nereye gitti?" sorusunun cevabını bilmektir.',
    ilgili: ['acil-durum-fonu', 'brut-net-maas', 'enflasyon']
  },
  {
    id: 'acil-durum-fonu', terim: 'Acil durum fonu', kategori: 'para',
    kisa: 'Beklenmedik bir harcama için kenarda duran, hemen ulaşılabilir birikim.',
    aciklama: 'İş kaybı, sağlık masrafı ya da bozulan bir beyaz eşya gibi plansız durumlarda borçlanmadan ayakta kalmanı sağlayan paradır. Genellikle 3 ila 6 aylık zorunlu giderin karşılığı kadar tutulması önerilir.',
    ornek: 'Aylık zorunlu giderin 20.000 TL ise, 60.000–120.000 TL arası bir acil durum fonu, işsiz kaldığında 3–6 ay kredi kartına yüklenmeden idare etmeni sağlar.',
    degerlendir: 'Bu para getiri için değil güvence için tutulur; bu yüzden hızlıca ve değer kaybetmeden çekilebilecek bir yerde olmalı. Borsa gibi fiyatı dalgalanan bir yatırımda tutulan para, tam ihtiyaç anında değer kaybetmiş olabilir.',
    ilgili: ['likidite', 'vadeli-mevduat', 'butce']
  },
  {
    id: 'brut-net-maas', terim: 'Brüt ve net maaş', kategori: 'para',
    kisa: 'Brüt, kesintilerden önceki; net, hesabına yatan maaştır.',
    aciklama: 'Brüt maaştan SGK primi, işsizlik sigortası primi, gelir vergisi ve damga vergisi kesilir; geriye kalan net maaştır. İş görüşmelerinde hangi rakamın konuşulduğunu netleştirmek önemlidir.',
    ornek: 'Yıl içinde kazancın biriktikçe üst vergi dilimine geçersin. Bu yüzden brüt maaşın aynı kalsa bile, yılın son aylarında hesabına yatan net maaş düşebilir.',
    degerlendir: 'Bir iş teklifini değerlendirirken yıllık toplam net geliri hesapla. Yan haklar (yemek, yol, özel sağlık sigortası) da gerçek gelirin parçasıdır.',
    ilgili: ['gelir-vergisi-dilimi', 'stopaj', 'butce']
  },
  {
    id: 'gelir-vergisi-dilimi', terim: 'Gelir vergisi dilimi', kategori: 'para',
    kisa: 'Gelir arttıkça, yalnızca artan kısma uygulanan daha yüksek vergi oranı.',
    aciklama: 'Türkiye\'de gelir vergisi artan oranlıdır: gelir belirli sınırları aştıkça vergi oranı yükselir. Önemli nokta, üst oranın gelirin tamamına değil, yalnızca o sınırı aşan kısmına uygulanmasıdır.',
    ornek: '"Zam alırsam üst dilime geçerim, elime daha az geçer" yaygın bir yanılgıdır. Üst dilime geçmek, yalnızca sınırı aşan liraların daha yüksek oranla vergilenmesi demektir; toplamda eline geçen para yine artar.',
    degerlendir: 'Zam ya da ek gelir teklifini vergi dilimi korkusuyla reddetme. Dilim sınırları her yıl güncellenir; güncel tutarlar için Gelir İdaresi Başkanlığı\'na bak.',
    ilgili: ['brut-net-maas', 'stopaj']
  },
  {
    id: 'likidite', terim: 'Likidite', kategori: 'para',
    kisa: 'Bir varlığın değer kaybetmeden ne kadar hızlı nakde çevrilebildiği.',
    aciklama: 'Nakit en likit varlıktır. Bankadaki vadesiz hesap da çok likittir. Bir ev ise düşük likittir: satmak haftalar ya da aylar sürer ve acele edersen fiyat kırman gerekir.',
    ornek: 'Acil 50.000 TL\'ye ihtiyacın olduğunda, arsan olması seni kurtarmaz; o gün satamazsın. Vadesiz hesaptaki para ise hemen kullanılabilir.',
    degerlendir: 'Birikimlerinin bir kısmını mutlaka likit tut. Şirketler için de aynısı geçerlidir: kâğıt üzerinde zengin ama nakitsiz bir şirket, borcunu ödeyemeyebilir. Şirketlerde bunun göstergesi cari orandır.',
    ilgili: ['acil-durum-fonu', 'cari-oran', 'nakit-akisi']
  },
  {
    id: 'vade-farki', terim: 'Taksit ve vade farkı', kategori: 'para',
    kisa: 'Taksitli fiyat ile peşin fiyat arasındaki fark; aslında bir faizdir.',
    aciklama: 'Bir ürünün peşin fiyatı 10.000 TL, 6 taksitli fiyatı 11.200 TL ise aradaki 1.200 TL vade farkıdır. Mağaza sana 6 ay boyunca borç vermiş ve bunun faizini fiyata eklemiştir.',
    ornek: 'Vade farksız taksit ise tersine işler: yüksek enflasyon döneminde parayı hemen değil aylar içinde ödemek, ödediğin paranın alım gücünün azalması sayesinde alıcının lehinedir.',
    degerlendir: 'Taksitli alışverişte "aylık ne kadar?" değil "toplam ne kadar?" diye sor. Vade farkını peşin fiyata bölerek ödediğin örtük faizi hesaplayabilirsin.',
    ilgili: ['faiz', 'enflasyon', 'yillik-maliyet-orani']
  },
  {
    id: 'bes', terim: 'Bireysel Emeklilik (BES)', kategori: 'para',
    kisa: 'Emeklilik için gönüllü, devlet katkılı uzun vadeli birikim sistemi.',
    aciklama: 'BES\'te düzenli olarak ödediğin katkı payları, seçtiğin emeklilik fonlarında değerlendirilir. Devlet de ödediğin tutarın belirli bir oranında katkı ekler. Otomatik katılım kapsamındaki çalışanlar maaşlarından kesintiyle sisteme dahil edilir.',
    ornek: 'Sistemden erken çıkarsan devlet katkısının tamamını alamazsın; alabileceğin kısım sistemde kaldığın süreye göre kademeli olarak artar.',
    degerlendir: 'BES uzun vadeli bir araçtır. Fon seçimi getiriyi belirler: fonların dağılımına ve fon toplam gider oranına bak. Devlet katkısı oranları ve hak ediş kuralları mevzuatla değişebilir.',
    ilgili: ['yatirim-fonu', 'bilesik-getiri', 'cesitlendirme']
  },

  // ---------- FAİZ VE KREDİ ----------
  {
    id: 'faiz', terim: 'Faiz', kategori: 'faiz',
    kisa: 'Paranın kirası: borç alanın ödediği, parasını verenin kazandığı bedel.',
    aciklama: 'Bir süreliğine başkasının parasını kullanmanın bedelidir. Bankaya para yatırdığında banka sana faiz öder; kredi çektiğinde sen bankaya faiz ödersin.',
    ornek: '100.000 TL\'yi yıllık %40 faizle bir yıllığına yatırırsan, yıl sonunda brüt 40.000 TL faiz alırsın.',
    degerlendir: 'Faiz oranını tek başına değil enflasyonla birlikte düşün. %40 faiz, %50 enflasyonda paranın alım gücünü korumaya yetmez.',
    ilgili: ['reel-getiri', 'bilesik-getiri', 'politika-faizi', 'kar-payi']
  },
  {
    id: 'reel-getiri', terim: 'Nominal ve reel getiri', kategori: 'faiz',
    kisa: 'Nominal getiri rakamdaki artış; reel getiri, enflasyondan arındırılmış gerçek kazançtır.',
    aciklama: 'Paran %45 arttıysa nominal getirin %45\'tir. Ama aynı dönemde fiyatlar da %35 arttıysa, satın alma gücün çok daha az artmıştır. Reel getiri bu farkı gösterir.',
    ornek: 'Formül: (1 + nominal getiri) ÷ (1 + enflasyon) − 1. %45 faiz ve %35 enflasyonda reel getiri: 1,45 ÷ 1,35 − 1 ≈ %7,4. Basitçe çıkarmak (%10) yanıltıcıdır.',
    degerlendir: 'Bir yatırımın gerçekten kazandırıp kazandırmadığını anlamak için her zaman reel getiriye bak. Reel getiri negatifse, hesabındaki rakam artsa bile aslında fakirleşiyorsun.',
    ilgili: ['enflasyon', 'faiz', 'alim-gucu'],
    hesap: 'reel'
  },
  {
    id: 'bilesik-getiri', terim: 'Bileşik getiri', kategori: 'faiz',
    kisa: 'Kazancın da kazanç üretmesi: faizin faizi.',
    aciklama: 'Her dönem kazandığın getiriyi ana paraya ekleyip yeniden yatırırsan, bir sonraki dönem daha büyük bir tutar üzerinden kazanırsın. Zaman uzadıkça bu etki şaşırtıcı ölçüde büyür.',
    ornek: '10.000 TL, yıllık %40 bileşik getiriyle 3 yılda 27.440 TL olur. Basit faizle (kazancı yeniden yatırmadan) 22.000 TL olurdu. Aradaki 5.440 TL, faizin faizidir.',
    degerlendir: 'Bileşik etki borçta da çalışır: kredi kartı borcunu uzatmak, faizin faizini ödemek demektir. Birikimde ise erken başlamak, çok para yatırmaktan çoğu zaman daha etkilidir.',
    ilgili: ['faiz', 'reel-getiri', 'asgari-odeme'],
    hesap: 'bilesik'
  },
  {
    id: 'vadeli-mevduat', terim: 'Vadeli mevduat', kategori: 'faiz',
    kisa: 'Parayı belirli bir süre bankada tutup karşılığında faiz almak.',
    aciklama: 'Parayı 32 gün, 3 ay ya da 1 yıl gibi bir süreliğine bankaya bağlarsın; vade sonunda faiziyle birlikte geri alırsın. Vadesiz hesapta faiz ya çok düşüktür ya da hiç yoktur.',
    ornek: 'Vade dolmadan paranı çekersen, genellikle o döneme ait faizin tamamı ya da bir kısmı yanar.',
    degerlendir: 'Bankaların ilan ettiği faiz genellikle brüttür; ele geçen net faiz, stopaj kesintisinden sonra kalan tutardır. Karşılaştırmayı net getiri ve enflasyon üzerinden yap.',
    ilgili: ['faiz', 'stopaj', 'mevduat-sigortasi', 'reel-getiri']
  },
  {
    id: 'stopaj', terim: 'Stopaj', kategori: 'faiz',
    kisa: 'Gelirden, sana ödenmeden önce kaynağında kesilen vergi.',
    aciklama: 'Mevduat faizi, fon getirisi ya da temettü gibi gelirlerde vergi, parayı ödeyen kurum tarafından baştan kesilir ve devlete yatırılır. Sana kalan tutar vergi sonrası net tutardır.',
    ornek: 'Banka "yıllık %45 faiz" ilan ettiyse, bu brüt orandır. Stopaj kesildikten sonra hesabına geçen net getiri daha düşüktür.',
    degerlendir: 'Farklı yatırım araçlarını karşılaştırırken hepsini vergi sonrası net getiriyle kıyasla. Stopaj oranları araca ve vadeye göre değişir ve dönem dönem güncellenir.',
    ilgili: ['vadeli-mevduat', 'temettu', 'brut-net-maas']
  },
  {
    id: 'mevduat-sigortasi', terim: 'Mevduat sigortası', kategori: 'faiz',
    kisa: 'Banka batarsa, mevduatının belirli bir tutara kadar devlet güvencesinde olması.',
    aciklama: 'Türkiye\'de bankalardaki mevduat, Tasarruf Mevduatı Sigorta Fonu (TMSF) güvencesindedir. Bir banka faaliyetini durdurursa, kişi başına belirli bir tutara kadar olan mevduat geri ödenir.',
    ornek: 'Sigorta limiti her yıl güncellenir. Limitin üzerindeki birikimler için parayı birden fazla bankaya dağıtmak riski azaltır.',
    degerlendir: 'Sigorta kapsamı bankadaki mevduat ve katılım fonları içindir; hisse senedi, yatırım fonu gibi yatırımlar bu güvencenin kapsamında değildir.',
    ilgili: ['vadeli-mevduat', 'risk-getiri']
  },
  {
    id: 'kar-payi', terim: 'Kâr payı (katılım bankacılığı)', kategori: 'faiz',
    kisa: 'Katılım bankalarında faiz yerine ödenen, önceden kesin olmayan getiri.',
    aciklama: 'Katılım bankaları topladıkları fonları ticari işlemlerde kullanır ve elde edilen kârı hesap sahipleriyle paylaşır. Getiri önceden belirli bir oran olarak garanti edilmez; fon havuzunun performansına bağlıdır.',
    ornek: 'Bir katılım hesabının geçmiş dönemde dağıttığı kâr payı oranı ilan edilir, ancak gelecek dönem için kesinlik yoktur.',
    degerlendir: 'Karşılaştırma yaparken geçmiş kâr payı oranlarına ve bunların enflasyonla ilişkisine bak. Katılım fonları da belirli bir tutara kadar TMSF güvencesindedir.',
    ilgili: ['faiz', 'mevduat-sigortasi']
  },
  {
    id: 'yillik-maliyet-orani', terim: 'Yıllık maliyet oranı', kategori: 'faiz',
    kisa: 'Bir kredinin faiz dışındaki masraflar da dahil gerçek yıllık maliyeti.',
    aciklama: 'Kredinin ilan edilen aylık faizi, toplam maliyetin yalnızca bir parçasıdır. Dosya masrafı, sigorta ve vergiler eklendiğinde ortaya çıkan gerçek maliyet, yıllık maliyet oranıyla gösterilir.',
    ornek: 'İki banka aynı aylık faizi ilan edebilir; ama masrafları farklıysa, birinin yıllık maliyet oranı diğerinden belirgin şekilde yüksek olabilir.',
    degerlendir: 'Kredileri faiz oranıyla değil, yıllık maliyet oranı ve toplam geri ödeme tutarıyla karşılaştır. Bankalar bu bilgiyi kredi öncesi bilgi formunda vermek zorundadır.',
    ilgili: ['faiz', 'vade-farki', 'kredi-notu']
  },
  {
    id: 'asgari-odeme', terim: 'Asgari ödeme', kategori: 'faiz',
    kisa: 'Kredi kartı borcunun gecikmeye düşmemek için ödenmesi gereken en düşük kısmı.',
    aciklama: 'Kredi kartı ekstrendeki borcun tamamını değil, yalnızca asgari tutarı ödersen kartın gecikmeye düşmez. Ama kalan borca faiz işler ve bir sonraki ekstreye eklenir.',
    ornek: 'Her ay yalnızca asgariyi ödeyen biri, faizin faizini ödeyerek başlangıçtaki borcun çok daha fazlasını ödeyebilir ve borcu yıllarca sürebilir.',
    degerlendir: 'Asgari ödeme bir çözüm değil, bir erteleme aracıdır. Mümkünse borcun tamamını öde; ödeyemiyorsan faizi daha düşük bir krediyle kart borcunu kapatmayı değerlendir.',
    ilgili: ['bilesik-getiri', 'kredi-notu', 'faiz']
  },
  {
    id: 'kredi-notu', terim: 'Kredi notu', kategori: 'faiz',
    kisa: 'Borçlarını ne kadar düzenli ödediğini gösteren puan.',
    aciklama: 'Türkiye\'de bireysel kredi notu, Kredi Kayıt Bürosu tarafından hesaplanır ve Findeks üzerinden 1 ile 1900 arasında bir puan olarak görülebilir. Bankalar kredi verirken bu puana bakar.',
    ornek: 'Kredi kartı ya da kredi taksitlerinde yaşanan gecikmeler notu düşürür. Kısa sürede çok sayıda kredi başvurusu yapmak da olumsuz etkileyebilir.',
    degerlendir: 'Düzenli ödeme geçmişi zamanla notu yükseltir. Yüksek not, daha kolay ve daha uygun koşullarla kredi almak demektir.',
    ilgili: ['asgari-odeme', 'yillik-maliyet-orani']
  },

  // ---------- EKONOMİ ----------
  {
    id: 'enflasyon', terim: 'Enflasyon', kategori: 'ekonomi',
    kisa: 'Fiyatların genel olarak sürekli yükselmesi; paranın değer kaybetmesi.',
    aciklama: 'Enflasyon, tek bir ürünün değil, genel fiyat seviyesinin artmasıdır. Aynı parayla dün alabildiğinden daha azını bugün alabiliyorsan, paranın alım gücü düşmüştür.',
    ornek: 'Geçen yıl 1.000 TL\'ye aldığın market sepeti bu yıl 1.400 TL ise, o sepetteki enflasyon %40\'tır. Cüzdanındaki 1.000 TL artık sepetin yalnızca yaklaşık %71\'ini alabilir.',
    degerlendir: 'Birikimlerin enflasyondan düşük getiri sağlıyorsa, hesaptaki rakam artsa bile satın alma gücün azalıyordur. Yatırımları, maaş artışlarını ve şirket büyümelerini her zaman enflasyonla karşılaştır.',
    ilgili: ['tufe', 'alim-gucu', 'reel-getiri', 'politika-faizi'],
    hesap: 'alimgucu'
  },
  {
    id: 'tufe', terim: 'TÜFE', kategori: 'ekonomi',
    kisa: 'Tüketici Fiyat Endeksi: resmî enflasyonun ölçüldüğü endeks.',
    aciklama: 'TÜİK her ay, hanelerin satın aldığı mal ve hizmetlerden oluşan bir sepetin fiyat değişimini ölçer. Açıklanan aylık ve yıllık TÜFE değişimi, resmî enflasyon oranıdır.',
    ornek: 'Aylık %3\'lük enflasyon küçük görünebilir, ama 12 ay üst üste gelirse yıllık yaklaşık %42,6 eder (1,03 üzeri 12). Aylık oranlar çarpılarak birikir, toplanarak değil.',
    degerlendir: 'Senin kişisel enflasyonun, harcama sepetine bağlı olarak TÜFE\'den farklı olabilir. Örneğin gelirinin büyük kısmı kiraya gidiyorsa ve kiralar genel enflasyondan hızlı artıyorsa, hissettiğin enflasyon daha yüksektir.',
    ilgili: ['enflasyon', 'alim-gucu']
  },
  {
    id: 'alim-gucu', terim: 'Alım gücü', kategori: 'ekonomi',
    kisa: 'Paranın gerçekte ne kadar mal ve hizmet satın alabildiği.',
    aciklama: 'Maaşının rakamı değil, o maaşla ne alabildiğin önemlidir. Alım gücü, gelirdeki artışın fiyatlardaki artışla karşılaştırılmasıyla anlaşılır.',
    ornek: 'Maaşın %30 artarken fiyatlar %40 arttıysa, alım gücün yaklaşık %7 azalmıştır: 1,30 ÷ 1,40 ≈ 0,93.',
    degerlendir: 'Zam, yatırım getirisi ya da şirket satış büyümesi değerlendirilirken hep aynı soru sorulmalı: enflasyonu geçti mi?',
    ilgili: ['enflasyon', 'reel-getiri', 'tufe'],
    hesap: 'alimgucu'
  },
  {
    id: 'politika-faizi', terim: 'Politika faizi', kategori: 'ekonomi',
    kisa: 'Merkez Bankası\'nın belirlediği ve ekonomideki tüm faizlere yön veren temel faiz.',
    aciklama: 'Türkiye Cumhuriyet Merkez Bankası (TCMB), bankalara borç verirken uyguladığı faiz oranını belirler. Bu oran, mevduat ve kredi faizlerinin çıpasıdır.',
    ornek: 'Politika faizi yükseldiğinde krediler pahalanır, mevduat faizleri artar, harcamalar yavaşlar. Amaç genellikle enflasyonu düşürmektir. Düştüğünde ise tersi olur.',
    degerlendir: 'Faiz kararları borsayı, döviz kurunu ve kredi maliyetlerini doğrudan etkiler. Borçlu şirketler faiz artışlarından olumsuz, bankalar ise marjlarına bağlı olarak farklı etkilenir.',
    ilgili: ['faiz', 'enflasyon', 'doviz-kuru']
  },
  {
    id: 'doviz-kuru', terim: 'Döviz kuru', kategori: 'ekonomi',
    kisa: 'Bir para biriminin başka bir para birimi cinsinden fiyatı.',
    aciklama: 'USD/TRY kuru 40 ise, 1 ABD doları 40 Türk lirasına eşittir. Kurun yükselmesi, Türk lirasının dolara karşı değer kaybettiği anlamına gelir.',
    ornek: 'Kur yükseldiğinde ithal ürünler pahalanır; ihracat yapan bir şirketin ise TL cinsinden gelirleri artar.',
    degerlendir: 'Bir şirketi incelerken gelirlerinin ve borçlarının hangi para biriminde olduğuna bak. Döviz borcu yüksek ama geliri TL olan bir şirket, kur artışında zorlanabilir.',
    ilgili: ['politika-faizi', 'cari-acik', 'altin']
  },
  {
    id: 'gsyh', terim: 'GSYH ve büyüme', kategori: 'ekonomi',
    kisa: 'Bir ülkede bir yılda üretilen tüm mal ve hizmetlerin toplam değeri.',
    aciklama: 'Gayrisafi Yurt İçi Hasıla (GSYH), ekonominin büyüklüğünü ölçer. "Ekonomi %4 büyüdü" denildiğinde kastedilen, enflasyondan arındırılmış (reel) GSYH\'nin %4 artmasıdır.',
    ornek: 'Nominal GSYH yüksek enflasyon döneminde çok hızlı artabilir; ama bu, gerçekten daha fazla üretildiği anlamına gelmez. Reel büyüme gerçek üretim artışını gösterir.',
    degerlendir: 'Büyüme verilerini kişi başına düşen gelirle birlikte düşün. Ekonomi büyürken nüfus da hızla artıyorsa, kişi başına refah artmayabilir.',
    ilgili: ['resesyon', 'enflasyon']
  },
  {
    id: 'resesyon', terim: 'Resesyon', kategori: 'ekonomi',
    kisa: 'Ekonomik faaliyetin belirgin ve yaygın şekilde daralması.',
    aciklama: 'Yaygın kullanımda, GSYH\'nin arka arkaya iki çeyrek küçülmesi resesyon olarak adlandırılır. Bu dönemlerde işsizlik genellikle artar, şirket kârları düşer.',
    ornek: 'Resesyonda ilk etkilenen sektörler genellikle otomobil, beyaz eşya ve inşaat gibi ertelenebilir harcamalara bağlı olanlardır.',
    degerlendir: 'Döngüsel sektörlerdeki şirketlerin kârları resesyonda sert düşebilir. İyi yıllardaki kârı kalıcı sanmamak gerekir.',
    ilgili: ['gsyh', 'dongusellik']
  },
  {
    id: 'cari-acik', terim: 'Cari açık', kategori: 'ekonomi',
    kisa: 'Bir ülkenin dış dünyaya yaptığı ödemelerin, dış dünyadan aldıklarından fazla olması.',
    aciklama: 'Ülke; ithalat, turizm harcamaları ve faiz ödemeleri gibi kalemlerle yurt dışına, kazandığından fazla döviz ödüyorsa cari açık verir. Bu açığın dış borçlanma ya da yabancı yatırımla finanse edilmesi gerekir.',
    ornek: 'Enerji ithalatına bağımlı ülkelerde petrol fiyatlarındaki artış, cari açığı doğrudan büyütür.',
    degerlendir: 'Şirket analizindeki "cari oran" ile karıştırma: cari oran bir şirketin kısa vadeli borç ödeme gücünü gösterir, cari açık ise bir ülkenin dış dengesiyle ilgilidir.',
    ilgili: ['doviz-kuru', 'cari-oran']
  },
  {
    id: 'dongusellik', terim: 'Döngüsellik', kategori: 'ekonomi',
    kisa: 'Bir sektörün kazancının ekonominin iyi ve kötü dönemleriyle birlikte dalgalanması.',
    aciklama: 'Çelik, otomotiv, inşaat ve kimya gibi sektörler döngüseldir: ekonomi canlıyken satışlar ve kârlar hızla artar, durgunlukta sert düşer. Gıda perakendesi gibi sektörler ise daha az etkilenir.',
    ornek: 'Bir çelik üreticisi, çelik fiyatlarının zirvede olduğu bir yılda rekor kâr açıklayabilir; birkaç yıl sonra aynı şirket zarar edebilir.',
    degerlendir: 'Döngüsel şirketlerde tek bir yılın F/K oranı yanıltıcıdır: zirve kârla hesaplanan düşük F/K "ucuzluk" değil, kârın düşeceği beklentisi olabilir. Birkaç yılın ortalamasına bak.',
    ilgili: ['resesyon', 'fk', 'emtia']
  },
  {
    id: 'emtia', terim: 'Emtia', kategori: 'ekonomi',
    kisa: 'Petrol, altın, buğday, bakır gibi standart ham maddeler.',
    aciklama: 'Emtialar, kimin ürettiğinden bağımsız olarak birbirinin aynı sayılan ham maddelerdir. Fiyatları dünya piyasalarında arz ve talebe göre belirlenir ve genellikle dolar cinsindendir.',
    ornek: 'Petrol fiyatı arttığında, havayolu şirketlerinin yakıt maliyeti yükselir; rafineri şirketleri ise farklı şekilde etkilenebilir.',
    degerlendir: 'Bir şirketin hammaddesi ya da ürünü bir emtiaysa, kârı büyük ölçüde o emtianın fiyatına bağlıdır. Emtia fiyatlarını izlemek, şirketi anlamanın parçasıdır.',
    ilgili: ['altin', 'dongusellik', 'doviz-kuru']
  },

  // ---------- YATIRIM ----------
  {
    id: 'risk-getiri', terim: 'Risk ve getiri', kategori: 'yatirim',
    kisa: 'Daha yüksek beklenen getiri, neredeyse her zaman daha yüksek risk demektir.',
    aciklama: 'Risk, beklediğin sonucun gerçekleşmeme ve para kaybetme ihtimalidir. Yatırımcılar ek risk almayı ancak daha yüksek getiri beklentisiyle kabul eder; bu yüzden risk ve getiri birlikte hareket eder.',
    ornek: '"Aylık %20 garantili getiri" gibi vaatler, bu ilişkiye aykırıdır ve dolandırıcılığın en yaygın işaretlerinden biridir.',
    degerlendir: 'Bir yatırımı değerlendirirken "ne kadar kazandırır?" sorusundan önce "en kötü senaryoda ne kadar kaybederim ve buna dayanabilir miyim?" diye sor.',
    ilgili: ['cesitlendirme', 'volatilite', 'kaldirac', 'pompala-bosalt']
  },
  {
    id: 'cesitlendirme', terim: 'Çeşitlendirme', kategori: 'yatirim',
    kisa: 'Riski azaltmak için parayı birbirinden farklı yatırımlara dağıtmak.',
    aciklama: 'Tüm birikimi tek bir hisseye, tek bir sektöre ya da tek bir araca yatırmak, o tek şeyin kötü gitmesi durumunda büyük kayıp demektir. Farklı şekilde hareket eden varlıklara dağıtmak bu riski azaltır.',
    ornek: 'Tüm parası tek bir havayolu hissesinde olan biri, bir salgın döneminde ağır kayıp yaşayabilir. Parası farklı sektörlere ve araçlara dağılmış biri daha az etkilenir.',
    degerlendir: 'Çeşitlendirme kazancı sınırlar ama kaybı da sınırlar. Aynı sektördeki beş hisse gerçek bir çeşitlendirme değildir; birlikte düşüp birlikte yükselirler.',
    ilgili: ['portfoy', 'risk-getiri', 'yatirim-fonu']
  },
  {
    id: 'portfoy', terim: 'Portföy', kategori: 'yatirim',
    kisa: 'Bir kişinin sahip olduğu tüm yatırımların toplamı.',
    aciklama: 'Mevduat, altın, döviz, hisse senedi, fon gibi tüm yatırımların bir arada düşünülmesidir. İyi bir portföy, kişinin hedeflerine, süresine ve risk toleransına göre şekillenir.',
    ornek: 'Beş yıl sonra ev almayı planlayan biriyle, 30 yıl sonra emekli olacak birinin portföyü aynı olmamalıdır.',
    degerlendir: 'Portföyünü tek tek yatırımlar olarak değil, bütün olarak değerlendir: bir yatırım düşerken diğeri dengeleyebilir.',
    ilgili: ['cesitlendirme', 'risk-getiri']
  },
  {
    id: 'yatirim-fonu', terim: 'Yatırım fonu', kategori: 'yatirim',
    kisa: 'Birçok kişinin parasının bir havuzda toplanıp profesyonelce yönetilmesi.',
    aciklama: 'Fonlar, topladıkları parayı belirli bir stratejiye göre hisse, tahvil, altın gibi varlıklara yatırır. Az parayla bile çeşitlendirilmiş bir portföye sahip olmayı sağlar. Türkiye\'deki fonlar TEFAS üzerinden karşılaştırılıp alınabilir.',
    ornek: 'Tek başına 20 farklı hisse almak yerine, bu hisseleri içeren bir hisse senedi fonuna yatırım yapılabilir.',
    degerlendir: 'Fonun geçmiş getirisini hem enflasyonla hem de benzer fonlarla karşılaştır. Yönetim ücretini ve fon toplam gider oranını mutlaka kontrol et; uzun vadede getiriyi belirgin şekilde etkiler.',
    ilgili: ['cesitlendirme', 'bes', 'tahvil-bono']
  },
  {
    id: 'tahvil-bono', terim: 'Tahvil ve bono', kategori: 'yatirim',
    kisa: 'Devletin ya da şirketlerin borçlanmak için çıkardığı borç senetleri.',
    aciklama: 'Tahvil aldığında, ihraç edene borç vermiş olursun; vade sonunda anaparanı ve faizini geri alırsın. Vadesi bir yıldan kısa olanlara bono, uzun olanlara tahvil denir.',
    ornek: 'Devlet iç borçlanma senetleri (DİBS) Hazine tarafından ihraç edilir. Şirketler de "özel sektör tahvili" çıkararak yatırımcılardan borç alabilir.',
    degerlendir: 'Tahvil fiyatları faizlerle ters yönde hareket eder: faizler yükselince eldeki eski tahvillerin fiyatı düşer. Şirket tahvillerinde getiri yüksek olabilir ama şirketin borcunu ödeyememe riski de vardır.',
    ilgili: ['eurobond', 'faiz', 'yatirim-fonu']
  },
  {
    id: 'eurobond', terim: 'Eurobond', kategori: 'yatirim',
    kisa: 'Döviz cinsinden çıkarılmış, genellikle uluslararası piyasalarda işlem gören tahvil.',
    aciklama: 'Hazine ya da şirketlerin dolar veya euro cinsinden ihraç ettiği tahvillerdir. Faiz ve anapara ödemeleri döviz olarak yapılır.',
    ornek: 'Dolar cinsinden bir eurobond, hem dolar bazında faiz getirisi sağlar hem de TL\'nin değer kaybından korunmanın bir yolu olabilir.',
    degerlendir: 'Getiri dolar cinsindendir; TL bazında sonuç kur hareketine de bağlıdır. İhraç edenin kredi riski ve vade boyunca fiyat dalgalanmaları göz önünde bulundurulmalıdır.',
    ilgili: ['tahvil-bono', 'doviz-kuru']
  },
  {
    id: 'altin', terim: 'Gram altın ve ons', kategori: 'yatirim',
    kisa: 'Ons, altının dünya piyasasındaki birimi; gram altın ise onun TL karşılığıdır.',
    aciklama: 'Bir ons yaklaşık 31,1 gramdır ve dolar cinsinden fiyatlanır. Gram altının TL fiyatı kabaca şöyle bulunur: ons fiyatı × dolar kuru ÷ 31,1.',
    ornek: 'Gram altın fiyatı iki nedenle yükselebilir: dünyada altının ons fiyatı arttığı için ya da dolar/TL kuru yükseldiği için. İkisini ayırt etmek önemlidir.',
    degerlendir: 'Altın faiz ya da temettü getirmez; kazanç yalnızca fiyat değişiminden gelir. Fiziki altın alırken alış-satış fiyatı arasındaki farka (makas) dikkat et.',
    ilgili: ['emtia', 'doviz-kuru', 'cesitlendirme']
  },
  {
    id: 'volatilite', terim: 'Volatilite (oynaklık)', kategori: 'yatirim',
    kisa: 'Bir fiyatın ne kadar sert ve sık iniş çıkış yaptığı.',
    aciklama: 'Fiyatı gün içinde ve günler arasında büyük dalgalanmalar gösteren varlıklar yüksek volatilitelidir. Volatilite yüksekse, kısa vadede ciddi kayıplar da ciddi kazançlar da mümkündür.',
    ornek: 'Mevduatın volatilitesi yoktur; bir hisse senedi bir günde %10 değişebilir; bazı kripto varlıklar ise çok daha sert hareket edebilir.',
    degerlendir: 'Kısa sürede ihtiyacın olacak parayı yüksek volatiliteli varlıklarda tutma; tam ihtiyaç anında fiyat dipte olabilir.',
    ilgili: ['risk-getiri', 'kripto', 'kaldirac']
  },
  {
    id: 'kaldirac', terim: 'Kaldıraç', kategori: 'yatirim',
    kisa: 'Borçla, sahip olduğundan daha büyük bir pozisyonla yatırım yapmak.',
    aciklama: 'Kaldıraçlı işlemde küçük bir teminatla büyük tutarlarda işlem yapılır. Fiyat lehine giderse kazanç büyür; aleyhine giderse kayıp da aynı oranda büyür ve teminatın tamamı kısa sürede eriyebilir.',
    ornek: '1:10 kaldıraçla, fiyattaki %10\'luk bir ters hareket yatırdığın paranın tamamını götürür.',
    degerlendir: 'Kaldıraçlı işlemler deneyimli yatırımcılar için bile yüksek risk taşır. Yurt dışı merkezli ve lisanssız kaldıraçlı işlem platformlarına karşı dikkatli ol; Türkiye\'de yetkili kuruluşları SPK\'nın sitesinden kontrol edebilirsin.',
    ilgili: ['risk-getiri', 'volatilite', 'spk']
  },
  {
    id: 'kripto', terim: 'Kripto varlık', kategori: 'yatirim',
    kisa: 'Dağıtık kayıt teknolojisiyle oluşturulan dijital varlıklar.',
    aciklama: 'Bitcoin gibi kripto varlıklar merkezi bir otoriteye bağlı değildir ve fiyatları tamamen arz-talebe göre belirlenir. Türkiye\'de kripto varlık hizmet sağlayıcıları SPK düzenlemesine tabidir.',
    ornek: 'Kripto varlıkların fiyatları kısa sürede çok büyük oranlarda değişebilir; bazı projeler tamamen değersizleşebilir.',
    degerlendir: 'Kaybetmeyi göze alamayacağın parayı yatırma. Kullandığın platformun yetkili olup olmadığını kontrol et ve "garantili kazanç" vaat eden kişi ve gruplardan uzak dur.',
    ilgili: ['volatilite', 'risk-getiri', 'pompala-bosalt']
  },
  {
    id: 'duzenli-yatirim', terim: 'Düzenli yatırım', kategori: 'yatirim',
    kisa: 'Fiyata bakmadan, belirli aralıklarla sabit tutarda yatırım yapmak.',
    aciklama: 'Her ay aynı tutarı yatırdığında, fiyat düşükken daha çok, yüksekken daha az birim alırsın. Böylece ortalama maliyetin zamana yayılır ve "doğru zamanı yakalama" baskısı azalır.',
    ornek: 'Her ay 2.000 TL ile fon alan biri, fonun fiyatı 20 TL iken 100 pay, 25 TL iken 80 pay alır.',
    degerlendir: 'Düzenli yatırım, piyasa zamanlamasına dayalı kararlara göre duygusal hataları azaltır. Ancak kötü bir yatırımı iyi yapmaz; neye yatırım yaptığın hâlâ önemlidir.',
    ilgili: ['bilesik-getiri', 'yatirim-fonu', 'volatilite']
  },

  // ---------- BORSA ----------
  {
    id: 'hisse-senedi', terim: 'Hisse senedi (pay)', kategori: 'borsa',
    kisa: 'Bir şirketin küçük bir parçasına ortak olmak.',
    aciklama: 'Bir şirketin hissesini aldığında, o şirketin ortaklarından biri olursun. Şirket kâr ettikçe ve büyüdükçe hissenin değeri artabilir; şirket temettü dağıtırsa payına düşeni alırsın.',
    ornek: 'Bir şirketin 100 milyon payı varsa ve sen 1.000 pay aldıysan, şirketin yüz binde birine ortaksın.',
    degerlendir: 'Hisse almak bir kâğıt değil, bir işletmenin parçasını almaktır. Bu yüzden fiyat grafiğinden önce şirketin ne iş yaptığını ve mali tablolarını anlamak gerekir.',
    ilgili: ['piyasa-degeri', 'temettu', 'endeks'],
    ogren: 'analiz.html'
  },
  {
    id: 'piyasa-degeri', terim: 'Piyasa değeri', kategori: 'borsa',
    kisa: 'Bir şirketin borsadaki toplam değeri: hisse fiyatı × toplam pay sayısı.',
    aciklama: 'Piyasanın o an şirkete biçtiği değerdir. Hisse fiyatı tek başına şirketin büyük ya da küçük, pahalı ya da ucuz olduğunu söylemez; piyasa değeri söyler.',
    ornek: 'Hisse fiyatı 10 TL olan bir şirket, fiyatı 500 TL olan bir şirketten daha büyük olabilir; yeter ki pay sayısı yeterince fazla olsun.',
    degerlendir: '"Hisse fiyatı düşük, ucuz" düşüncesi yanlıştır. Ucuzluk ya da pahalılık, piyasa değerinin kâr, özkaynak gibi büyüklüklerle karşılaştırılmasıyla anlaşılır.',
    ilgili: ['fk', 'pddd', 'hisse-senedi'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'endeks', terim: 'Endeks (BIST 100)', kategori: 'borsa',
    kisa: 'Bir grup hissenin genel gidişatını tek bir sayıyla gösteren ölçü.',
    aciklama: 'BIST 100, Borsa İstanbul\'da işlem gören büyük şirketlerden oluşan bir endekstir. "Borsa bugün %2 yükseldi" dendiğinde genellikle bu endeks kastedilir.',
    ornek: 'BIST 100 yükselirken senin hissen düşebilir; endeks yalnızca genel eğilimi gösterir.',
    degerlendir: 'Yatırımlarının performansını değerlendirirken endeksle karşılaştır. Uzun vadede endeksin gerisinde kalıyorsan, stratejini gözden geçirmen gerekebilir. Endeks de TL cinsinden olduğu için enflasyonla birlikte düşünülmelidir.',
    ilgili: ['hisse-senedi', 'yatirim-fonu', 'enflasyon']
  },
  {
    id: 'lot', terim: 'Lot', kategori: 'borsa',
    kisa: 'Borsada alınıp satılabilen en küçük pay miktarı.',
    aciklama: 'Borsa İstanbul\'da pay piyasasında 1 lot, 1 paya eşittir. Aracı kurum uygulamalarında emir girerken adet yerine "lot" ifadesi kullanılır.',
    ornek: 'Fiyatı 50 TL olan bir hisseden 20 lot almak, 20 pay almak ve 1.000 TL ödemek demektir (işlem komisyonu hariç).',
    degerlendir: 'Aracı kurumların işlem komisyonları küçük tutarlı ve sık işlemlerde getiriyi belirgin şekilde azaltabilir; komisyon oranlarını karşılaştır.',
    ilgili: ['hisse-senedi', 'araci-kurum']
  },
  {
    id: 'araci-kurum', terim: 'Aracı kurum', kategori: 'borsa',
    kisa: 'Borsada senin adına alım satım yapan yetkili kuruluş.',
    aciklama: 'Bireysel yatırımcılar borsada doğrudan işlem yapamaz; bir aracı kurumda ya da yatırım hizmeti sunan bir bankada hesap açar. Bu kuruluşlar SPK\'nın iznine ve denetimine tabidir.',
    ornek: 'Kullandığın borsa uygulaması, bir aracı kurumun ya da bankanın uygulamasıdır.',
    degerlendir: 'Hesap açmadan önce kurumun SPK\'dan yetkili olup olmadığını kontrol et. Sosyal medyada karşına çıkan tanımadığın platformlara para gönderme.',
    ilgili: ['spk', 'lot']
  },
  {
    id: 'spk', terim: 'SPK', kategori: 'borsa',
    kisa: 'Sermaye Piyasası Kurulu: borsa ve yatırım kuruluşlarını düzenleyen ve denetleyen kurum.',
    aciklama: 'SPK, yatırımcıları korumak için sermaye piyasalarının kurallarını koyar; halka arzları onaylar, aracı kurumları ve fonları denetler, piyasa dolandırıcılığına karşı işlem yapar.',
    ornek: 'Bir kuruluşun yatırım hizmeti sunmaya yetkili olup olmadığını SPK\'nın internet sitesindeki listeden kontrol edebilirsin.',
    degerlendir: 'SPK onayı, bir halka arzın ya da hissenin iyi bir yatırım olduğu anlamına gelmez; yalnızca kurallara uygun şekilde yapıldığını gösterir. Değerlendirme yine yatırımcıya aittir.',
    ilgili: ['kap', 'halka-arz', 'araci-kurum']
  },
  {
    id: 'kap', terim: 'KAP', kategori: 'borsa',
    kisa: 'Kamuyu Aydınlatma Platformu: halka açık şirketlerin resmî duyurularını yaptığı yer.',
    aciklama: 'Borsada işlem gören şirketler mali tablolarını, faaliyet raporlarını ve önemli gelişmeleri (yatırım, ortaklık, dava, temettü kararı gibi) kap.org.tr üzerinden kamuya duyurmak zorundadır.',
    ornek: 'Bir şirketin son çeyrek bilançosunu görmek istiyorsan, KAP\'ta şirketin sayfasına girip "Finansal Rapor" bildirimlerine bakabilirsin.',
    degerlendir: 'Bir şirketle ilgili bilginin birincil kaynağı KAP\'tır. Sosyal medyada duyduğun bir haberi, işlem yapmadan önce KAP\'ta doğrula.',
    ilgili: ['spk', 'bilanco', 'gelir-tablosu'],
    ogren: 'ogren.html'
  },
  {
    id: 'halka-arz', terim: 'Halka arz', kategori: 'borsa',
    kisa: 'Bir şirketin paylarını ilk kez borsada yatırımcılara satması.',
    aciklama: 'Şirket, büyümek için para toplamak ya da mevcut ortakların bir kısmının payını satması amacıyla hisselerini halka açar. Bunun için SPK onayı alır ve bir izahname yayınlar.',
    ornek: 'İzahnamede şirketin toplanan parayı ne için kullanacağı, mali tabloları ve riskleri yer alır.',
    degerlendir: 'İzahnameyi oku: toplanan para şirkete mi giriyor (sermaye artırımı), yoksa mevcut ortaklar mı çıkıyor (ortak satışı)? Kısa vadeli fiyat hareketlerine değil, şirketin kendisine bak.',
    ilgili: ['spk', 'hisse-senedi', 'halka-aciklik']
  },
  {
    id: 'halka-aciklik', terim: 'Halka açıklık oranı', kategori: 'borsa',
    kisa: 'Şirket paylarının ne kadarının borsada serbestçe alınıp satıldığı.',
    aciklama: 'Bir şirketin paylarının büyük kısmı ana ortakta olabilir; borsada işlem gören kısım ise halka açık kısımdır. Merkezi Kayıt Kuruluşu (MKK) bu oranı "fiili dolaşımdaki pay oranı" olarak yayınlar.',
    ornek: 'Halka açıklık oranı %10 olan bir şirkette, piyasada dolaşan pay sayısı azdır; küçük alım satımlar bile fiyatı sert etkileyebilir.',
    degerlendir: 'Düşük halka açıklık, fiyat oynaklığını ve manipülasyon riskini artırabilir. Yüksek fiyat hareketlerini değerlendirirken bu oranı göz önünde bulundur.',
    ilgili: ['halka-arz', 'volatilite', 'pompala-bosalt']
  },
  {
    id: 'temettu', terim: 'Temettü', kategori: 'borsa',
    kisa: 'Şirketin kârından ortaklarına dağıttığı nakit pay.',
    aciklama: 'Şirketler kârlarının bir kısmını büyümek için şirkette tutar, bir kısmını ise ortaklara temettü olarak dağıtabilir. Temettü, pay başına belirli bir tutar olarak ilan edilir.',
    ornek: 'Pay başına 2 TL temettü dağıtan bir şirkette 500 payın varsa, stopaj öncesi 1.000 TL temettü alırsın. Temettü ödendikten sonra hisse fiyatı genellikle temettü tutarı kadar düzeltilir.',
    degerlendir: 'Yüksek temettü her zaman iyi değildir: şirket büyüme fırsatı bulamadığı için ya da borçlanarak dağıtıyorsa sürdürülebilir olmayabilir. Temettünün serbest nakit akışından karşılanıp karşılanmadığına bak.',
    ilgili: ['temettu-verimi', 'serbest-nakit-akisi', 'stopaj']
  },
  {
    id: 'temettu-verimi', terim: 'Temettü verimi', kategori: 'borsa',
    kisa: 'Yıllık temettünün hisse fiyatına oranı.',
    aciklama: 'Pay başına yıllık temettü ÷ hisse fiyatı. Hisseye yatırılan paranın ne kadarının nakit olarak geri döndüğünü gösterir.',
    ornek: 'Fiyatı 100 TL olan bir hisse, yılda pay başına 5 TL temettü dağıtıyorsa temettü verimi %5\'tir.',
    degerlendir: 'Temettü verimini mevduat faizi ve enflasyonla karşılaştır. Fiyatı sert düşmüş bir hissenin verimi yüksek görünebilir; ama bu, gelecek temettülerin azalacağı beklentisini yansıtıyor olabilir.',
    ilgili: ['temettu', 'fk']
  },
  {
    id: 'bedelsiz', terim: 'Bedelsiz sermaye artırımı', kategori: 'borsa',
    kisa: 'Ortaklara ücretsiz yeni pay verilmesi; şirketin değerini değiştirmez.',
    aciklama: 'Şirket, özkaynakları içindeki bazı kalemleri sermayeye ekler ve ortaklara ücretsiz yeni pay verir. Pay sayısı artar, ama şirketin varlıkları, kârı ve toplam değeri aynı kalır.',
    ornek: '%100 bedelsizde 100 payın 200 olur; ama hisse fiyatı da yaklaşık yarıya düzeltilir. 100 × 50 TL = 5.000 TL, 200 × 25 TL = 5.000 TL.',
    degerlendir: 'Bedelsiz, "bedava para" değildir; pastayı daha çok dilime bölmektir. Bedelsiz beklentisiyle yapılan hızlı fiyat artışlarına karşı dikkatli ol.',
    ilgili: ['bedelli', 'piyasa-degeri', 'ozkaynak']
  },
  {
    id: 'bedelli', terim: 'Bedelli sermaye artırımı', kategori: 'borsa',
    kisa: 'Şirketin ortaklarından para toplayarak yeni pay çıkarması.',
    aciklama: 'Şirket, yeni paylar ihraç eder ve mevcut ortaklara bu payları belirli bir fiyattan (çoğunlukla 1 TL nominal değerden) alma hakkı (rüçhan hakkı) tanır. Şirkete gerçekten yeni para girer.',
    ornek: 'Bedelli sermaye artırımına katılmayan bir ortağın şirketteki ortaklık payı küçülür.',
    degerlendir: 'Toplanan paranın ne için kullanılacağına bak: büyüme yatırımı mı, yoksa borç ödemek ya da zararı kapatmak mı? İkincisi şirketin zorlandığına işaret edebilir.',
    ilgili: ['bedelsiz', 'halka-arz']
  },
  {
    id: 'pompala-bosalt', terim: 'Pompala ve boşalt', kategori: 'borsa',
    kisa: 'Bir hissenin fiyatını yapay olarak şişirip, yükselişte başkalarına satma dolandırıcılığı.',
    aciklama: 'Bir grup, genellikle halka açıklığı düşük bir hisseyi toplar, ardından sosyal medya ve mesajlaşma gruplarında "tüyo" yayarak başkalarını almaya teşvik eder. Fiyat yükselince ellerindeki hisseleri satarlar; geriye düşen fiyat ve zarar eden yatırımcılar kalır.',
    ornek: '"Bu hisse yakında 5 katına çıkacak, gruba katıl" gibi mesajlar bu tür oyunların tipik işaretidir.',
    degerlendir: 'Tanımadığın kişilerin tüyolarına göre işlem yapma. Piyasa dolandırıcılığı suçtur; şüphelendiğin durumları SPK\'ya bildirebilirsin.',
    ilgili: ['halka-aciklik', 'spk', 'risk-getiri']
  },

  // ---------- ŞİRKET ANALİZİ ----------
  {
    id: 'bilanco', terim: 'Bilanço', kategori: 'sirket',
    kisa: 'Şirketin belirli bir gündeki varlıklarını ve bunların nasıl finanse edildiğini gösteren tablo.',
    aciklama: 'Bilanço, şirketin fotoğrafıdır. Bir tarafta sahip oldukları (varlıklar), diğer tarafta bunları neyle finanse ettiği (borçlar ve özkaynak) yer alır. İki taraf her zaman birbirine eşittir.',
    ornek: 'KAP\'taki finansal raporlarda bilanço, "Finansal Durum Tablosu" adıyla yer alır.',
    degerlendir: 'Borçların özkaynağa göre ne kadar büyük olduğuna, kısa vadeli borçların dönen varlıklarla karşılanıp karşılanamadığına bak.',
    ilgili: ['ozkaynak', 'cari-oran', 'gelir-tablosu'],
    ogren: 'ogren.html#bilanco'
  },
  {
    id: 'gelir-tablosu', terim: 'Gelir tablosu', kategori: 'sirket',
    kisa: 'Şirketin bir dönemde ne sattığını, ne harcadığını ve ne kadar kâr ettiğini gösteren tablo.',
    aciklama: 'Hasılattan başlar, maliyetler ve giderler düşüldükçe brüt kâra, faaliyet kârına ve en sonda net kâra ulaşılır.',
    ornek: 'KAP\'taki finansal raporlarda "Kâr veya Zarar Tablosu" başlığıyla yer alır.',
    degerlendir: 'Net kârdan önce faaliyet kârına bak: kâr asıl işten mi geliyor, yoksa tek seferlik kalemlerden mi?',
    ilgili: ['favok', 'net-kar-marji', 'bilanco'],
    ogren: 'ogren.html#gelir-tablosu'
  },
  {
    id: 'nakit-akisi', terim: 'Nakit akış tablosu', kategori: 'sirket',
    kisa: 'Şirkete gerçekten ne kadar paranın girip çıktığını gösteren tablo.',
    aciklama: 'Kâr bir muhasebe kavramıdır; nakit ise kasaya giren paradır. Bu tablo, işletme, yatırım ve finansman faaliyetlerinden kaynaklanan nakit hareketlerini ayrı ayrı gösterir.',
    ornek: 'Satışlarını vadeli yapan bir şirket kâğıt üzerinde kâr edebilir ama müşterileri ödeme yapana kadar kasasına para girmez.',
    degerlendir: 'İşletme faaliyetlerinden gelen nakdin net kârla uyumlu olup olmadığına bak. Kâr artarken nakit sürekli eksideyse, bunun nedenini sorgula.',
    ilgili: ['serbest-nakit-akisi', 'likidite', 'gelir-tablosu'],
    ogren: 'ogren.html#nakit-akis'
  },
  {
    id: 'ozkaynak', terim: 'Özkaynak (defter değeri)', kategori: 'sirket',
    kisa: 'Tüm borçlar ödendiğinde ortaklara kalacak olan kısım.',
    aciklama: 'Ortakların koyduğu sermaye ile yıllar içinde dağıtılmayıp şirkette bırakılan kârların toplamıdır. Varlıklardan tüm yükümlülükler çıkarılarak bulunur.',
    ornek: 'Toplam varlığı 10 milyar TL, toplam borcu 6 milyar TL olan bir şirketin özkaynağı 4 milyar TL\'dir.',
    degerlendir: 'Özkaynak sürekli azalıyorsa şirket zarar ediyor ya da kârından fazlasını dağıtıyor olabilir. Negatif özkaynak, borçların varlıklardan fazla olduğu anlamına gelir ve ciddi bir uyarıdır.',
    ilgili: ['pddd', 'roe', 'bilanco'],
    ogren: 'ogren.html#bilanco'
  },
  {
    id: 'favok', terim: 'FAVÖK', kategori: 'sirket',
    kisa: 'Faiz, amortisman ve vergi öncesi kâr: şirketin ana işinden kazandığı.',
    aciklama: 'Şirketin borç yapısından, vergi durumundan ve amortisman gibi muhasebe kalemlerinden bağımsız olarak, asıl faaliyetinden ne kadar kâr ettiğini gösterir.',
    ornek: 'Yaklaşık hesap: esas faaliyet kârı + amortisman giderleri. Amortisman tutarı nakit akış tablosunda bulunur.',
    degerlendir: 'Farklı borç seviyelerindeki şirketleri karşılaştırmak için kullanışlıdır. Ama makine ve tesis yenileme ihtiyacını görmezden geldiği için tek başına yeterli değildir. Bankalar için kullanılmaz.',
    ilgili: ['fd-favok', 'net-borc-favok', 'amortisman'],
    ogren: 'ogren.html#gelir-tablosu'
  },
  {
    id: 'amortisman', terim: 'Amortisman', kategori: 'sirket',
    kisa: 'Uzun ömürlü bir varlığın maliyetinin, kullanıldığı yıllara bölünerek gidere yazılması.',
    aciklama: '10 yıl kullanılacak bir makine alındığında, maliyetinin tamamı o yılın gideri sayılmaz; yıllara yayılır. Her yıl gider yazılan bu pay amortismandır.',
    ornek: '10 milyon TL\'ye alınan ve 10 yıl kullanılacak bir makine için her yıl yaklaşık 1 milyon TL amortisman gideri yazılır.',
    degerlendir: 'Amortisman nakit çıkışı değildir; nakit makine alındığında çıkmıştır. Bu yüzden nakit akış tablosunda net kâra geri eklenir.',
    ilgili: ['favok', 'nakit-akisi']
  },
  {
    id: 'fk', terim: 'F/K oranı', kategori: 'sirket',
    kisa: 'Piyasa değerinin yıllık net kâra oranı: kârın kaç katı ödendiği.',
    aciklama: 'Yatırımcıların, şirketin bir yıllık kârı için kaç katını ödemeye razı olduğunu gösterir. Piyasa değeri ÷ son 12 aylık net kâr.',
    ornek: 'Piyasa değeri 8 milyar TL, yıllık net kârı 1 milyar TL olan bir şirketin F/K oranı 8\'dir.',
    degerlendir: 'Düşük F/K ucuzluğa işaret edebilir, ama kârın düşeceği beklentisini de yansıtıyor olabilir. Aynı sektördeki şirketlerle ve şirketin kendi geçmişiyle karşılaştır.',
    ilgili: ['pddd', 'fd-favok', 'piyasa-degeri', 'dongusellik'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'pddd', terim: 'PD/DD oranı', kategori: 'sirket',
    kisa: 'Piyasa değerinin özkaynağa oranı.',
    aciklama: 'Piyasanın şirkete, bilançodaki özkaynağının kaç katı değer biçtiğini gösterir. Piyasa değeri ÷ özkaynaklar.',
    ornek: 'PD/DD oranı 0,7 olan bir şirket, defter değerinin %70\'i fiyatla işlem görüyor demektir.',
    degerlendir: '1\'in altı her zaman fırsat değildir; piyasa varlıkların değerinden ya da şirketin kârlılığından şüphe duyuyor olabilir. Bankalar, holdingler ve GYO\'lar için özellikle önemlidir.',
    ilgili: ['fk', 'roe', 'ozkaynak'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'fd-favok', terim: 'FD/FAVÖK oranı', kategori: 'sirket',
    kisa: 'Borç dahil şirket değerinin FAVÖK\'e oranı.',
    aciklama: 'Firma değeri (piyasa değeri + net borç) ÷ FAVÖK. F/K\'ya benzer, ama şirketin borcunu da hesaba kattığı için borç seviyeleri farklı şirketleri karşılaştırmada daha adildir.',
    ornek: 'Piyasa değeri 8 milyar, net borcu 2 milyar ve FAVÖK\'ü 2 milyar TL olan bir şirketin FD/FAVÖK oranı 5\'tir.',
    degerlendir: 'Sektör içi karşılaştırmada kullan. Bankalarda anlamlı değildir, çünkü bankalarda borç işin kendisidir.',
    ilgili: ['favok', 'fk', 'net-borc-favok'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'roe', terim: 'Özkaynak kârlılığı (ROE)', kategori: 'sirket',
    kisa: 'Ortakların koyduğu her 100 TL\'nin yılda kaç TL kâr ürettiği.',
    aciklama: 'Net kâr ÷ ortalama özkaynaklar. Şirketin, ortaklarının sermayesini ne kadar verimli kullandığını gösterir.',
    ornek: 'Özkaynağı 5 milyar TL olan ve 1 milyar TL net kâr eden bir şirketin ROE\'si %20\'dir.',
    degerlendir: 'Yüksek enflasyon döneminde ROE\'yi enflasyonla karşılaştır; enflasyonun altında kalan ROE, reel olarak değer kaybı anlamına gelebilir. Yüksek borçla şişirilmiş ROE\'ye de dikkat et.',
    ilgili: ['ozkaynak', 'pddd', 'net-kar-marji'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'net-kar-marji', terim: 'Net kâr marjı', kategori: 'sirket',
    kisa: 'Her 100 TL\'lik satıştan kaç TL\'nin net kâr olarak kaldığı.',
    aciklama: 'Net kâr ÷ hasılat. Şirketin satışlarını ne kadar verimli kâra dönüştürdüğünü gösterir.',
    ornek: '10 milyar TL satış yapıp 1 milyar TL net kâr eden bir şirketin net kâr marjı %10\'dur.',
    degerlendir: 'Sektör farklarını unutma: perakendede birkaç puanlık marj normal olabilirken, yazılım gibi sektörlerde çok daha yüksek marjlar görülür.',
    ilgili: ['gelir-tablosu', 'roe'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'cari-oran', terim: 'Cari oran', kategori: 'sirket',
    kisa: 'Şirketin kısa vadeli borçlarını kısa vadeli varlıklarıyla karşılama gücü.',
    aciklama: 'Dönen varlıklar ÷ kısa vadeli yükümlülükler. Bir yıl içinde ödenecek borçların, bir yıl içinde nakde dönecek varlıklarla karşılanıp karşılanamadığını gösterir.',
    ornek: 'Cari oranı 1,6 olan bir şirketin, her 1 TL kısa vadeli borcuna karşılık 1,6 TL dönen varlığı vardır.',
    degerlendir: '1\'in üzeri genelde rahatlatıcıdır. Ama perakende gibi, müşteriden peşin tahsilat yapıp tedarikçiye vadeli ödeyen sektörlerde 1\'in altı normaldir. Ülke ekonomisindeki "cari açık" ile karıştırma.',
    ilgili: ['likidite', 'bilanco', 'cari-acik'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'net-borc-favok', terim: 'Net borç / FAVÖK', kategori: 'sirket',
    kisa: 'Şirketin net borcunu faaliyet kârıyla kaç yılda ödeyebileceği.',
    aciklama: 'Net borç (finansal borçlar − nakit) ÷ FAVÖK. Şirketin borç yükünün, kazanma gücüne göre ne kadar ağır olduğunu gösterir.',
    ornek: 'Net borcu 2 milyar, FAVÖK\'ü 2 milyar TL olan bir şirkette oran 1\'dir. Negatif bir oran, şirketin borcundan fazla nakdi olduğu anlamına gelir.',
    degerlendir: 'Oran yükseldikçe şirket faiz ve kur değişimlerine karşı daha hassas hale gelir. Döviz borcu olan şirketlerde kur artışı bu oranı hızla bozabilir.',
    ilgili: ['favok', 'fd-favok', 'doviz-kuru'],
    ogren: 'ogren.html#oranlar'
  },
  {
    id: 'serbest-nakit-akisi', terim: 'Serbest nakit akışı', kategori: 'sirket',
    kisa: 'Şirketin işini sürdürdükten ve yatırımlarını yaptıktan sonra elinde kalan nakit.',
    aciklama: 'İşletme faaliyetlerinden nakit akışı − yatırım harcamaları. Temettü, borç ödemesi ya da yeni büyüme fırsatları bu paradan finanse edilir.',
    ornek: 'İşletmeden 1,3 milyar TL nakit elde eden ve 500 milyon TL yatırım yapan bir şirketin serbest nakit akışı 800 milyon TL\'dir.',
    degerlendir: 'Uzun süre negatif serbest nakit akışı, şirketin büyümesini ya da temettüsünü borçla finanse ettiğini gösterebilir.',
    ilgili: ['nakit-akisi', 'temettu', 'net-borc-favok'],
    ogren: 'ogren.html#nakit-akis'
  },
  {
    id: 'enflasyon-muhasebesi', terim: 'Enflasyon muhasebesi', kategori: 'sirket',
    kisa: 'Mali tabloların, enflasyonun etkisinden arındırılarak hazırlanması.',
    aciklama: 'Yüksek enflasyon dönemlerinde geçmiş yıllara ait rakamlar bugünün parasıyla karşılaştırılabilir olmaktan çıkar. Enflasyon muhasebesi (TMS 29), tabloları güncel satın alma gücüne göre düzeltir.',
    ornek: 'Enflasyon muhasebesi uygulanan tablolarda "net parasal pozisyon kazancı/kaybı" adlı bir satır görürsün; bu kalem net kârı belirgin şekilde etkileyebilir.',
    degerlendir: 'Farklı dönemlerin tablolarını karşılaştırırken hangisinin enflasyona göre düzeltilmiş olduğuna dikkat et. Şirketin kendi açıklamalarındaki "düzeltilmemiş" rakamlarla karıştırma.',
    ilgili: ['enflasyon', 'gelir-tablosu'],
    ogren: 'ogren.html#gelir-tablosu'
  }
];
