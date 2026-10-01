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
- Sıcak kâğıt üzerinde serif: beyaz zemin, sis grisi düz kartlar, mürekkep siyahı (#17191C) yazı ve hap düğmeler. Sistem neredeyse renksizdir.
- Başlıklar Newsreader serif, her boyutta 400 ağırlık; vurgu kalınlıkla değil, eğik bir kelimeyle. Gövde Inter.
- Tek sıcak vurgu şeftali kart (#FBE1D1, kahve mürekkep #5D2A1A), sayfa başına en fazla bir kez. Başlıkların arkasında yumuşak ışık huzmeleri.
- Gölgeyi yalnızca başlıkların çevresinde duran "yüzen" arayüz parçaları taşır. Markanın turuncusu yalnızca logoda ve hikâye çizimlerinde.
- İnce çizgi çizimler (1,25 px mürekkep, şeftali dolgu ve sikke turuncusu yalnızca vurgu): merkez sayfalarının başlıklarında ve ana sayfada.
- Hareket: kelime kelime beliren başlıklar, kaydırınca derinlik veren yüzen parçalar, kendiliğinden ilerleyen sekmeli liste, kayan şerit.
- Katmanlı anlatım: önce basitçe, sonra nasıl çalıştığı, gerçek hayattaki karşılığı, daha derini ve kaynaklar.
- "Bu ne anlama geliyor?": her gösterge, sana dokunan üç kısa sonuca açılır.
- Grafikler süs değil, bir fikri anlatır: ince çizgiler, az ızgara, doğrulanmış iki renk. Arayüz renksiz olduğu için renk yalnızca veride konuşur.
- Karanlık mod ters çevirme değil, ayrı ayrı seçilmiş değerlerdir.
- "Damla" sayfa geçişi, kaydırdıkça ilerleyen infografikler, dokunarak keşfedilen tablolar.
- Erişilebilirlik: WCAG AA, klavye ile gezinme, görünür odak, 44 piksel dokunma alanı, "azaltılmış hareket" tercihine saygı.

## Tasarım Sistemi

Canlı katalog: **`tasarim.html`**. Yeni bir şey tasarlamadan önce oraya bak.

| Katman | Dosya | İçerik |
|---|---|---|
| Tokenlar | `tasarim/tokenlar.css` | Yazı tipleri, renk (açık/koyu), yazı ölçeği, 4 noktalı boşluk, köşe, gölge, ışık, hareket, yerleşim |
| Yazı tipleri | `tasarim/fontlar/` | Newsreader ve Inter (SIL OFL); yalnızca kullanılan ağırlık ve Türkçe harfler, toplam ~88 KB |
| Bileşenler | `tasarim/bilesenler.css` | Menü, alt çubuk, alt bilgi, düğme, rozet, etiket, kartlar, sayı, bölüm başlığı, sekmeler, ipucu, akordeon, ilerleme, anahtar, öğrenme blokları, "Bu ne anlama geliyor?", boş/hata/yükleniyor durumları |
| Sayfa stilleri | `style.css` | Sayfalara özel stiller; eski değişken adları yeni tokenlara bağlıdır |
| Etkileşim | `script.js` → BİLEŞENLER, HAREKET | Sekmeler (ok tuşlarıyla), açılır kutu, kelime kelime başlık, yüzen parçalar, sekmeli liste, kayan şerit |

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

Ana sayfa akışı: ortada serif başlık ve çevresinde yüzen örnek parçalar → uygulama penceresinde ekonomi ağı → kaynak şeridi → "Finansı öğrenmenin yeni bir yolu" (şeftali kart + iki kart) → Öğren (sekmeli liste) → dört gösterge → sekiz temel kavram → koyu bölüm: ekonomi şeması → faiz zinciri → araçlar penceresi → veri hikâyesi → hikâye bandı → kapanış.

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
├── kavram.html          # Kavram sayfasının kabuğu; eski kavram.html?k=… adresi de çalışır
├── kavram/             # 67 statik kavram sayfası (npm run uret üretir)
├── ders/               # 12 statik ders sayfası (npm run uret üretir)
├── paylas/             # Paylaşım önizleme görselleri, 1200×630 (npm run uret)
├── sitemap.xml, 404.html  # Site haritası ve bulunamadı sayfası (npm run uret)
├── ekonomi-haritasi.html # "Ekonomi nasıl çalışır?" etkileşimli haritası
├── test.html            # Kendini sına
├── testler/            # Otomatik testler (npm test); CI: .github/workflows/testler.yml
├── gelistirme/statik-uret.mjs  # Statik sayfa, görsel ve site haritası üretici (npm run uret)
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
├── olcum.js             # Anonim ölçüm olayları (şu an hiçbir yere gönderilmez)
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

### Ölçüm

Sitede neyin işe yaradığını görmek için anonim olaylar tanımlıdır (`olcum.js`). **Şu an hiçbir ölçüm aracı bağlı değildir; hiçbir veri siteden dışarı çıkmaz.** Olaylar yalnızca açık olan sekmede tutulur; testler, hiçbir sayfanın dışarıya istek yapmadığını her PR'da denetler.

| Olay | Ne zaman? | Gönderilen |
|---|---|---|
| `sayfa` | Bir sayfa açıldı | sayfanın dosya adı |
| `ders_basladi` / `ders_bitti` / `ders_birakildi` | Ders açıldı / bitti / bitmeden kapatıldı | ders, doğru sayısı, bırakılan kart |
| `kavram_acildi`, `rehber_bitti` | Kavram sayfası açıldı, uzun anlatımın sonuna gelindi | kavram, sayfa |
| `arama_secildi` | Aramada bir sonuca gidildi | sonucun türü (yazılan metin **gönderilmez**) |
| `arac_kullanildi`, `checkup_kullanildi`, `lab_senaryo` | Hesaplayıcı, check-up ya da laboratuvar kullanıldı | araç ya da senaryo adı (girilen rakam **gönderilmez**) |
| `test_bitti`, `gunun_sorusu` | Test bitti, günün sorusu cevaplandı | skor, doğru mu |
| `harita_oyuncu`, `harita_tur` | Ekonomi haritasında oyuncu seçildi, turda ilerlendi | oyuncu, adım |
| `kaydet`, `tema` | Okuma listesine eklendi, görünüm değişti | içerik türü, tema |
| `hata` | Yakalanmamış betik hatası | mesajın ilk 80 karakteri, dosya:satır |

Kurallar: çerez yok, kullanıcı kimliği yok; kullanıcının girdiği rakamlar ve arama metni hiçbir zaman gönderilmez; katalogda olmayan olay gönderilmez (testler koddaki her `olc('…')` çağrısının katalogda olduğunu denetler). Olayları tarayıcı konsolunda görmek için adresin sonuna `?olcum=goster` ekle.

**Bir araç bağlamak:** `olcum.js` başındaki `OLCUM_AYAR`'a sağlayıcıyı (`goatcounter`, `umami` ya da `plausible`) ve kimliği yaz. Hazır bağdaştırıcılar dosyadadır; aracın betiği yalnızca ilk olayda yüklenir. Bağlamadan önce bu bölümü ve sitedeki gizlilik açıklamasını güncelle; veri testi, araç bağlandığında bunu hatırlatmak için `OLCUM_BAGLI=1` ister. Testlerin "dışarıya istek yok" denetimi de o zaman aracın alan adına izin verecek şekilde güncellenmelidir.

## İçerik Ekleme

- **Yeni kavram:** `sozluk-veri.js` içindeki `SOZLUK` listesine ekle; ardından `npm run uret` ile statik sayfası (`kavram/id.html`) ve paylaşım görseli üretilir. Derin katman, kaynak ve görsel için `kavramlar-veri.js`'e aynı id ile ekle. Kaynak olarak yalnızca resmî kurum ve yayın adı yazılır. `ilgili` alanındaki kimliklerin var olan kavramlara ait olması gerekir. Kavramlar aramaya otomatik girer.
- **Yeni ders:** `dersler-veri.js` içindeki `DERSLER` listesine ekle. Kart türleri: `metin`, `ornek`, `soru`, `ozet`. Dersteki sorular günün sorusu havuzuna da otomatik girer. Şıkları istediğin sırada yazabilirsin: ekranda soru metnine göre sabit bir karışımla gösterilir, böylece doğru cevap hep aynı harfte olmaz. Yeni bir yol için `DERS_YOLLARI`na ekle. Ardından `npm run uret` (ders sayfası `ders/id.html`).
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

## Arama Motorları ve Paylaşım

Arama motorları ve paylaşım önizlemeleri (WhatsApp, X, LinkedIn) JavaScript çalıştırmadan sayfayı okur. Bu yüzden içeriği önceden yazılmış statik sayfalar üretilir:

```bash
npm run uret   # ~1 dk: kavram/*.html, ders/*.html, paylas/*.jpg, sitemap.xml, 404.html
```

- **Kavram sayfaları** sitenin kendi `kavram.js`'i tarayıcıda çalıştırılarak üretilir (iki ayrı kopya yok); açılınca aynı betik etkileşimli kısımları canlandırır. Alt klasördeki sayfalar `<base href="../">` ile kökteki stilleri ve betikleri kullanır.
- **Ders sayfaları** dersin okunabilir özetidir (kartlar, sorular ve cevapları); "Derse başla" etkileşimli oynatıcıyı açar.
- Her sayfada asıl adres (`canonical`), paylaşım kartı (Open Graph) ve kavram/ders için yapılandırılmış veri (schema.org) vardır. Kök sayfaların etiketlerini `gelistirme/ortak-duzen.py` yazar.
- **Ne zaman çalıştırılır?** Sözlük, ders verisi, `kavram.js` ya da menü değiştiğinde. Unutulursa testler hangi sayfanın eskidiğini söyler.

**Google'a bildirmek (bir kez, elle):** [Google Search Console](https://search.google.com/search-console)'a `https://aydemirahmetburak.github.io/paktolos/` adresini "URL ön eki" olarak ekle, doğrula ve "Site haritaları" bölümüne `sitemap.xml` gönder. Site bir proje sayfası (`/paktolos/` alt yolu) olduğu için `robots.txt` arama motorlarınca okunmaz; site haritası bu yüzden Search Console'dan gönderilir.

## Testler

Site derleme gerektirmez; Node.js yalnızca testler için kullanılır.

```bash
npm install                      # bir kez (Playwright)
npx playwright install chromium  # bir kez
npm test                         # tüm testler (~3 dk)
npm run test:veri                # yalnızca veri ve bağlantılar (~1 sn)
npm test -- akislar              # tek bir grup
```

| Grup | Dosya | Ne denetler? |
|---|---|---|
| Veri ve bağlantılar | `testler/veri.mjs` | Ders ve test sorularında doğru cevap geçerli mi, bağlı kavramlar sözlükte var mı; site içi her bağlantı var olan bir sayfaya ve bölüme gidiyor mu; `sw.js` önbellek listesi eksiksiz mi; menü ve alt bilgi `ortak-duzen.py` ile güncel mi; PR'da önbellekteki bir dosya değiştiyse `SURUM` artırılmış mı |
| Tüm sayfalar | `testler/tarama.mjs` | 19 sayfa × açık/koyu × 320/390/820/1280 px ve 67 kavram sayfası: sayfa ve konsol hatası, eksik dosya, yatay taşma, ekranda "undefined/NaN" |
| Erişilebilirlik | `testler/erisilebilirlik.mjs` | Kontrast (AA), 44 px dokunma alanı, tek h1 ve başlık sırası, tekrar eden kimlik, adsız düğme, alt metin, "İçeriğe geç" |
| Kullanıcı akışları | `testler/akislar.mjs` | Arama, sözlük, ders oynatma, kredi hesaplayıcı, Kaydet → Karnem, test, günün sorusu, tema, ekonomi haritası, ana sayfa sekmeleri |
| Yükleme kayması | `testler/kararlilik.mjs` | Her sayfada CLS ≤ 0,05 |

Her PR'da ve `main`'e her gönderimde GitHub Actions tüm testleri çalıştırır (`.github/workflows/testler.yml`). Kontrol kırmızıysa PR birleştirilmemeli; hangi sayfada neyin bozulduğu "Testler" adımının çıktısında yazar.

Yeni bir özellik eklerken en az bir akış testi (`testler/akislar.mjs`) ekle. Yeni bir veri alanı eklerken `testler/veri.mjs`'e doğrulamasını ekle.

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
- [x] Paktolos Okulu (12 ders, üç yol), Karnem, kilometre taşları ve günün sorusu
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
- [x] Yeni tasarım dili: sıcak kâğıt üzerinde serif (Newsreader + Inter), yeni ana sayfa, hareket bileşenleri, çizimler
- [x] Kalite turu: kontrast (AA), 44 piksel dokunma alanları, "İçeriğe geç" bağlantısı, başlık sırası, 320 piksele kadar taşmasız düzen, yükleme sırasında kaymayan sayfalar
- [x] Yeni dersler: risk ve çeşitlendirme, yatırım araçları, düzenli yatırım, nakit akışı, sektör analizi
- [ ] KAP'ta mali tablo bulma rehberi (ekran görüntüleriyle)
- [ ] Sözlüğü genişletme

## Geliştirici Notu

Bu proje, finans sektöründeki profesyonel deneyimimi (bankacılık — finansal tablo analizi ve kredi risk değerlendirmesi) ürün geliştirme becerileriyle birleştirme amacıyla sıfırdan geliştiriliyor.
