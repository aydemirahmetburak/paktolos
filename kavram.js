// Kavram sayfası: kavram.html?k=enflasyon
//
// Katmanlı anlatım (ilerledikçe derinleşir; teknik ayrıntı zorunlu değildir):
//   Basitçe → Nasıl çalışır? → Beni neden ilgilendiriyor? → Gerçek hayattan →
//   Görsel → Nelere dikkat? → Daha derin → Kaynaklar → İlgili kavramlar
// Veri: sozluk-veri.js (tüm kavramlar) + kavramlar-veri.js (seçili kavramların derin katmanı)

(() => {
  const kok = document.getElementById('kavram');
  if (!kok || typeof SOZLUK === 'undefined') return;

  const parametre = new URLSearchParams(location.search).get('k') || location.hash.slice(1);
  const t = SOZLUK.find(x => x.id === parametre);

  if (!t) {
    document.title = 'Kavram bulunamadı — Paktolos';
    kok.replaceChildren(el('div', { className: 'error-state' },
      el('h1', { className: 'baslik-alt' }, 'Bu kavramı bulamadık.'),
      el('p', {}, 'Adres yanlış yazılmış ya da kavram kaldırılmış olabilir.'),
      el('a', { className: 'btn btn-ikincil', href: 'sozluk.html' }, 'Sözlüğe dön')));
    return;
  }

  const d = (typeof KAVRAM_DERIN !== 'undefined' && KAVRAM_DERIN[t.id]) || {};
  const tr = (n, o = 0) => n.toLocaleString('tr-TR', { minimumFractionDigits: o, maximumFractionDigits: o });

  document.title = `${t.terim} — Paktolos`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${t.terim}: ${t.kisa}`);

  // Okundu olarak işaretle (Karnem ve sözlük ilerlemesi)
  const okunan = new Set(store.get(OKUNAN_KEY, []));
  if (!okunan.has(t.id)) {
    okunan.add(t.id);
    store.set(OKUNAN_KEY, [...okunan]);
  }

  const bolum = (id, baslik, ...icerik) => el('section', { className: 'kv-bolum', 'aria-labelledby': 'kv-' + id },
    el('h2', { id: 'kv-' + id }, baslik), ...icerik);
  const paragraflar = metin => [].concat(metin).map(p => el('p', {}, p));

  // ---------- Görseller ----------
  function gorsel(tur) {
    if (tur === 'zincir') {
      const kap = el('div', { className: 'kv-zincir', id: 'faiz-zinciri' },
        el('div', { className: 'segmented', role: 'radiogroup', 'aria-label': 'Faizin yönü' },
          el('button', { type: 'button', role: 'radio', dataset: { yon: 'artis' }, 'aria-checked': 'true' }, 'Faiz artarsa'),
          el('button', { type: 'button', role: 'radio', dataset: { yon: 'dusus' }, 'aria-checked': 'false' }, 'Faiz düşerse')),
        el('div', { className: 'zincir-kutu card' },
          el('h3', { className: 'zincir-baslik', 'aria-live': 'polite' }),
          el('ol', { className: 'zincir' }),
          el('p', { className: 'zincir-bedel' }),
          el('p', { className: 'zincir-not govde-kucuk' })));
      return bolum('gorsel', 'Adım adım', el('p', {}, 'Politika faizindeki bir değişiklik ekonomiye zincirleme yayılır. Yönünü seç, halkaları izle.'), kap);
    }
    if (typeof grafik !== 'function' || typeof sayiAlani !== 'function') return null;

    const grafikKap = el('div', { className: 'kv-grafik' });
    const ozet = el('p', { className: 'kv-ozet', 'aria-live': 'polite' });
    const tablo = el('div');
    let alanlar = [], ciz;

    if (tur === 'alim-gucu') {
      const e = sayiAlani('Yıllık enflasyon', { min: 2, max: 80, step: 1, value: 40, birim: '%' });
      alanlar = [e];
      ciz = () => {
        const oran = e.get() / 100;
        const deger = Array.from({ length: 11 }, (_, i) => 100 / Math.pow(1 + oran, i));
        ozet.replaceChildren('Yıllık ', el('b', {}, '%' + tr(e.get())), ' enflasyonda bugünkü 100 TL, 10 yıl sonra ', el('b', {}, tr(deger[10], 1) + ' TL'), ' değerinde mal alır.');
        grafik(grafikKap, {
          tur: 'cizgi', etiketler: deger.map((_, i) => i === 0 ? 'Bugün' : i + '. yıl'), xAdim: 2,
          seriler: [{ ad: '100 TL\'nin alım gücü', renk: SERI[0], degerler: deger }],
          bicim: v => tr(v, 1) + ' TL', baglam: i => i ? 'Bugüne göre alım gücü kaybı: %' + tr(100 - deger[i], 0) : 'Başlangıç', aciklama: 'Yıllara göre 100 TL\'nin alım gücü'
        });
        tablo.replaceChildren(tabloGorunumu(['Yıl', 'Alım gücü'], deger.map((v, i) => [i, tr(v, 1) + ' TL'])));
      };
    }

    if (tur === 'bilesik') {
      const g = sayiAlani('Yıllık getiri', { min: 1, max: 60, step: 1, value: 15, birim: '%' });
      alanlar = [g];
      ciz = () => {
        const oran = g.get() / 100, ana = 10000;
        const yillar = Array.from({ length: 21 }, (_, i) => i);
        const bilesik = yillar.map(i => ana * Math.pow(1 + oran, i));
        const basit = yillar.map(i => ana * (1 + oran * i));
        ozet.replaceChildren('10.000 TL, yıllık ', el('b', {}, '%' + tr(g.get())), ' getiriyle 20 yılda basit faizde ', el('b', {}, formatTL(basit[20])), ', bileşik getiriyle ', el('b', {}, formatTL(bilesik[20])), ' olur.');
        grafik(grafikKap, {
          tur: 'cizgi', etiketler: yillar.map(i => i === 0 ? 'Bugün' : i + '. yıl'), xAdim: 5, sonEtiket: true,
          seriler: [
            { ad: 'Bileşik getiri', renk: SERI[0], degerler: bilesik },
            { ad: 'Basit faiz', renk: SERI[1], degerler: basit }
          ],
          bicim: formatTL, baglam: i => i ? 'Fark, yani faizin faizi: ' + formatTL(bilesik[i] - basit[i]) : 'Başlangıç', aciklama: '10.000 TL\'nin basit ve bileşik getiriyle büyümesi'
        });
        tablo.replaceChildren(tabloGorunumu(['Yıl', 'Bileşik', 'Basit'], yillar.map(i => [i, formatTL(bilesik[i]), formatTL(basit[i])])));
      };
    }

    if (tur === 'reel') {
      const n = sayiAlani('Nominal getiri (yıllık)', { min: 0, max: 100, step: 1, value: 45, birim: '%' });
      const e = sayiAlani('Enflasyon (yıllık)', { min: 0, max: 100, step: 1, value: 40, birim: '%' });
      alanlar = [n, e];
      ciz = () => {
        const nn = n.get() / 100, ee = e.get() / 100, ana = 10000;
        const yillar = Array.from({ length: 11 }, (_, i) => i);
        const birikim = yillar.map(i => ana * Math.pow(1 + nn, i));
        const gereken = yillar.map(i => ana * Math.pow(1 + ee, i));
        const reel = ((1 + nn) / (1 + ee) - 1) * 100;
        ozet.replaceChildren('Yıllık reel getiri: ', el('b', { className: reel >= 0 ? 'degisim-artis' : 'degisim-azalis' }, (reel >= 0 ? '+' : '−') + '%' + tr(Math.abs(reel), 1)), '. ',
          reel >= 0 ? 'Birikimin alım gücünü koruyup artırıyor.' : 'Rakam büyüse de alım gücün eriyor.');
        grafik(grafikKap, {
          tur: 'cizgi', etiketler: yillar.map(i => i === 0 ? 'Bugün' : i + '. yıl'), xAdim: 2, sonEtiket: true,
          seriler: [
            { ad: 'Birikimin', renk: SERI[0], degerler: birikim },
            { ad: 'Aynı alım gücü için gereken', renk: SERI[1], degerler: gereken }
          ],
          bicim: formatTL, baglam: i => i ? (birikim[i] >= gereken[i] ? 'Alım gücü korunuyor' : 'Alım gücü eriyor') + ': fark ' + formatTL(Math.abs(birikim[i] - gereken[i])) : 'Başlangıç', aciklama: 'Nominal birikim ile alım gücünü korumak için gereken tutar'
        });
        tablo.replaceChildren(tabloGorunumu(['Yıl', 'Birikimin', 'Gereken'], yillar.map(i => [i, formatTL(birikim[i]), formatTL(gereken[i])])));
      };
    }

    if (!ciz) return null;
    alanlar.forEach(a => a.on(ciz));
    const kutu = el('div', { className: 'kv-gorsel card' },
      el('div', { className: 'kv-girdiler' }, ...alanlar.map(a => a.node)), ozet, grafikKap, tablo);
    requestAnimationFrame(ciz);
    return bolum('gorsel', 'Kendin dene', kutu, el('p', { className: 'govde-kucuk' }, 'Rakamlar örnektir; vergi ve masraflar dahil değildir.'));
  }

  // ---------- Sayfa ----------
  const kategoriSira = SOZLUK.filter(x => x.kategori === t.kategori);
  const i = kategoriSira.indexOf(t);
  const onceki = kategoriSira[i - 1], sonraki = kategoriSira[i + 1];
  const ilgililer = (t.ilgili || []).map(id => SOZLUK.find(x => x.id === id)).filter(Boolean);

  const sitede = [
    t.ogren ? el('a', { className: 'tag', href: t.ogren }, 'Sitede ayrıntılı anlatım ›') : null,
    t.arac ? el('a', { className: 'tag', href: t.arac.href }, t.arac.ad + ' ›') : null
  ].filter(Boolean);

  let miniHesap = null;
  if (!d.gorsel && t.hesap && typeof MINI_HESAP !== 'undefined' && MINI_HESAP[t.hesap]) {
    miniHesap = bolum('hesap', 'Hesapla', el('div', { className: 'kv-mini card' }, MINI_HESAP[t.hesap]()));
  }

  kok.replaceChildren(...[
    el('nav', { className: 'breadcrumbs', 'aria-label': 'Konum' },
      el('ol', {},
        el('li', {}, el('a', { href: 'dersler.html' }, 'Öğren')),
        el('li', {}, el('a', { href: 'sozluk.html' }, 'Sözlük')),
        el('li', { 'aria-current': 'page' }, KATEGORILER[t.kategori]))),
    el('header', { className: 'kv-bas' },
      el('span', { className: 'overline' }, KATEGORILER[t.kategori]),
      el('h1', {}, t.terim),
      el('div', { className: 'sayfa-eylem' }, kaydetDugmesi({ id: 'kavram:' + t.id, baslik: t.terim, tur: 'Kavram', aciklama: t.kisa, href: 'kavram.html?k=' + t.id }))),
    el('div', { className: 'simple-explanation kv-basitce' },
      el('span', { className: 'overline' }, 'Basitçe'),
      el('p', {}, t.kisa)),
    bolum('nasil', 'Nasıl çalışır?', ...paragraflar(t.aciklama)),
    d.neden ? bolum('neden', 'Beni neden ilgilendiriyor?', el('ul', { className: 'kv-liste' }, ...d.neden.map(m => el('li', {}, m)))) : null,
    bolum('ornek', 'Gerçek hayattan', el('div', { className: 'kv-ornek' }, ...paragraflar(t.ornek))),
    d.gorsel ? gorsel(d.gorsel) : null,
    miniHesap,
    el('div', { className: 'key-takeaway' }, el('span', { className: 'overline' }, 'Nelere dikkat?'), el('p', {}, t.degerlendir)),
    d.derin ? el('details', { className: 'deep-dive kv-derin' }, el('summary', {}, 'Daha derin'), el('div', {}, ...paragraflar(d.derin))) : null,
    d.kaynaklar ? bolum('kaynak', 'Kaynaklar', el('ul', { className: 'kaynakca' }, ...d.kaynaklar.map(k =>
      el('li', {}, el('a', { href: k.url, rel: 'noopener', target: '_blank' }, k.ad), k.not ? el('span', {}, k.not) : null)))) : null,
    ilgililer.length || sitede.length ? el('div', { className: 'ilgili kv-ilgili' },
      el('h2', {}, 'İlgili kavramlar'),
      el('div', { className: 'ilgili-liste' }, ...ilgililer.map(x => el('a', { className: 'tag', href: 'kavram.html?k=' + x.id }, x.terim)), ...sitede)) : null,
    el('nav', { className: 'kv-sirali', 'aria-label': 'Aynı kategoride' },
      onceki ? el('a', { className: 'card kv-onceki', href: 'kavram.html?k=' + onceki.id }, el('span', { className: 'overline' }, 'Önceki'), el('strong', {}, onceki.terim)) : el('span'),
      sonraki ? el('a', { className: 'card kv-sonraki', href: 'kavram.html?k=' + sonraki.id }, el('span', { className: 'overline' }, 'Sonraki'), el('strong', {}, sonraki.terim)) : el('span')),
    el('p', { className: 'kv-uyari govde-kucuk' }, 'Bu içerik eğitim amaçlıdır; yatırım tavsiyesi değildir.')
  ].filter(Boolean));
  gecmiseEkle({ baslik: t.terim, tur: 'Kavram', href: 'kavram.html?k=' + t.id });
  olc('kavram_acildi', { kavram: t.id });
})();
