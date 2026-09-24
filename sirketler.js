// Borsa İstanbul şirketleri — başlangıç listesi.
// Şimdilik yalnızca kod, ünvan ve sektör var. Fiyat ve finansal veriler
// resmi bir veri kaynağı bağlandığında bu dosyaya eklenecek:
//   fiyat: { son: 325.5, tarih: "2026-09-24" }
//   finansal: { donem: "2026/6", netKar: ..., ozkaynak: ..., ... }

const SEKTOR_BANKA = 'Bankacılık';

const SIRKETLER = [
  { kod: 'AEFES', ad: 'Anadolu Efes Biracılık ve Malt Sanayii', sektor: 'Gıda ve İçecek' },
  { kod: 'AKBNK', ad: 'Akbank', sektor: SEKTOR_BANKA },
  { kod: 'ARCLK', ad: 'Arçelik', sektor: 'Dayanıklı Tüketim' },
  { kod: 'ASELS', ad: 'Aselsan Elektronik Sanayi ve Ticaret', sektor: 'Savunma ve Teknoloji' },
  { kod: 'BIMAS', ad: 'BİM Birleşik Mağazalar', sektor: 'Perakende' },
  { kod: 'CCOLA', ad: 'Coca-Cola İçecek', sektor: 'Gıda ve İçecek' },
  { kod: 'EKGYO', ad: 'Emlak Konut Gayrimenkul Yatırım Ortaklığı', sektor: 'Gayrimenkul' },
  { kod: 'ENKAI', ad: 'Enka İnşaat ve Sanayi', sektor: 'İnşaat' },
  { kod: 'EREGL', ad: 'Ereğli Demir ve Çelik Fabrikaları', sektor: 'Metal Ana Sanayi' },
  { kod: 'FROTO', ad: 'Ford Otomotiv Sanayi', sektor: 'Otomotiv' },
  { kod: 'GARAN', ad: 'Türkiye Garanti Bankası', sektor: SEKTOR_BANKA },
  { kod: 'ISCTR', ad: 'Türkiye İş Bankası (C)', sektor: SEKTOR_BANKA },
  { kod: 'KCHOL', ad: 'Koç Holding', sektor: 'Holding' },
  { kod: 'MGROS', ad: 'Migros Ticaret', sektor: 'Perakende' },
  { kod: 'PETKM', ad: 'Petkim Petrokimya Holding', sektor: 'Kimya' },
  { kod: 'PGSUS', ad: 'Pegasus Hava Taşımacılığı', sektor: 'Ulaştırma' },
  { kod: 'SAHOL', ad: 'Hacı Ömer Sabancı Holding', sektor: 'Holding' },
  { kod: 'SASA', ad: 'Sasa Polyester Sanayi', sektor: 'Kimya' },
  { kod: 'SISE', ad: 'Türkiye Şişe ve Cam Fabrikaları', sektor: 'Cam' },
  { kod: 'TAVHL', ad: 'TAV Havalimanları Holding', sektor: 'Ulaştırma' },
  { kod: 'TCELL', ad: 'Turkcell İletişim Hizmetleri', sektor: 'Telekomünikasyon' },
  { kod: 'THYAO', ad: 'Türk Hava Yolları', sektor: 'Ulaştırma' },
  { kod: 'TOASO', ad: 'Tofaş Türk Otomobil Fabrikası', sektor: 'Otomotiv' },
  { kod: 'TTKOM', ad: 'Türk Telekomünikasyon', sektor: 'Telekomünikasyon' },
  { kod: 'TUPRS', ad: 'Tüpraş-Türkiye Petrol Rafinerileri', sektor: 'Enerji' },
  { kod: 'ULKER', ad: 'Ülker Bisküvi Sanayi', sektor: 'Gıda ve İçecek' },
  { kod: 'VESTL', ad: 'Vestel Elektronik Sanayi ve Ticaret', sektor: 'Dayanıklı Tüketim' },
  { kod: 'YKBNK', ad: 'Yapı ve Kredi Bankası', sektor: SEKTOR_BANKA }
];

// Sektöre göre "bu şirketi analiz ederken nelere bakmalı" notları.
// Listede olmayan sektörler için VARSAYILAN kullanılır.
const SEKTOR_NOTLARI = {
  [SEKTOR_BANKA]: [
    'Bankaların bilançosu sanayi şirketlerinden farklıdır: cari oran veya FAVÖK gibi oranlar burada anlamlı değildir.',
    'PD/DD (piyasa değeri / defter değeri) ve özkaynak kârlılığı (ROE) bankalar için en temel iki göstergedir.',
    'Net faiz marjı, bankanın mevduata ödediği faiz ile krediden aldığı faiz arasındaki farkı gösterir.',
    'Takipteki krediler oranı, verilen kredilerin ne kadarının geri dönmekte zorlandığını anlatır.',
    'Sermaye yeterlilik oranı, bankanın olası kayıplara karşı ne kadar tampona sahip olduğunu gösterir.'
  ],
  'Holding': [
    'Holdingler birçok şirketi bir arada taşıdığı için konsolide tablolar tek başına her şeyi anlatmaz.',
    'Net aktif değer (NAD): iştiraklerin piyasa değerleri toplamından holding borçları düşülerek bulunur.',
    'Holding hissesinin NAD\'a göre "iskontolu" işlemesi yaygındır; iskontonun tarihsel ortalamaya göre nerede olduğuna bakılır.',
    'Hangi iştirakin toplam değerin ne kadarını oluşturduğunu bilmek riski anlamaya yardım eder.'
  ],
  'Gayrimenkul': [
    'GYO\'larda net aktif değer ve PD/DD öne çıkar; portföydeki gayrimenkullerin ekspertiz değerleri önemlidir.',
    'Kira gelirinin sürekliliği ve doluluk oranları nakit akışının kalitesini gösterir.',
    'Borçluluk (kaldıraç) faiz ortamına karşı hassasiyeti belirler.'
  ],
  'Perakende': [
    'Perakendede kâr marjları düşüktür; önemli olan satış hacmi ve büyümedir.',
    'Stok devir hızı, malların ne kadar hızlı satıldığını gösterir.',
    'Negatif işletme sermayesi bu sektörde normaldir: tedarikçiye ödeme süresi, müşteriden tahsilat süresinden uzundur.',
    'Mağaza başına satış ve yeni mağaza açılış hızı büyümenin kaynağını anlatır.'
  ],
  VARSAYILAN: [
    'Gelir tablosunda satışların ve faaliyet kârının yıllar içindeki eğilimine bakın; tek bir dönem yanıltıcı olabilir.',
    'F/K ve FD/FAVÖK oranlarını aynı sektördeki şirketlerle karşılaştırın.',
    'Net borç / FAVÖK oranı, şirketin borcunu kaç yıllık faaliyet kârıyla ödeyebileceğini gösterir.',
    'Cari oran, kısa vadeli borçların kısa vadeli varlıklarla karşılanıp karşılanamadığını anlatır.',
    'Faaliyetlerden elde edilen nakit akışını net kârla karşılaştırın: kâr nakde dönüşüyor mu?'
  ]
};
