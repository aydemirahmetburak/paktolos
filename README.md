# Paktolos

**Paktolos**, Borsa İstanbul'da işlem gören hisse senetlerini analiz etmeyi bireysel yatırımcılara öğreten bir web platformudur. Yatırım tavsiyesi vermez — finansal oranları ve şirket analizini anlaşılır, etkileşimli bir şekilde öğretir.

Paktolos **veri yayınlamaz.** Kullanıcı mali tabloları KAP'tan, fiyat ve piyasa değerini kendi borsa uygulamasından alır; Paktolos bu rakamların nasıl okunacağını öğretir.

> 🚧 **Durum:** Aktif geliştirme aşamasında. Bu repo, projenin mimarisini ve geliştirme sürecini şeffaf şekilde belgelemek için tutuluyor.

---

## Neden Paktolos?

Bireysel yatırımcılar bir hissenin güncel fiyatını aracı kurum uygulamalarından zaten öğrenebiliyor. Ama o fiyatın *ne anlama geldiğini* — F/K oranı yüksek mi düşük mü, şirket sektörüne göre nasıl konumlanıyor, bilançodaki sayılar aslında ne söylüyor — çoğu zaman kimse anlatmıyor.

Paktolos bu boşluğu dolduruyor: **yatırım kararını vermiyor, kararı verebilecek bilgiyi kazandırıyor.**

## Temel İlkeler

1. **Yatırım tavsiyesi yok.** Platform hiçbir zaman "al" ya da "sat" demez.
2. **Eğitim odaklı.** Finansal oranların ne anlattığını, sayıların nasıl yorumlanacağını öğretir.
3. **Hedef kitle:** Profesyonel analiz bilgisi olmayan bireysel yatırımcılar.
4. **Tamamlayıcı araç.** Aracı kurum uygulamalarının yerini almaz, onları anlamlandırır.
5. **"Görene kadar ihtiyacını bilmediğin, gördükten sonra vazgeçemeyeceğin" bir araç olmayı hedefler.**
6. **Etkileşimli öğrenme.** Pasif okuma yerine dokunarak, deneyerek öğrenme.
7. **Tasarım öncelikli.** Dieter Rams / Braun ve Jony Ive'ın minimalist, işlevsel tasarım felsefesinden ilham alır.

## Tasarım Felsefesi

**Karmaşığı apaçık kıl.** Paktolos, finans hakkında bilgi veren bir web sitesi değil; finansı *anlamayı* sağlayan bir deneyimdir. Arayüz anlamanın arkasında kaybolur.

- Kesinlik, açıklık, ölçülülük: gereksiz süs yok, her renk bir anlam taşır, her animasyonun bir nedeni vardır.
- Sakin bir zemin (#F7F7F5), beyaz yüzeyler, ince çizgiler; ağır gölge ve cam efekti yok.
- Tek vurgu rengi mavi (#2457A6) ve seyrek kullanılır. Markanın turuncusu yalnızca logoda ve hikâye çizimlerinde.
- Katmanlı anlatım: önce basitçe, sonra nasıl çalıştığı, gerçek hayattaki karşılığı, daha derini ve kaynaklar.
- "Bu ne anlama geliyor?": her gösterge, sana dokunan üç kısa sonuca açılır.
- Grafikler süs değil, bir fikri anlatır: ince çizgiler, az ızgara, doğrulanmış iki renk.
- Karanlık mod ters çevirme değil, ayrı ayrı seçilmiş değerlerdir.
- "Damla" sayfa geçişi, kaydırdıkça ilerleyen infografikler, dokunarak keşfedilen tablolar.
- Erişilebilirlik: WCAG AA, klavye ile gezinme, görünür odak, 44 piksel dokunma alanı, "azaltılmış hareket" tercihine saygı.

## Tasarım Sistemi

Canlı katalog: **`tasarim.html`**. Yeni bir şey tasarlamadan önce oraya bak.

| Katman | Dosya | İçerik |
|---|---|---|
| Tokenlar | `tasarim/tokenlar.css` | Renk (açık/koyu), yazı ölçeği, 8 noktalı boşluk, köşe, gölge, hareket, yerleşim |
| Bileşenler | `tasarim/bilesenler.css` | Menü, alt çubuk, alt bilgi, düğme, rozet, etiket, kartlar, sayı, bölüm başlığı, sekmeler, ipucu, akordeon, ilerleme, anahtar, öğrenme blokları, "Bu ne anlama geliyor?", boş/hata/yükleniyor durumları |
| Sayfa stilleri | `style.css` | Sayfalara özel stiller; eski değişken adları yeni tokenlara bağlıdır |
| Etkileşim | `script.js` → BİLEŞENLER | Sekmeler (ok tuşlarıyla), açılır kutu |

Kurallar:
- Bileşenler yalnızca token kullanır; doğrudan renk ya da ölçek dışı boşluk yazılmaz.
- Kırılımlar: telefon < 768, tablet 768–1279, masaüstü ≥ 1280.
- Hareket eğrisi tektir: `--ease` = cubic-bezier(0.22, 1, 0.36, 1). Zıplama ve esneme yok.
- Simgeler tek aile: 24 piksel ızgara, 1,5 piksel çizgi, yuvarlak uç.
- Metin rengi her zeminde en az 4.5:1 kontrast verir; koyu zeminli bölümlerde vurgu metni `--accent-on-dark` kullanır.
- Betikle dolan alanlar boşken yer ayırır (`style.css`, YER AYIRMA); böylece sayfa yüklenirken içerik kaymaz.

## Bilgi Mimarisi

| Bölüm | Sayfa | İçindekiler |
|---|---|---|
| Öğren | `dersler.html` | Dersler, sözlük, kendini sına |
| Ekonomi | `ekonomi.html` | Dört gösterge (rakamsız), temel kavramlar, haberi anla |
| Piyasalar | `piyasalar.html` | Mali tablolar, hisse analizi, sektörler, şirket laboratuvarı |
| Rehberler | `rehberler.html` | Uzun anlatımlar, "Aklına takılan" soru kütüphanesi, Paktolos'un hikâyesi |
| Araçlar | `araclar.html` | Hesaplayıcılar, şirket laboratuvarı, finansal check-up |

Arama (⌘K) ve Karnem (öğrenme ilerlemesi) her sayfada menünün sağında. Telefonda alt çubuk: Ana sayfa, Öğren, Ekonomi, Piyasalar, Araçlar.

## Logo

Paktolos'un logosu, dünyanın ilk madeni paralarından birinin, Paktolos'un altınından basılan Lidya sikkesinin **arka yüzüdür**. Bu sikkelerin arka yüzünde, basım sırasında oluşan iki dikdörtgen damga izi bulunur. Paranın ön yüzünde fiyat yazar; Paktolos arka yüzüne, o fiyatın ardındaki rakamlara bakar.

- İşaret tek bir SVG yolundan oluşur (`icon.svg`); damgalar boşluk olarak kesildiği için her zeminde çalışır.
- Renk her zaman turuncu (`--color-accent`); uygulama simgelerinde kömür zemin üzerinde.
- Menüdeki işaret `gelistirme/ortak-duzen.py` içindeki `LOGO_MARK`'tan gelir. Oturumun ilk açılışında menüdeki sikke bir kez "darp edilir"; ayrı bir açılış ekranı yoktur.
- Uygulama simgeleri (`icons/`) aynı çizimden üretilir; maskable simgede işaret güvenli alanın içinde kalır.

## Teknik Yaklaşım (Web)

| Katman | Teknoloji |
|---|---|
| Yapı | Düz HTML |
| Stil | Düz CSS (CSS custom properties ile tasarım sistemi) |
| Etkileşim | Vanilla JavaScript |
| Yayın | GitHub Pages |

Framework kullanılmıyor — proje bilinçli olarak temel web teknolojileriyle, sıfırdan öğrenme amacıyla inşa ediliyor.

> Not: Daha önce bir iOS versiyonu (SwiftUI) planlanmıştı; erişilebilirlik için web versiyonuna geçildi.

## Dosya Yapısı

```
paktolos/
├── index.html           # Ana sayfa
├── hikaye.html          # Paktolos'un hikâyesi: Midas, nehir ve ilk para
├── ekonomi.html         # Ekonomi: dört gösterge, kavramlar, haberi anla
├── piyasalar.html       # Piyasalar: şirket analizi rehberleri, dersler, kavramlar
├── rehberler.html       # Rehberler: uzun anlatımlar ve soru kütüphanesi
├── tasarim.html         # Tasarım sistemi kataloğu (menüde yok)
├── dersler.html         # Paktolos Okulu: etkileşimli dersler (menüde "Öğren")
├── ogren.html           # Mali tablolar ve temel oranlar (ayrıntılı)
├── analiz.html          # Yedi adımda analiz ve oran hesaplayıcı
├── sektorler.html       # Sektöre göre farklı okuma
├── araclar.html         # Araç kutusu: kredi, asgari ödeme, taksit/peşin, birikim hedefi, bileşik büyüme, enflasyon, erken başlamak
├── lab.html             # Şirket laboratuvarı: hayali bir şirkette üç mali tabloyu canlı değiştir
├── checkup.html         # Finansal check-up: bütçe, acil durum fonu, borç yükü, birikim oranı
├── sorular.html         # "Aklına takılan": günlük hayattan para soruları
├── sozluk.html          # Finans sözlüğü
├── kavram.html          # Kavram sayfası (kavram.html?k=enflasyon): katmanlı anlatım
├── ekonomi-haritasi.html # "Ekonomi nasıl çalışır?" etkileşimli haritası
├── test.html            # Kendini sına
├── karnem.html          # Karnem: ilerleme, finansal temeller, okuma listesi, son baktıkların
│
├── dersler-veri.js      # Dersler (kartlar ve ara sorular)
├── sozluk-veri.js       # Sözlükteki kavramlar
├── kavramlar-veri.js    # Seçili kavramların derin katmanı, görselleri ve kaynakları
├── sorular-veri.js      # "Aklına takılan" soruları
├── test-veri.js         # Test soruları
├── arama-veri.js        # Site geneli arama dizini (sayfa ve bölümler)
│
├── tasarim/             # Tasarım sistemi: tokenlar.css, bilesenler.css
├── style.css            # Sayfa stilleri
├── script.js            # Ortak etkileşimler: arama, sözlük, sorular, tema, test
├── grafik.js            # Veri görselleştirme sistemi: grafik(), grafikFigur(), tablo görünümü
├── araclar.js           # Araç kutusu hesaplamaları
├── okul.js              # Dersler, günün sorusu ve Karnem
├── lab-model.js         # Laboratuvarın muhasebe modeli (üç tablo birbirine bağlı)
├── lab.js               # Laboratuvar arayüzü: kollar, senaryolar, canlı tablolar
├── checkup.js           # Finansal check-up hesapları ve göstergeleri
├── akis.js              # Kaydırmalı infografikler ve etkileşimli tablolar
├── ekonomi.js           # Ekonomi ağı ve faiz zinciri görselleri
├── kavram.js            # Kavram sayfasını katmanlı olarak çizer
├── harita.js            # Ekonomi haritası: kurumlar, akışlar, senaryo turu
├── ekonomi-veri.js      # Göstergeler, faiz zinciri ve ekonomi ağı (içerik)
├── tema.js              # Açık/koyu tema; sayfa çizilmeden önce çalışır
├── sw.js                # Çevrimdışı destek (service worker)
├── manifest.webmanifest # Uygulama olarak yükleme bilgileri
├── icon.svg, icons/     # Logo ve uygulama simgeleri
├── gelistirme/          # Geliştirme yardımcıları (ortak menü üretici)
├── README.md
└── LICENSE
```

## Kullanıcı Verisi

Paktolos'ta hesap yoktur. İlerleme (tamamlanan dersler, okunan kavram ve sorular, test skoru, günlük seri, denenen laboratuvar senaryoları, okunan rehberler, okuma listesi ve son baktıkların) ve check-up'a girilen rakamlar yalnızca kullanıcının tarayıcısında, `localStorage`'da tutulur ve hiçbir yere gönderilmez. Karnem sayfasından sıfırlanabilir.

## İçerik Ekleme

- **Yeni kavram:** `sozluk-veri.js` içindeki `SOZLUK` listesine ekle; kavram sayfası (`kavram.html?k=id`) kendiliğinden oluşur. Derin katman, kaynak ve görsel için `kavramlar-veri.js`'e aynı id ile ekle. Kaynak olarak yalnızca resmî kurum ve yayın adı yazılır. `ilgili` alanındaki kimliklerin var olan kavramlara ait olması gerekir. Kavramlar aramaya otomatik girer.
- **Yeni ders:** `dersler-veri.js` içindeki `DERSLER` listesine ekle. Kart türleri: `metin`, `ornek`, `soru`, `ozet`. Dersteki sorular günün sorusu havuzuna da otomatik girer.
- **Yeni test sorusu:** `test-veri.js` içindeki `SORULAR` listesine ekle; "Neden?" (`aciklama`), "Gerçek hayatta" (`gercek`) ve ilgili kavramları (`kavramlar`) doldur.
- **Yeni "Aklına takılan" sorusu:** `sorular-veri.js` içindeki `SORULAR_KUTUPHANE` listesine ekle. Cevap tavsiye değil, düşünme yolu olmalı. Soru aramaya otomatik girer.
- **Yeni sayfa ya da bölüm:** `arama-veri.js`'e ekle ki aramada çıksın. Sayfanın ortak menü ve alt bilgisini `python3 gelistirme/ortak-duzen.py *.html` ile oluştur. Dosyayı `sw.js` içindeki `DOSYALAR` listesine ekleyip `SURUM`'u bir artır.
- **Yeni laboratuvar senaryosu:** `lab.js` içindeki `SENARYOLAR` listesine ekle; `ayar` yalnızca başlangıçtan farklı kolları içerir, `anlat(m)` modelin sonucuna göre hikâyeyi yazar. Modelin kuralları `lab-model.js` başındaki açıklamada. Karnem'deki "Şirket doktoru" kilometre taşı senaryo sayısını kullanır.
- **Yeni kaydırmalı infografik:** HTML'de `<section class="akis" data-akis="ad">` içine boş bir `.akis-sahne` ve her adım için bir `.akis-adim` yaz. `akis.js` içindeki `SAHNELER`'e aynı adla, verilen kaba görseli çizip adım numarasına göre güncelleyen bir fonksiyon ekle. Sahne her adımda durumu baştan çizmeli; kullanıcı adım atlayabilir. Metin HTML'de durduğu için JS kapalıyken de okunur.
- **Yeni bileşen:** önce `tasarim/bilesenler.css`'e, sonra `tasarim.html` kataloğuna ekle.
- **Grafikler:** `grafik.js` içindeki `grafik()` ya da başlık, not ve kaynakla sarılmış `grafikFigur()` bileşenini kullan; `baglam(i)` ile ipucuna anlam satırı ekle. Seri renkleri `SERI[0]` (`--data-1`) ve `SERI[1]` (`--data-2`); renk körlüğü dahil ayırt edilebilirlikleri doğrulandı. İkiden fazla seri gerekirse yeni renk doğrulanmadan eklenmemeli.
- **Renkler:** Doğrudan renk yazma; `tasarim/tokenlar.css` değişkenlerini kullan. Böylece karanlık mod kendiliğinden çalışır.

## Yerelde Çalıştırma

Kurulum gerekmez: `index.html` dosyasını tarayıcıda açmak yeterli.

## Yol Haritası

- [x] Tasarım sistemi (renk, tipografi, spacing) tanımlandı
- [x] GitHub Pages üzerinden yayınla
- [x] Açılış ekranı ve apple.com tarzı akışkan tasarım
- [x] Öğren: mali tablolar ve temel oranlar
- [x] Adım adım analiz ve oran hesaplayıcı
- [x] Sektörlere göre analiz rehberi
- [x] Finans sözlüğü (67 kavram, mini hesaplayıcılar)
- [x] Kendini sına: oran yorumlama testi
- [x] iOS tarzı cam görünüm (v2 ile sade yüzeylere geçildi)
- [x] Paktolos'un hikâyesi
- [x] Site geneli arama, karanlık mod, uygulama olarak yükleme
- [x] Araç kutusu: kredi, asgari ödeme, taksit/peşin, birikim hedefi, erken başlamak
- [x] "Aklına takılan" soru kütüphanesi (25 soru, 5 konu)
- [x] Paktolos Okulu (7 ders), Karnem, rozetler ve günün sorusu
- [x] Okuma listesi: kavram, rehber, harita ve araçlarda "Kaydet"; Karnem'de finansal temeller ilerlemesi ve son baktıkların
- [x] Şirket laboratuvarı: 8 senaryo, canlı gelir tablosu, bilanço ve nakit akışı
- [x] Finansal check-up: dört göstergede kişisel finans durumu
- [x] "Damla" sayfa geçişi, kaydırmalı infografikler, etkileşimli oran tablosu ve sektör haritası
- [x] Tasarım sistemi v2: tokenlar, bileşen kütüphanesi, yeni bilgi mimarisi (Öğren, Ekonomi, Piyasalar, Rehberler, Araçlar)
- [x] Ana sayfa: ekonomi ağı, dört gösterge, finansal temeller, "Faiz değişince ne olur?", veri hikâyesi, rehberler, araçlar
- [x] Kavram sistemi: 67 kavram için katmanlı sayfa; 12 temel kavramda derin katman, kaynaklar ve etkileşimli görsel
- [x] Makale deneyimi (künye, bölüm sonu "Akılda kalsın", ilgili kavramlar, kaynakça) ve ortak veri görselleştirme sistemi
- [x] "Ekonomi nasıl çalışır?" etkileşimli haritası: altı kurum, para, kredi ve sermaye akışları, "Faiz artarsa" turu
- [x] Hesaplayıcılar (bileşik büyüme, enflasyon), açıklamalı test geri bildirimi, kategorili arama paleti
- [x] Kaydedilenler ve öğrenme ilerlemesi
- [x] Kalite turu: kontrast (AA), 44 piksel dokunma alanları, "İçeriğe geç" bağlantısı, başlık sırası, 320 piksele kadar taşmasız düzen, yükleme sırasında kaymayan sayfalar
- [ ] Yeni dersler: risk ve çeşitlendirme, nakit akışı, sektör analizi
- [ ] KAP'ta mali tablo bulma rehberi (ekran görüntüleriyle)
- [ ] Sözlüğü genişletme

## Geliştirici Notu

Bu proje, finans sektöründeki profesyonel deneyimimi (bankacılık — finansal tablo analizi ve kredi risk değerlendirmesi) ürün geliştirme becerileriyle birleştirme amacıyla sıfırdan geliştiriliyor.
