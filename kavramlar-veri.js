// Kavram sayfalarının derin katmanları (kavram/<id>.html)
//
// Her kavramın temel katmanları sozluk-veri.js'te:
//   kisa → Basitçe · aciklama → Nasıl çalışır? · ornek → Gerçek hayattan
//   degerlendir → Nelere dikkat? · ilgili → İlgili kavramlar
// Bu dosya seçili kavramlara şunları ekler:
//   neden      "Beni neden ilgilendiriyor?" — üç kısa madde
//   derin      "Daha derin" — teknik ayrıntı (kullanıcı açarsa görünür)
//   kaynaklar  resmî kaynaklar { ad, url, not } — yalnızca kurum ve yayın adı
//   gorsel     kavrama özel etkileşimli görsel: 'alim-gucu' | 'bilesik' | 'reel' | 'zincir'
//
// İlke: basit önce, teknik sonra. Olgu, yorum ve tahmin birbirinden ayrılır;
// kesin olmayan sonuçlar eğilim diliyle yazılır. Değişen oranlar yazılmaz.

const KAYNAK = {
  tuik: { ad: 'TÜİK', url: 'https://www.tuik.gov.tr' },
  tcmb: { ad: 'Türkiye Cumhuriyet Merkez Bankası', url: 'https://www.tcmb.gov.tr' },
  evds: { ad: 'TCMB Elektronik Veri Dağıtım Sistemi (EVDS)', url: 'https://evds2.tcmb.gov.tr' },
  spk: { ad: 'Sermaye Piyasası Kurulu', url: 'https://www.spk.gov.tr' },
  kap: { ad: 'Kamuyu Aydınlatma Platformu', url: 'https://www.kap.org.tr' },
  bist: { ad: 'Borsa İstanbul', url: 'https://www.borsaistanbul.com' },
  tefas: { ad: 'TEFAS', url: 'https://www.tefas.gov.tr' },
  hmb: { ad: 'Hazine ve Maliye Bakanlığı', url: 'https://www.hmb.gov.tr' }
};

const KAVRAM_DERIN = {
  enflasyon: {
    neden: [
      'Maaşının ve birikiminin alım gücü, rakamdan çok enflasyona bağlıdır.',
      'Kira, kredi ve zam pazarlıkları genellikle enflasyon beklentisiyle yapılır.',
      'Faiz kararlarının ve piyasaların en yakından izlediği göstergedir.'
    ],
    derin: [
      'TÜFE, hanelerin tükettiği mal ve hizmetlerden oluşan temsilî bir sepetin fiyatını izler. Her kalemin ağırlığı, toplam harcamadaki payına göre belirlenir.',
      'Bu yüzden kişisel enflasyonun resmî orandan farklı olabilir: kirası, gıdası ya da ulaşımı sepettekinden daha ağır olan biri enflasyonu daha yüksek hisseder.',
      'Enflasyon; talebin üretimden hızlı artmasıyla, enerji ya da kur gibi maliyetlerin yükselmesiyle ve fiyatların artmaya devam edeceği beklentisiyle beslenebilir. Enerji ve gıda gibi oynak kalemler çıkarılarak hesaplanan çekirdek göstergeler, geçici etkileri ayıklayıp eğilimi görmeye yardımcı olur.'
    ],
    kaynaklar: [{ ...KAYNAK.tuik, not: 'Tüketici fiyat endeksi bültenleri (aylık)' }, { ...KAYNAK.tcmb, not: 'Enflasyon Raporu' }],
    gorsel: 'alim-gucu'
  },

  faiz: {
    neden: [
      'Kredi kullanırken geri ödeyeceğin toplam tutarı belirler.',
      'Birikiminin bankada ne hızla büyüyeceğini belirler.',
      'Tüm yatırımların kıyaslandığı ölçüdür: "Faizden fazla kazandırıyor mu?"'
    ],
    derin: [
      'Faiz oranı genellikle yıllık ifade edilir; kredi kartı ve tüketici kredilerinde aylık oranlar da yaygındır. Aylık %3 faiz yıllık %36 değil, bileşik olarak yaklaşık %42,6\'dır: (1,03)¹² − 1.',
      'Nominal faiz rakamın kendisidir; reel faiz enflasyondan arındırılmış halidir.',
      'Faiz; borç verenin parasından bir süre vazgeçmesinin, enflasyonun ve geri ödenmeme riskinin bedelini içerir. Bu yüzden riskli görülen borçluya daha yüksek faiz uygulanır.'
    ],
    kaynaklar: [{ ...KAYNAK.evds, not: 'Kredi ve mevduat faizi istatistikleri' }]
  },

  'bilesik-getiri': {
    neden: [
      'Uzun vadeli birikimde en büyük farkı ne kadar erken başladığın yaratır.',
      'Borçta da çalışır: ödenmeyen faize de faiz işler.',
      'Küçük getiri farkları, yıllar içinde büyük tutarlara dönüşür.'
    ],
    derin: [
      'Bileşik büyüme: gelecek değer = bugünkü tutar × (1 + oran)^dönem. Basit faizde getiri her dönem yalnızca ana paraya işler; bileşikte önceki dönemlerin getirisine de işler.',
      '72 kuralı pratik bir kısayoldur: 72\'yi yıllık yüzde getiriye bölmek, paranın yaklaşık kaç yılda ikiye katlanacağını verir. %8 getiriyle yaklaşık 9 yıl.',
      'Enflasyon da bileşik işler. Bu yüzden uzun vadeli bir hesabı her zaman reel getiriyle yapmak gerekir.'
    ],
    gorsel: 'bilesik'
  },

  'reel-getiri': {
    neden: [
      'Bir yatırımın seni gerçekten zenginleştirip zenginleştirmediğini gösterir.',
      'Yüksek enflasyonda yüksek görünen getiriler, reel olarak eksi olabilir.',
      'Maaş zammını değerlendirmenin de doğru yoludur.'
    ],
    derin: [
      'Kesin hesap: reel getiri = (1 + nominal getiri) ÷ (1 + enflasyon) − 1.',
      'Nominalden enflasyonu çıkarmak, oranlar düşükken yakın sonuç verir; oranlar yükseldikçe hata büyür. %50 nominal getiri ve %40 enflasyonda kısayol %10 derken kesin hesap yaklaşık %7,1\'dir.',
      'Vergi ve masraflar da düşülmelidir. Asıl önemli olan, vergi ve masraf sonrası reel getiridir.'
    ],
    kaynaklar: [{ ...KAYNAK.tuik, not: 'Enflasyon verisi' }],
    gorsel: 'reel'
  },

  'politika-faizi': {
    neden: [
      'Kredi, mevduat ve kredi kartı faizlerinin yönünü belirler.',
      'Döviz kurunu ve piyasaları etkiler.',
      'Enflasyonla mücadelenin ana aracıdır.'
    ],
    derin: [
      'TCMB, politika faizini Para Politikası Kurulu toplantılarında belirler. Türkiye\'de politika faizi, bir hafta vadeli repo ihale faiz oranıdır.',
      'Bankalar TCMB\'den bu oran civarında fonlanır ve bu maliyeti verdikleri kredilere yansıtır.',
      'Etkinin ekonomiye yayılması aylar sürebilir. Bu gecikme yüzünden merkez bankaları bugünkü değil, önümüzdeki dönemin enflasyonunu gözeterek karar verir.'
    ],
    kaynaklar: [{ ...KAYNAK.tcmb, not: 'Para Politikası Kurulu kararları' }],
    gorsel: 'zincir'
  },

  'doviz-kuru': {
    neden: [
      'İthal ürün, akaryakıt ve elektronik fiyatlarını etkiler.',
      'Dövizle borçlanan şirketlerin ve hanelerin yükünü değiştirir.',
      'Yurt dışı seyahat ve eğitimin maliyetini belirler.'
    ],
    derin: [
      'Türkiye\'de dalgalı kur rejimi uygulanır: kur, piyasada arz ve talebe göre belirlenir.',
      'Kuru etkileyen başlıca etkenler iki ülke arasındaki faiz ve enflasyon farkı, cari denge, sermaye akımları ve beklentilerdir.',
      'Nominal kur tek başına çok şey söylemez. İki ülkenin enflasyon farkına göre düzeltilmiş reel kur, paranın gerçekte değer kazanıp kaybetmediğini gösterir.'
    ],
    kaynaklar: [{ ...KAYNAK.tcmb, not: 'Gösterge niteliğindeki döviz kurları ve reel efektif döviz kuru' }]
  },

  'risk-getiri': {
    neden: [
      'Yüksek getiri vaadi, neredeyse her zaman yüksek riskin işaretidir.',
      'Birikimini nasıl dağıtacağına karar verirken sorulacak ilk sorudur.',
      '"Risksiz yüksek getiri" vaadi, dolandırıcılığın en yaygın işaretidir.'
    ],
    derin: [
      'Risk, getirinin beklenenden farklı çıkma ihtimalidir; yalnızca kaybetmek değil, belirsizliktir. Oynaklık (volatilite), riskin yaygın bir ölçüsüdür.',
      'Başlıca risk türleri: piyasa riski, kredi riski (borçlunun ödememesi), likidite riski (satmak istediğinde alıcı bulamamak), kur riski ve enflasyon riski.',
      'Yatırım ufku önemlidir: kısa vadede çok dalgalanan bir varlığın uzun vadeli sonuçları daha az dağınık olabilir. Ama bu bir garanti değildir.'
    ],
    kaynaklar: [{ ...KAYNAK.spk, not: 'Yatırımcı bilgilendirme' }]
  },

  likidite: {
    neden: [
      'Acil bir durumda paraya ne kadar hızlı ulaşabileceğini belirler.',
      'Vadesi dolmadan bozulan mevduat ya da aceleyle satılan bir varlık değer kaybettirebilir.',
      'Şirketler için de hayatidir: kârlı bir şirket bile nakitsiz kalırsa zorlanır.'
    ],
    derin: [
      'Likiditenin iki boyutu vardır: bir varlığın ne kadar hızlı nakde çevrilebildiği ve bunu yaparken ne kadar değer kaybedildiği.',
      'Nakit en likit varlıktır; gayrimenkul ise genellikle en az likit olanlardandır.',
      'Piyasalarda alış ve satış fiyatı arasındaki fark (makas) likiditenin bir göstergesidir: makas ne kadar darsa varlık o kadar likittir. Şirketlerde cari oran likiditeyi ölçen oranlardan biridir.'
    ]
  },

  'tahvil-bono': {
    neden: [
      'Getirisi ve vadesi baştan belli olabilen, mevduata alternatif bir araçtır.',
      'Faizler yükselince elindeki tahvilin piyasa fiyatı düşer; faizler düşünce yükselir.',
      'Devletin ve şirketlerin nasıl borçlandığını anlamanı sağlar.'
    ],
    derin: [
      'Vadesi bir yıldan kısa olanlara genellikle bono, uzun olanlara tahvil denir. Tahvil düzenli faiz (kupon) ödeyebilir ya da iskontolu satılıp vadede nominal değerinden ödenebilir.',
      'Faiz ile tahvil fiyatı ters yönde hareket eder: piyasa faizi yükselince düşük kuponlu eski tahvil daha az cazip olur ve fiyatı düşer. Vadeye kadar tutulan bir tahvilde bu dalgalanma, ihraççı ödemesini yaptığı sürece sonucu değiştirmez.',
      'Risk ihraççıya göre değişir: devlet tahvilleri genellikle şirket tahvillerinden daha düşük kredi riski taşır.'
    ],
    kaynaklar: [{ ...KAYNAK.hmb, not: 'Devlet iç borçlanma senetleri' }, { ...KAYNAK.kap, not: 'Şirketlerin borçlanma aracı ihraçları' }, { ...KAYNAK.bist, not: 'Borçlanma Araçları Piyasası' }]
  },

  'hisse-senedi': {
    neden: [
      'Bir şirketin büyümesine ortak olmanın yoludur.',
      'Fiyatı her gün dalgalanır; kısa vadede kayıp ihtimali yüksektir.',
      'Getiri iki yoldan gelebilir: temettü ve fiyat artışı.'
    ],
    derin: [
      'Hisse sahibi olmak, şirketin kârında ve varlıklarında pay sahibi olmaktır. Şirket zorlanırsa borç verenler (tahvil sahipleri, bankalar) ortaklardan önce gelir.',
      'Uzun vadede hisse fiyatını şirketin kâr ve nakit üretme gücü belirler; kısa vadede ise beklentiler, faizler ve duygular.',
      'Türkiye\'de hisseler Borsa İstanbul\'da, SPK\'dan yetkili aracı kurumlar aracılığıyla alınıp satılır. Şirketler önemli gelişmeleri KAP\'ta duyurmak zorundadır.'
    ],
    kaynaklar: [{ ...KAYNAK.bist }, { ...KAYNAK.kap, not: 'Şirket bildirimleri ve mali tablolar' }, { ...KAYNAK.spk }]
  },

  'yatirim-fonu': {
    neden: [
      'Az parayla çok sayıda varlığa dağılmanı sağlar.',
      'Yönetim ücreti getirinden düşer; uzun vadede bu fark büyür.',
      'Fonun hangi varlıklara yatırım yaptığı, riskini belirler.'
    ],
    derin: [
      'Fonun değeri birim pay fiyatıyla izlenir ve her iş günü hesaplanır.',
      'Fonlar yatırım yaptıkları varlıklara göre sınıflanır: para piyasası, borçlanma araçları, hisse senedi, değişken ve katılım fonları gibi.',
      'Her fonun izahnamesi ve yatırımcı bilgi formu; yatırım stratejisini, risk değerini ve ücretlerini açıklar. Geçmiş getiri, gelecekteki getirinin garantisi değildir.'
    ],
    kaynaklar: [{ ...KAYNAK.tefas, not: 'Fon karşılaştırma' }, { ...KAYNAK.kap, not: 'Fon izahnameleri ve bildirimleri' }, { ...KAYNAK.spk }]
  },

  cesitlendirme: {
    neden: [
      'Tek bir yatırımın kötü gitmesinin tüm birikimini etkilemesini önler.',
      'Riski azaltırken, genellikle beklenen getiriden çok şey kaybettirmez.',
      '"Tüm yumurtaları aynı sepete koyma" sözünün finanstaki karşılığıdır.'
    ],
    derin: [
      'Çeşitlendirmenin işe yaraması için varlıkların birlikte hareket etmemesi gerekir: aynı sektördeki beş hisse, beş farklı varlık sınıfı kadar çeşitlendirme sağlamaz.',
      'Çeşitlendirme şirkete özgü riski azaltabilir, ama tüm piyasayı etkileyen riski (sistematik risk) ortadan kaldırmaz.',
      'Aşırı çeşitlendirme de takibi zorlaştırır ve maliyeti artırabilir.'
    ],
    kaynaklar: [{ ...KAYNAK.spk, not: 'Yatırımcı bilgilendirme' }]
  }
};
