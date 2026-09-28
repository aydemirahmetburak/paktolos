// Tema: sayfa çizilmeden önce çalışır, böylece karanlık modda beyaz parlama olmaz.
// Tercih "auto" (telefonun ayarını izle), "light" ya da "dark" olabilir.
(function () {
  var KEY = 'paktolos-tema';
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var tercih = 'auto';
  try { tercih = localStorage.getItem(KEY) || 'auto'; } catch (e) { /* gizli sekme */ }

  function uygula() {
    var tema = tercih === 'light' || tercih === 'dark' ? tercih : (media.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', tema);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tema === 'dark' ? '#08090A' : '#F7F7F5');
  }

  uygula();
  if (media.addEventListener) media.addEventListener('change', uygula);

  window.paktolosTema = {
    get: function () { return tercih; },
    set: function (deger) {
      tercih = deger;
      try {
        if (deger === 'auto') localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, deger);
      } catch (e) { /* yok say */ }
      uygula();
    }
  };
})();

// Sayfa geçişi: yeni sayfa, dokunulan noktadan genişleyen bir daire içinde
// açılır (style.css, "SAYFA GEÇİŞİ"). Dokunulan nokta script.js tarafından
// kaydedilir. Geri gelirken daire, bu sayfada en son dokunulan noktaya kapanır.
(function () {
  var kok = document.documentElement;

  // Oturumun ilk açılışı: menüdeki sikke bir kez "darp edilir" (style.css, ANA SAYFA)
  try {
    if (!sessionStorage.getItem('paktolos-acildi')) {
      kok.classList.add('ilk-acilis');
      sessionStorage.setItem('paktolos-acildi', '1');
    }
  } catch (_) { /* gizli sekme */ }

  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var geri = false;
    try { geri = navigation.activation.navigationType === 'traverse'; } catch (_) { /* eski tarayıcı */ }
    var nokta = null;
    try {
      var anahtar = geri ? 'paktolos-gecis:' + location.pathname : 'paktolos-gecis';
      nokta = JSON.parse(sessionStorage.getItem(anahtar));
      if (!geri) sessionStorage.removeItem('paktolos-gecis');
    } catch (_) { /* gizli sekme */ }
    var w = innerWidth, h = innerHeight;
    var x = w / 2, y = h / 2;
    if (nokta && (geri || Date.now() - nokta.t < 5000)) { x = nokta.x * w; y = nokta.y * h; }
    kok.style.setProperty('--gecis-x', x.toFixed(1) + 'px');
    kok.style.setProperty('--gecis-y', y.toFixed(1) + 'px');
    kok.style.setProperty('--gecis-r', Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 'px');
    kok.setAttribute('data-gecis', geri ? 'geri' : 'ileri');
    // Ekranda görünen öğeler geçişle birlikte, tek bir hareketle gelsin
    var sira = 0;
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) {
        el.style.setProperty('--delay', (0.08 + sira++ * 0.06).toFixed(2) + 's');
        el.classList.add('visible', 'gecisle');
      }
    });
    e.viewTransition.finished.finally(function () { kok.removeAttribute('data-gecis'); });
  });
})();

