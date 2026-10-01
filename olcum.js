// Ölçüm: insanlar sitede ne yapıyor?
//
// Sayfa kodu yalnızca olc("olay_adi", { ozellik: deger }) çağırır; olayın
// nereye gideceğine bu dosyadaki OLCUM_AYAR karar verir. Sağlayıcı seçilmediyse
// (varsayılan) hiçbir yere bir şey gönderilmez: olaylar yalnızca bu sekmede,
// window.__olcum dizisinde tutulur (testler bunu okur).
//
// Gizlilik kuralları (sağlayıcı bağlansa da geçerli):
//   - Çerez yok, kullanıcı kimliği yok, IP saklanmaz (seçilecek araç da öyle olmalı).
//   - Kullanıcının girdiği rakamlar (maaş, kredi tutarı…) ve arama metni ASLA gönderilmez.
//   - Yalnızca OLAYLAR listesindeki adlar ve izin verilen özellikler gider.
//
// Tarayıcı konsolunda olayları görmek için adresin sonuna ?olcum=goster ekle
// (bir kez yeterli; kapatmak için ?olcum=gizle).

(function () {
  // ---------- Ayar: bir araç seçildiğinde yalnızca burası değişir ----------
  //   saglayici: null | 'goatcounter' | 'umami' | 'plausible'
  //   kimlik:    goatcounter → 'paktolos' (paktolos.goatcounter.com)
  //              umami       → site kimliği (UUID)
  //              plausible   → alan adı (ör. 'aydemirahmetburak.github.io')
  var OLCUM_AYAR = { saglayici: null, kimlik: '' };

  // ---------- Olay kataloğu: ölçülen her şey burada, anlamıyla ----------
  // Yeni bir olay eklerken önce buraya yaz; listede olmayan olay gönderilmez.
  var OLAYLAR = {
    sayfa:            ['yol'],                       // bir sayfa açıldı
    ders_basladi:     ['ders'],                      // ders oynatıcı açıldı
    ders_birakildi:   ['ders', 'kart', 'toplam'],    // bitmeden kapatıldı: hangi kartta?
    ders_bitti:       ['ders', 'dogru', 'soru'],     // son karta ulaşıldı
    kavram_acildi:    ['kavram'],                    // kavram sayfası
    rehber_bitti:     ['sayfa'],                     // uzun anlatımın sonuna gelindi
    arama_secildi:    ['tur'],                       // arama paletinde bir sonuca gidildi (metin gönderilmez)
    arac_kullanildi:  ['arac'],                      // hesaplayıcıda ilk değişiklik (rakam gönderilmez)
    lab_senaryo:      ['senaryo'],                   // laboratuvarda hazır senaryo
    checkup_kullanildi: [],                          // check-up'ta ilk değişiklik (rakam gönderilmez)
    test_bitti:       ['skor', 'soru'],              // Kendini sına bitti
    gunun_sorusu:     ['dogru'],                     // günün sorusu cevaplandı
    harita_oyuncu:    ['oyuncu'],                    // ekonomi haritasında bir oyuncu seçildi
    harita_tur:       ['adim'],                      // "Faiz artarsa" turunda ilerlendi
    kaydet:           ['tur'],                       // okuma listesine eklendi
    tema:             ['tema'],                      // görünüm değiştirildi
    hata:             ['mesaj', 'kaynak']            // yakalanmamış betik hatası
  };

  var kayit = window.__olcum = [];
  var goster = false;
  try {
    var q = new URLSearchParams(location.search).get('olcum');
    if (q === 'goster') localStorage.setItem('paktolos-olcum-goster', '1');
    if (q === 'gizle') localStorage.removeItem('paktolos-olcum-goster');
    goster = localStorage.getItem('paktolos-olcum-goster') === '1';
  } catch (e) { /* gizli sekme */ }

  // ---------- Sağlayıcı bağdaştırıcıları ----------
  // Her biri yalnızca seçildiğinde, ilk olayda ve sayfa yüklendikten sonra
  // betiğini yükler. Seçilmeyenler hiçbir istek yapmaz.
  var bekleyen = [];
  var hazir = false;
  var BAGDASTIRICI = {
    goatcounter: {
      betik: function () { return { src: 'https://gc.zgo.at/count.js', attrs: { 'data-goatcounter': 'https://' + OLCUM_AYAR.kimlik + '.goatcounter.com/count', 'data-goatcounter-settings': '{"no_onload": true}' } }; },
      gonder: function (ad, oz) {
        if (!window.goatcounter || !window.goatcounter.count) return false;
        if (ad === 'sayfa') window.goatcounter.count({ path: oz.yol });
        else window.goatcounter.count({ path: ad + (oz && Object.keys(oz).length ? '/' + Object.keys(oz).map(function (k) { return oz[k]; }).join('/') : ''), title: ad, event: true });
        return true;
      }
    },
    umami: {
      betik: function () { return { src: 'https://cloud.umami.is/script.js', attrs: { 'data-website-id': OLCUM_AYAR.kimlik, 'data-auto-track': 'false' } }; },
      gonder: function (ad, oz) {
        if (!window.umami) return false;
        if (ad === 'sayfa') window.umami.track(function (p) { return Object.assign({}, p, { url: oz.yol }); });
        else window.umami.track(ad, oz);
        return true;
      }
    },
    plausible: {
      betik: function () { return { src: 'https://plausible.io/js/script.manual.js', attrs: { 'data-domain': OLCUM_AYAR.kimlik } }; },
      gonder: function (ad, oz) {
        if (!window.plausible) return false;
        window.plausible(ad === 'sayfa' ? 'pageview' : ad, ad === 'sayfa' ? { u: location.origin + oz.yol } : { props: oz });
        return true;
      }
    }
  };
  var bag = OLCUM_AYAR.saglayici && OLCUM_AYAR.kimlik ? BAGDASTIRICI[OLCUM_AYAR.saglayici] : null;

  function betikYukle() {
    if (!bag || hazir) return;
    hazir = true;
    var b = bag.betik();
    var s = document.createElement('script');
    s.async = true;
    s.src = b.src;
    Object.keys(b.attrs).forEach(function (k) { s.setAttribute(k, b.attrs[k]); });
    s.onload = function () { bekleyen.splice(0).forEach(function (x) { bag.gonder(x[0], x[1]); }); };
    document.head.appendChild(s);
  }

  // ---------- Herkese açık işlev ----------
  window.olc = function (ad, ozellikler) {
    var izinli = OLAYLAR[ad];
    if (!izinli) { if (goster) console.warn('[ölçüm] katalogda olmayan olay:', ad); return; }
    var oz = {};
    izinli.forEach(function (k) {
      if (ozellikler && ozellikler[k] !== undefined && ozellikler[k] !== null) oz[k] = String(ozellikler[k]).slice(0, 80);
    });
    kayit.push({ ad: ad, oz: oz, t: Date.now() });
    if (kayit.length > 200) kayit.shift();
    if (goster) console.info('[ölçüm]', ad, oz);
    if (!bag) return;
    if (!bag.gonder(ad, oz)) { bekleyen.push([ad, oz]); betikYukle(); }
  };

  // Sayfa görüntüleme: yalnızca dosya adı (sorgu ve kişisel bilgi yok);
  // kavram sayfalarında hangi kavram olduğu ayrıca kavram_acildi ile gelir.
  // Yol, sitenin köküne göre: '/index.html', '/kavram/faiz.html'. Kök, bu
  // betiğin adresinden bulunur (alt klasördeki sayfalarda da doğru çalışır).
  var kok = (document.currentScript && document.currentScript.src || '').replace(/olcum\.js.*$/, '');
  var yol = kok && location.href.indexOf(kok) === 0 ? location.href.slice(kok.length).split(/[?#]/)[0] : location.pathname.split('/').pop();
  window.olc('sayfa', { yol: '/' + (yol || 'index.html') });

  // Yakalanmamış hatalar: mesajın ilk 80 karakteri ve dosya:satır
  window.addEventListener('error', function (e) {
    if (!e.message) return;
    window.olc('hata', { mesaj: e.message, kaynak: (e.filename || '').split('/').pop() + ':' + (e.lineno || 0) });
  });
  window.addEventListener('unhandledrejection', function (e) {
    window.olc('hata', { mesaj: (e.reason && (e.reason.message || String(e.reason))) || 'promise', kaynak: 'promise' });
  });
})();
