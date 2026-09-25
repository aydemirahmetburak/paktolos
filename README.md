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

Paktolos'un tasarım dili, karmaşık finansal bilgiyi sadeleştirme misyonuyla birebir örtüşüyor:

- Minimalist, dikkat dağıtmayan arayüz; apple.com'dan ilham alan akışkan geçişler
- Kaydırdıkça beliren bölümler, yumuşak açılan paneller, sayfalar arası geçiş efekti
- iOS tarzı cam yüzeyler: yarı saydam katmanlar, ışık kenarı, arkada süzülen sıcak renk ışımaları
- Telefonda altta yüzen cam sekme çubuğu, alttan kayan ve aşağı çekilerek kapanan pencereler
- Karanlık mod: telefonun ayarını izler; alt bilgiden elle de seçilebilir
- Telefona uygulama olarak yüklenebilir, internet olmadan da açılır
- "Azaltılmış hareket" tercihine saygı
- Bilgi yalnızca ihtiyaç duyulduğunda görünür (katmanlı bilgi mimarisi)
- 8pt grid sistemi, sistem yazı tipi (Apple cihazlarda SF Pro)
- Braun'dan ilham alan sade renk paleti
- Her etkileşim anlamlı ve amaçlı

Renkler, boşluklar, yazı ölçeği, köşe yuvarlaklıkları ve hareket eğrileri `style.css` dosyasının başında CSS değişkenleri (`--color-*`, `--space-*`, `--text-*`, `--radius-*`, `--ease*`) olarak tanımlı. Yeni bileşenler bu değişkenleri kullanmalı.

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
├── dersler.html         # Paktolos Okulu: etkileşimli dersler (menüde "Öğren")
├── ogren.html           # Mali tablolar ve temel oranlar (ayrıntılı)
├── analiz.html          # Yedi adımda analiz ve oran hesaplayıcı
├── sektorler.html       # Sektöre göre farklı okuma
├── araclar.html         # Araç kutusu: kredi, asgari ödeme, taksit/peşin, birikim hedefi, erken başlamak
├── sorular.html         # "Aklına takılan": günlük hayattan para soruları
├── sozluk.html          # Finans sözlüğü
├── test.html            # Kendini sına
├── karnem.html          # Karnem: ilerleme, rozetler, günün sorusu
│
├── dersler-veri.js      # Dersler (kartlar ve ara sorular)
├── sozluk-veri.js       # Sözlükteki kavramlar
├── sorular-veri.js      # "Aklına takılan" soruları
├── test-veri.js         # Test soruları
├── arama-veri.js        # Site geneli arama dizini (sayfa ve bölümler)
│
├── style.css            # Tasarım sistemi, cam katmanı, karanlık mod
├── script.js            # Ortak etkileşimler: arama, sözlük, sorular, tema, test
├── araclar.js           # Araç kutusu hesaplamaları ve grafik bileşeni
├── okul.js              # Dersler, günün sorusu ve Karnem
├── tema.js              # Açık/koyu tema; sayfa çizilmeden önce çalışır
├── sw.js                # Çevrimdışı destek (service worker)
├── manifest.webmanifest # Uygulama olarak yükleme bilgileri
├── icon.svg, icons/     # Uygulama simgeleri
├── gelistirme/          # Geliştirme yardımcıları (ortak menü üretici)
├── README.md
└── LICENSE
```

## Kullanıcı Verisi

Paktolos'ta hesap yoktur. İlerleme (tamamlanan dersler, okunan kavram ve sorular, test skoru, günlük seri) yalnızca kullanıcının tarayıcısında, `localStorage`'da tutulur ve hiçbir yere gönderilmez. Karnem sayfasından sıfırlanabilir.

## İçerik Ekleme

- **Yeni kavram:** `sozluk-veri.js` içindeki `SOZLUK` listesine ekle. `ilgili` alanındaki kimliklerin var olan kavramlara ait olması gerekir. Kavramlar aramaya otomatik girer.
- **Yeni ders:** `dersler-veri.js` içindeki `DERSLER` listesine ekle. Kart türleri: `metin`, `ornek`, `soru`, `ozet`. Dersteki sorular günün sorusu havuzuna da otomatik girer.
- **Yeni test sorusu:** `test-veri.js` içindeki `SORULAR` listesine ekle.
- **Yeni "Aklına takılan" sorusu:** `sorular-veri.js` içindeki `SORULAR_KUTUPHANE` listesine ekle. Cevap tavsiye değil, düşünme yolu olmalı. Soru aramaya otomatik girer.
- **Yeni sayfa ya da bölüm:** `arama-veri.js`'e ekle ki aramada çıksın. Sayfanın ortak menü ve alt bilgisini `python3 gelistirme/ortak-duzen.py *.html` ile oluştur. Dosyayı `sw.js` içindeki `DOSYALAR` listesine ekleyip `SURUM`'u bir artır.
- **Yeni cam yüzey:** `style.css` içindeki "CAM KATMANI" bölümündeki seçici listelerine ekle.
- **Grafikler:** `araclar.js` içindeki `grafik()` bileşenini kullan. Seri renkleri `--chart-1` ve `--chart-2`; renk körlüğü dahil ayırt edilebilirlikleri doğrulandı. İkiden fazla seri gerekirse yeni renk doğrulanmadan eklenmemeli.
- **Renkler:** Doğrudan renk yazma; `--color-*` değişkenlerini ya da `rgba(var(--ink), 0.08)` gibi tema kanallarını kullan. Böylece karanlık mod kendiliğinden çalışır.

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
- [x] iOS tarzı cam görünüm
- [x] Paktolos'un hikâyesi
- [x] Site geneli arama, karanlık mod, uygulama olarak yükleme
- [x] Araç kutusu: kredi, asgari ödeme, taksit/peşin, birikim hedefi, erken başlamak
- [x] "Aklına takılan" soru kütüphanesi (25 soru, 5 konu)
- [x] Paktolos Okulu (6 ders), Karnem, rozetler ve günün sorusu
- [ ] Yeni dersler: risk ve çeşitlendirme, nakit akışı, sektör analizi
- [ ] KAP'ta mali tablo bulma rehberi (ekran görüntüleriyle)
- [ ] Sözlüğü genişletme

## Geliştirici Notu

Bu proje, finans sektöründeki profesyonel deneyimimi (bankacılık — finansal tablo analizi ve kredi risk değerlendirmesi) ürün geliştirme becerileriyle birleştirme amacıyla sıfırdan geliştiriliyor.
