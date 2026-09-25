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
    if (meta) meta.setAttribute('content', tema === 'dark' ? '#000000' : '#FFFFFF');
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
