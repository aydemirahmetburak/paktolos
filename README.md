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
├── index.html      # Ana sayfa: açılış ekranı, ilkeler, öğrenme yolu, günün kavramı, demo
├── ogren.html      # Bilanço, gelir tablosu, nakit akışı ve temel oranlar
├── analiz.html     # Yedi adımda analiz (Örnek A.Ş.) ve oran hesaplayıcı
├── sektorler.html  # Sektöre göre farklı okuma: banka, holding, GYO, perakende, sanayi, ulaştırma
├── sozluk.html     # Finans sözlüğü: arama, konu filtresi, kavram penceresi, mini hesaplayıcılar
├── test.html       # Kendini sına: 10 durumda oran yorumlama
├── sozluk-veri.js  # Sözlükteki kavramlar
├── test-veri.js    # Test soruları
├── style.css       # Tasarım sistemi (cam katmanı dahil) ve tüm stiller
├── script.js       # Tüm etkileşimler
├── README.md
└── LICENSE
```

## İçerik Ekleme

- **Yeni kavram:** `sozluk-veri.js` içindeki `SOZLUK` listesine bir nesne ekle. `ilgili` alanındaki kimliklerin var olan kavramlara ait olması gerekir.
- **Yeni soru:** `test-veri.js` içindeki `SORULAR` listesine ekle. `dogru`, doğru seçeneğin sırasıdır (0'dan başlar).
- **Yeni cam yüzey:** `style.css` içindeki "CAM KATMANI" bölümündeki seçici listelerine ekle.

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
- [ ] KAP'ta mali tablo bulma rehberi (ekran görüntüleriyle)
- [ ] Sözlüğü genişletme

## Geliştirici Notu

Bu proje, finans sektöründeki profesyonel deneyimimi (bankacılık — finansal tablo analizi ve kredi risk değerlendirmesi) ürün geliştirme becerileriyle birleştirme amacıyla sıfırdan geliştiriliyor.
