// Çevrimdışı destek
//
// Strateji: önce ağ. İnternet varsa her zaman en güncel sayfa gelir ve
// önbellek güncellenir; internet yoksa en son görülen sürüm açılır.
// Böylece yeni bir sürüm yayınlandığında kullanıcı eski dosyada kalmaz.
//
// Yeni bir sayfa ya da dosya eklendiğinde DOSYALAR listesine ekle ve
// SURUM değerini bir artır.

const SURUM = 'paktolos-v20';
const DOSYALAR = [
  './',
  'index.html', 'ogren.html', 'analiz.html', 'sektorler.html', 'sozluk.html', 'test.html', 'hikaye.html', 'araclar.html', 'sorular.html', 'dersler.html', 'karnem.html', 'lab.html', 'checkup.html', 'ekonomi.html', 'piyasalar.html', 'rehberler.html', 'tasarim.html', 'kavram.html', 'ekonomi-haritasi.html',
  'style.css', 'tasarim/tokenlar.css', 'tasarim/bilesenler.css',
  'tasarim/fontlar/nr-normal-latin.woff2', 'tasarim/fontlar/nr-normal-tr.woff2', 'tasarim/fontlar/nr-italic-latin.woff2', 'tasarim/fontlar/nr-italic-tr.woff2', 'tasarim/fontlar/inter-latin.woff2', 'tasarim/fontlar/inter-tr.woff2', 'script.js', 'tema.js', 'sozluk-veri.js', 'test-veri.js', 'arama-veri.js', 'grafik.js', 'araclar.js', 'sorular-veri.js', 'dersler-veri.js', 'okul.js', 'lab-model.js', 'lab.js', 'checkup.js', 'akis.js', 'ekonomi-veri.js', 'ekonomi.js', 'kavram.js', 'kavramlar-veri.js', 'harita.js',
  'manifest.webmanifest', 'icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SURUM).then(cache => cache.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SURUM).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const kopya = res.clone();
          caches.open(SURUM).then(cache => cache.put(req, kopya));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
