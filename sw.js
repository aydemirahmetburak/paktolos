// Çevrimdışı destek
//
// Strateji: önce ağ. İnternet varsa her zaman en güncel sayfa gelir ve
// önbellek güncellenir; internet yoksa en son görülen sürüm açılır.
// Böylece yeni bir sürüm yayınlandığında kullanıcı eski dosyada kalmaz.
//
// SURUM ve DOSYALAR elle yazılmaz: "npm run hazirla" kökteki dosyalardan
// listeyi kurar, sürümü de içeriklerinin özetinden hesaplar
// (gelistirme/onbellek.mjs). Bir dosya değişince sürüm kendiliğinden değişir.

const SURUM = 'paktolos-70bdb599ca';
const DOSYALAR = [
  './', 'analiz.html', 'araclar.html', 'checkup.html', 'dersler.html', 'ekonomi-haritasi.html',
  'ekonomi.html', 'hikaye.html', 'index.html', 'karnem.html', 'kavram.html', 'lab.html', 'ogren.html',
  'piyasalar.html', 'rehberler.html', 'sektorler.html', 'sorular.html', 'sozluk.html', 'tasarim.html',
  'test.html', 'style.css', 'tasarim/bilesenler.css', 'tasarim/tokenlar.css',
  'tasarim/fontlar/inter-latin.woff2', 'tasarim/fontlar/inter-tr.woff2',
  'tasarim/fontlar/nr-italic-latin.woff2', 'tasarim/fontlar/nr-italic-tr.woff2',
  'tasarim/fontlar/nr-normal-latin.woff2', 'tasarim/fontlar/nr-normal-tr.woff2', 'akis.js', 'araclar.js',
  'arama-veri.js', 'checkup.js', 'dersler-veri.js', 'ekonomi-veri.js', 'ekonomi.js', 'grafik.js', 'harita.js',
  'kavram.js', 'kavramlar-veri.js', 'lab-model.js', 'lab.js', 'okul.js', 'olcum.js', 'script.js',
  'sorular-veri.js', 'sozluk-veri.js', 'tema.js', 'test-veri.js', 'manifest.webmanifest', 'icon.svg',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
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
