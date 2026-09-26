// Akış: kaydırdıkça ilerleyen infografikler ve dokunarak keşfedilen tablolar.
//
// Kaydırmalı sahne (HTML):
//   <section class="akis" data-akis="terazi">
//     <div class="akis-sahne"></div>                     ← yapışkan görsel (JS çizer)
//     <div class="akis-adimlar">
//       <div class="akis-adim"><div>…metin…</div></div>  ← her adım bir durum
//     </div>
//   </section>
// Adım ekranın ortasından geçtiğinde sahne o adımın durumuna geçer. Her sahne
// durumu baştan çizer; hızlı kaydırıp adım atlamak sorun olmaz. Metin HTML'de
// durduğu için JS kapalıyken de okunur.
//
// Tablolar: .oran-tablo (ogren.html) ve .sektor-harita (sektorler.html).

(() => {
  const azHareket = prefersReducedMotion();
  const tr = (n, d = 0) => n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });

  function svg(tag, attrs = {}, ...cocuklar) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...cocuklar);
    return n;
  }

  // Sayıyı eski değerinden yenisine yumuşakça taşır
  function sayac(dugum, bicim) {
    let simdi = null, hedef = null, kare = 0;
    return deger => {
      hedef = deger;
      if (simdi === null || azHareket) { simdi = deger; dugum.textContent = bicim(deger); return; }
      const bas = simdi, t0 = performance.now(), sure = 700;
      cancelAnimationFrame(kare);
      const adim = t => {
        const p = Math.min(1, (t - t0) / sure);
        const e = 1 - Math.pow(1 - p, 3);
        simdi = bas + (hedef - bas) * e;
        dugum.textContent = bicim(simdi);
        if (p < 1) kare = requestAnimationFrame(adim);
      };
      kare = requestAnimationFrame(adim);
    };
  }

  // ============================================
  // Kaydırma motoru
  // ============================================
  // Telefonda adım metinleri görünmez birer kaydırma işaretidir; etkin adımın
  // metni sahnenin altındaki alt yazıda gösterilir, görselle üst üste binmez.
  function adimMotoru(kok, ciz, altyazi) {
    const adimlar = [...kok.querySelectorAll('.akis-adim')];
    let aktif = -1;
    const sec = i => {
      if (i === aktif) return;
      const once = aktif;
      aktif = i;
      adimlar.forEach((a, j) => {
        a.classList.toggle('aktif', j === i);
        a.classList.toggle('gecti', j < i);
      });
      altyazi.replaceChildren(...adimlar[i].firstElementChild.cloneNode(true).childNodes);
      altyazi.classList.remove('yeni');
      void altyazi.offsetWidth;
      altyazi.classList.add('yeni');
      ciz(i, once);
    };
    if (!('IntersectionObserver' in window)) { sec(adimlar.length - 1); return; }
    const io = new IntersectionObserver(girdiler => {
      girdiler.forEach(g => { if (g.isIntersecting) sec(adimlar.indexOf(g.target)); });
    }, { rootMargin: '-49% 0px -50% 0px' });
    adimlar.forEach(a => io.observe(a));
    sec(0);
  }

  // ============================================
  // SAHNE: Bilanço terazisi (ogren.html)
  // Nehir Mobilya'nın dönem başı bilançosu, milyon TL
  // ============================================
  function terazi(sahne) {
    const VARLIK = [
      { ad: 'Nakit', d: 1000, renk: '--bal-1', adim: 1 },
      { ad: 'Alacaklar', d: 1644, renk: '--bal-2', adim: 1 },
      { ad: 'Stoklar', d: 1726, renk: '--bal-3', adim: 1 },
      { ad: 'Duran varlıklar', d: 5000, renk: '--bal-4', adim: 2 }
    ];
    const KAYNAK = [
      { ad: 'Kısa vadeli borç', d: 2063, renk: '--bal-5', adim: 3 },
      { ad: 'Uzun vadeli borç', d: 1800, renk: '--bal-6', adim: 3 },
      { ad: 'Özkaynak', d: 5507, renk: '--bal-7', adim: 4 }
    ];
    const TOPLAM = 9370, OLCEK = 150 / TOPLAM, KOL = 150, MERKEZ = 220;

    const kefe = (x, kalemler) => {
      const g = svg('g', { class: 'tz-kefe' });
      g.append(
        svg('path', { class: 'tz-ip', d: `M${x} 60 L${x - 58} 238 M${x} 60 L${x + 58} 238` }),
        svg('path', { class: 'tz-tepsi', d: `M${x - 66} 238 Q${x} 252 ${x + 66} 238` }));
      let y = 238;
      kalemler.forEach(k => {
        const h = k.d * OLCEK;
        y -= h;
        k.rect = svg('rect', { class: 'tz-blok', x: x - 50, y: y + 0.6, width: 100, height: Math.max(1, h - 1.2), rx: 3, style: `fill: var(${k.renk})` });
        g.append(k.rect);
      });
      return g;
    };
    const sol = kefe(MERKEZ - KOL, VARLIK);
    const sag = kefe(MERKEZ + KOL, KAYNAK);
    const kol = svg('g', { class: 'tz-kol' },
      svg('rect', { x: MERKEZ - KOL - 6, y: 56, width: 2 * KOL + 12, height: 8, rx: 4 }),
      svg('circle', { cx: MERKEZ - KOL, cy: 60, r: 5 }), svg('circle', { cx: MERKEZ + KOL, cy: 60, r: 5 }));
    const gorsel = svg('svg', { viewBox: '0 0 440 330', class: 'tz-svg', 'aria-hidden': 'true' },
      svg('path', { class: 'tz-direk', d: `M${MERKEZ} 60 V300 M${MERKEZ - 46} 306 H${MERKEZ + 46}` }),
      svg('path', { class: 'tz-tepe', d: `M${MERKEZ - 12} 44 L${MERKEZ} 26 L${MERKEZ + 12} 44 Z` }),
      sol, sag, kol,
      svg('circle', { class: 'tz-mil', cx: MERKEZ, cy: 60, r: 7 }));

    const liste = (baslik, kalemler) => {
      const toplam = el('b', {}, '0');
      const ul = el('ul', {}, ...kalemler.map(k => {
        k.li = el('li', {}, el('i', { style: `background: var(${k.renk})` }), el('span', {}, k.ad), el('b', {}, tr(k.d)));
        return k.li;
      }));
      return { kutu: el('div', { className: 'tz-liste' }, el('div', { className: 'tz-baslik' }, el('span', {}, baslik), toplam), ul), toplam: sayac(toplam, v => tr(v)) };
    };
    const lv = liste('Varlıklar', VARLIK), lk = liste('Kaynaklar', KAYNAK);
    const durum = el('div', { className: 'tz-durum' });
    sahne.append(el('div', { className: 'tz' }, gorsel, durum, el('div', { className: 'tz-listeler' }, lv.kutu, lk.kutu)));

    return i => {
      let L = 0, R = 0;
      [...VARLIK, ...KAYNAK].forEach((k, j) => {
        const var_ = i >= k.adim;
        k.rect.classList.toggle('var', var_);
        k.rect.style.transitionDelay = var_ ? (j % 4) * 0.12 + 's' : '0s';
        k.li.classList.toggle('var', var_);
        k.li.classList.toggle('yeni', var_ && k.adim === i);
      });
      VARLIK.forEach(k => { if (i >= k.adim) L += k.d; });
      KAYNAK.forEach(k => { if (i >= k.adim) R += k.d; });
      const aci = Math.max(-11, Math.min(11, -(L - R) / TOPLAM * 26));
      const dy = KOL * Math.sin(aci * Math.PI / 180);
      kol.style.transform = `rotate(${aci}deg)`;
      sol.style.transform = `translateY(${-dy}px)`;
      sag.style.transform = `translateY(${dy}px)`;
      lv.toplam(L); lk.toplam(R);
      const denge = L === R;
      durum.className = 'tz-durum' + (denge ? ' denge' : '');
      durum.textContent = L === 0 && R === 0 ? 'İki kefe de boş'
        : denge ? `Denge: ${tr(L)} = ${tr(R)}`
          : L > R ? 'Varlıklar ağır basıyor' : 'Kaynaklar ağır basıyor';
    };
  }

  // ============================================
  // SAHNE: 100 liranın yolculuğu (ogren.html)
  // Her kare 1 TL. Kalan kareler alttan dolu durur, düşülen kısım o adımda
  // turuncu yanar, sonra boşalır.
  // ============================================
  function yuzLira(sahne) {
    const ADIM = [
      { kalan: 100, ad: 'Satış (hasılat)' },
      { kalan: 30, ad: 'Brüt kâr', dus: 'Satışların maliyeti', m: 70 },
      { kalan: 20, ad: 'FAVÖK', dus: 'Faaliyet giderleri', m: 10 },
      { kalan: 15, ad: 'Esas faaliyet kârı', dus: 'Amortisman', m: 5 },
      { kalan: 9, ad: 'Vergi öncesi kâr', dus: 'Faiz gideri', m: 6 },
      { kalan: 6.75, ad: 'Net kâr', dus: 'Vergi', m: 2.25 }
    ];
    const kareler = [];
    const izgara = el('div', { className: 'yl-izgara', 'aria-hidden': 'true' });
    for (let satir = 0; satir < 10; satir++) {
      for (let sutun = 0; sutun < 10; sutun++) {
        const k = el('i');
        kareler[(9 - satir) * 10 + sutun] = k;
        izgara.append(k);
      }
    }
    const buyuk = el('span', { className: 'yl-sayi' });
    const etiket = el('span', { className: 'yl-etiket' });
    const defter = el('ul', { className: 'yl-defter' }, ...ADIM.slice(1).map(a => el('li', {}, el('span', {}, a.dus), el('b', {}, '−' + tr(a.m, a.m % 1 ? 2 : 0)))));
    const kalemler = [...defter.children];
    const yaz = sayac(buyuk, v => tr(v, v % 1 && v < 10 ? 2 : 0) + ' TL');
    sahne.append(el('div', { className: 'yl' },
      el('div', { className: 'yl-ust' }, el('div', {}, etiket, buyuk), el('span', { className: 'yl-not' }, 'Her kare 1 TL')),
      izgara, defter));

    return i => {
      const a = ADIM[i], onceki = i > 0 ? ADIM[i - 1].kalan : 100;
      kareler.forEach((k, j) => {
        let durum = 'bos';
        if (j < Math.floor(a.kalan)) durum = 'kalan';
        else if (j < onceki) durum = 'dusen';
        k.className = durum;
        k.style.removeProperty('--pay');
        if (j === Math.floor(a.kalan) && a.kalan % 1) { k.className = 'kismi'; k.style.setProperty('--pay', (a.kalan % 1) * 100 + '%'); }
        k.style.transitionDelay = durum === 'dusen' && !azHareket ? ((onceki - j) * 9) + 'ms' : '0ms';
      });
      etiket.textContent = a.ad;
      yaz(a.kalan);
      kalemler.forEach((li, j) => { li.classList.toggle('var', j < i); li.classList.toggle('yeni', j === i - 1); });
    };
  }

  // ============================================
  // SAHNE: Kâr ≠ nakit (ogren.html) — yatay şelale
  // ============================================
  function karNakit(sahne) {
    const SATIR = [
      { ad: 'Net kâr', d: 100, tur: 'toplam', adim: 0 },
      { ad: 'Amortisman', d: 30, tur: 'giren', adim: 1 },
      { ad: 'Alacak artışı', d: -45, tur: 'cikan', adim: 2 },
      { ad: 'Stok artışı', d: -25, tur: 'cikan', adim: 3 },
      { ad: 'İşletme nakit akışı', d: 60, tur: 'toplam', adim: 3 },
      { ad: 'Yatırım harcaması', d: -40, tur: 'cikan', adim: 4 },
      { ad: 'Serbest nakit akışı', d: 20, tur: 'toplam', adim: 4 }
    ];
    const X0 = 150, OLCEK = 190 / 130, H = 38;
    const g = svg('svg', { viewBox: `0 0 360 ${SATIR.length * H + 8}`, class: 'kn-svg', 'aria-hidden': 'true' });
    let toplam = 0;
    SATIR.forEach((s, j) => {
      let bas, son;
      if (s.tur === 'toplam') { bas = 0; son = s.d; toplam = s.d; } else { bas = toplam; son = toplam + s.d; toplam = son; }
      const x = X0 + Math.min(bas, son) * OLCEK, w = Math.abs(son - bas) * OLCEK, y = j * H + 8;
      s.g = svg('g', { class: 'kn-satir ' + s.tur },
        svg('text', { x: 0, y: y + 16, class: 'kn-ad' + (s.tur === 'toplam' ? ' kalin' : '') }, s.ad),
        svg('rect', { x, y: y + 2, width: Math.max(w, 2), height: 20, rx: 4, class: 'kn-cubuk', style: `transform-origin: ${s.d < 0 && s.tur !== 'toplam' ? x + w : x}px 0` }),
        svg('text', { x: x + w + 6, y: y + 16, class: 'kn-deger' }, (s.tur === 'toplam' ? '' : s.d > 0 ? '+' : '−') + tr(Math.abs(s.d))));
      if (j < SATIR.length - 1) s.g.append(svg('path', { class: 'kn-bag', d: `M${X0 + son * OLCEK} ${y + 22} V${y + H + 2}` }));
      g.append(s.g);
    });
    g.prepend(svg('path', { class: 'kn-eksen', d: `M${X0} 4 V${SATIR.length * H + 6}` }));
    const kasa = el('b', {});
    const kasaYaz = sayac(kasa, v => tr(v));
    const kasaEtiket = el('span', {});
    sahne.append(el('div', { className: 'kn' },
      el('div', { className: 'kn-ust' }, el('div', {}, kasaEtiket, kasa), el('span', { className: 'kn-anahtar' },
        el('i', { className: 'giren' }), 'Giren', el('i', { className: 'cikan' }), 'Çıkan')),
      g));
    const ETIKET = ['Gelir tablosundaki kâr', 'Kâr + amortisman', 'Tahsil edilmemiş satışlar düşüldü', 'Kasaya giren: işletme nakit akışı', 'Yatırımdan sonra kalan: serbest nakit'];
    const DEGER = [100, 130, 85, 60, 20];
    return i => {
      SATIR.forEach(s => {
        s.g.classList.toggle('var', i >= s.adim);
        s.g.classList.toggle('yeni', i === s.adim && i > 0);
      });
      kasaEtiket.textContent = ETIKET[i];
      kasaYaz(DEGER[i]);
    };
  }

  // ============================================
  // SAHNE: 1.000 liranın sessiz erimesi (index.html)
  // Varsayım: yıllık %40 enflasyon, 100 TL'lik bir market sepeti.
  // ============================================
  function enflasyon(sahne) {
    const ADIM = [
      { zaman: 'Bugün', para: 1000, sepet: 100 },
      { zaman: '1 yıl sonra', para: 1000, sepet: 140 },
      { zaman: '3 yıl sonra', para: 1000, sepet: 274.4 },
      { zaman: '5 yıl sonra', para: 1000, sepet: 537.8 },
      { zaman: '5 yıl sonra · %45 faizle', para: 6409.7, sepet: 537.8 }
    ];
    const IKON = '<path d="M3.5 9.5h17l-1.8 9.1a2 2 0 0 1-2 1.6H7.3a2 2 0 0 1-2-1.6z"/><path d="M8.5 9.5 11 4.5M15.5 9.5 13 4.5"/>';
    const sepetler = Array.from({ length: 12 }, (_, j) => {
      const s = el('div', { className: 'en-sepet' + (j >= 10 ? ' ek' : '') });
      s.innerHTML = `<svg viewBox="0 0 24 24" class="bos">${IKON}</svg><svg viewBox="0 0 24 24" class="dolu">${IKON}</svg>`;
      return s;
    });
    const zaman = el('span', { className: 'en-zaman' });
    const para = el('b', {}), fiyat = el('b', {}), adet = el('b', { className: 'vurgu' });
    const paraYaz = sayac(para, v => tr(v) + ' TL');
    const fiyatYaz = sayac(fiyat, v => tr(v) + ' TL');
    const adetYaz = sayac(adet, v => tr(v, 1));
    sahne.append(el('div', { className: 'en' },
      zaman,
      el('div', { className: 'en-sepetler', 'aria-hidden': 'true' }, ...sepetler),
      el('dl', { className: 'en-tablo' },
        el('div', {}, el('dt', {}, 'Cüzdanında'), el('dd', {}, para)),
        el('div', {}, el('dt', {}, 'Bir sepet'), el('dd', {}, fiyat)),
        el('div', {}, el('dt', {}, 'Alabildiğin'), el('dd', {}, adet, ' sepet')))));
    return i => {
      const a = ADIM[i], n = a.para / a.sepet;
      zaman.textContent = a.zaman;
      sahne.classList.toggle('faizli', i === ADIM.length - 1);
      sepetler.forEach((s, j) => {
        const dolu = Math.max(0, Math.min(1, n - j));
        s.style.setProperty('--dolu', dolu);
        s.classList.toggle('gorunur', j < 10 || n > 10);
        s.style.transitionDelay = azHareket ? '0s' : (Math.abs(j - n) * 0.03).toFixed(2) + 's';
      });
      paraYaz(a.para); fiyatYaz(a.sepet); adetYaz(n);
    };
  }

  const SAHNELER = { terazi, 'yuz-lira': yuzLira, 'kar-nakit': karNakit, enflasyon };

  document.querySelectorAll('.akis[data-akis]').forEach(kok => {
    const kur = SAHNELER[kok.dataset.akis];
    const sahne = kok.querySelector('.akis-sahne');
    if (!kur || !sahne) return;
    const gorsel = el('div', { className: 'akis-gorsel' });
    const altyazi = el('div', { className: 'akis-altyazi', 'aria-hidden': 'true' });
    sahne.append(gorsel, altyazi);
    const ciz = kur(gorsel);
    kok.classList.add('hazir');
    adimMotoru(kok, ciz, altyazi);
  });

  // ============================================
  // TABLO: Üç şirket, altı oran (ogren.html)
  // ============================================
  function oranTablosu(kok) {
    const SIRKET = [
      { ad: 'Nehir Mobilya', sektor: 'Sanayi', profil: 'Olgun ve istikrarlı bir üretici. Kârı düzenli, borcu makul; piyasa büyük bir büyüme beklemiyor.' },
      { ad: 'Ada Market', sektor: 'Perakende', profil: 'Düşük marjla çok satan bir zincir. Müşteriden peşin tahsil edip tedarikçiye vadeli ödediği için az sermayeyle çok iş döndürür.' },
      { ad: 'Kule Yazılım', sektor: 'Teknoloji', profil: 'Hızlı büyüyen, borcundan fazla nakdi olan bir yazılım şirketi. Değerinin büyük kısmı bilançoda görünmeyen ürün ve insan kaynağından gelir.' }
    ];
    const ORAN = [
      { ad: 'F/K', id: 'fk', d: [8, 14, 30], ondalik: 1,
        not: 'Aynı 1 TL kâr için yatırımcılar Nehir\'e 8, Kule\'ye 30 TL ödüyor. Fark beklenen büyümeden gelir; Kule\'nin kârı hızla artmazsa bu fiyatı taşımak zorlaşır. Düşük F/K tek başına ucuz demek değildir.' },
      { ad: 'PD/DD', id: 'pddd', d: [0.9, 3.5, 8], ondalik: 1,
        not: 'Nehir\'in piyasa değeri özkaynağının altında: piyasa ya varlıkların gerçek değerinden ya da kâr gücünden şüphe ediyor. Kule\'nin değeri ise bilançoda yazmayan yazılımdan ve ekibinden geliyor.' },
      { ad: 'Özkaynak kârlılığı', id: 'roe', d: [12, 25, 27], yuzde: true,
        not: 'Ada ve Kule, ortaklarının parasını Nehir\'den iki kat verimli çalıştırıyor. Yüksek PD/DD\'yi kısmen bu açıklar: PD/DD\'yi her zaman ROE ile birlikte oku.' },
      { ad: 'Net kâr marjı', id: 'net-kar-marji', d: [6.8, 2.5, 22], yuzde: true, ondalik: 1,
        not: 'Ada her 100 TL\'lik satıştan yalnızca 2,5 TL kazanıyor; perakendede başarı marjdan değil hacimden gelir. Marjları sektörler arasında değil, aynı sektör içinde karşılaştır.' },
      { ad: 'Net borç / FAVÖK', id: 'net-borc-favok', d: [0.8, 0.3, -1.5], ondalik: 1,
        not: 'Kule\'nin eksi değeri, kasasındaki nakdin borcundan fazla olduğunu (net nakit) gösterir. Nehir\'in net borcu bir yıllık FAVÖK\'ünün altında: rahat bir seviye.' },
      { ad: 'Cari oran', id: 'cari-oran', d: [2.4, 0.8, 3.1], ondalik: 1,
        not: 'Ada\'nın cari oranı 1\'in altında; ama perakendede bu normaldir. Aynı rakam bir sanayi şirketinde alarm işareti olurdu. Bir oranı sektörünü bilmeden yorumlama.' }
    ];
    const bicim = (o, v) => (v < 0 ? '−' : '') + (o.yuzde ? '%' : '') + tr(Math.abs(v), o.ondalik || 0);
    const profil = el('p', { className: 'ot-profil' });
    let secili = -1;
    const kolonSec = k => {
      secili = secili === k ? -1 : k;
      tablo.dataset.kolon = secili;
      basliklar.forEach((b, j) => b.setAttribute('aria-pressed', j === secili));
      profil.replaceChildren(...(secili < 0 ? [el('span', {}, 'Bir şirketin adına dokun, karakterini gör. Bir oranın satırına dokun, üç şirketi karşılaştır.')]
        : [el('strong', {}, SIRKET[secili].ad + ' · ' + SIRKET[secili].sektor), ' ', SIRKET[secili].profil]));
    };
    const basliklar = SIRKET.map((s, k) => el('button', { type: 'button', className: 'ot-sirket', 'aria-pressed': 'false', onclick: () => kolonSec(k) },
      el('span', { className: 'ot-logo' }, s.ad[0]), el('span', {}, s.ad), el('small', {}, s.sektor)));
    const govde = el('tbody');
    ORAN.forEach((o, r) => {
      const enBuyuk = Math.max(...o.d.map(Math.abs));
      const detay = el('tr', { className: 'ot-detay', hidden: true },
        el('td', { colSpan: 4 }, el('div', {}, el('p', {}, o.not), el('a', { className: 'qa-chip', href: 'sozluk.html#' + o.id }, o.ad + ' nedir? ›'))));
      const satir = el('tr', { className: 'ot-satir', tabIndex: 0, role: 'button', 'aria-expanded': 'false' },
        el('th', { scope: 'row' }, el('span', {}, o.ad), el('i', { className: 'ot-ok', 'aria-hidden': 'true' })),
        ...o.d.map(v => el('td', {},
          el('b', {}, bicim(o, v)),
          el('span', { className: 'ot-cubuk' + (v < 0 ? ' eksi' : ''), style: `--w: ${(Math.abs(v) / enBuyuk * 100).toFixed(1)}%; --g: ${r * 0.07}s` }),
          v < 0 ? el('small', {}, 'net nakit') : null)));
      const ac = () => {
        const acik = detay.hidden;
        detay.hidden = !acik;
        satir.setAttribute('aria-expanded', acik);
        satir.classList.toggle('acik', acik);
      };
      satir.addEventListener('click', ac);
      satir.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ac(); } });
      govde.append(satir, detay);
    });
    const tablo = el('table', { className: 'ot-tablo' },
      el('caption', { className: 'gizli' }, 'Üç hayali şirketin altı temel oranı'),
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, el('span', { className: 'ot-kose' }, 'Oran')), ...basliklar.map(b => el('th', { scope: 'col' }, b)))),
      govde);
    kok.append(el('div', { className: 'ot-kaydir' }, tablo), profil);
    kolonSec(-1);
    gorununce(kok);
  }

  // ============================================
  // TABLO: Sektör haritası (sektorler.html)
  // 3 kilit · 2 önemli · 1 yardımcı · 0 anlamsız ya da yanıltıcı
  // ============================================
  function sektorHaritasi(kok) {
    const ORAN = [
      { ad: 'F/K', kisa: 'F/K', not: 'Kârı istikrarlı sektörlerde (sanayi, perakende) kullanışlı. GYO\'larda değerleme kazançları kârı şişirebildiği için yanıltıcı olabilir.' },
      { ad: 'PD/DD', kisa: 'PD/DD', not: 'Varlığı ağır sektörlerin ana ölçüsü: bankalar ve GYO\'lar. Varlığı az, kârı yüksek şirketlerde daha az şey anlatır.' },
      { ad: 'ROE', kisa: 'ROE', not: 'Bankacılıkta PD/DD ile birlikte okunur: özkaynağını verimli kullanan banka daha yüksek PD/DD\'yi hak edebilir.' },
      { ad: 'FD/FAVÖK', kisa: 'FD/ FAVÖK', not: 'Borç yapıları farklı şirketleri karşılaştırır. Fabrika, uçak gibi büyük varlıklarla çalışan sektörlerde öne çıkar; bankalarda kullanılmaz.' },
      { ad: 'Net borç / FAVÖK', kisa: 'NB/ FAVÖK', not: 'Borç ödeme gücü. Sanayide kilit; havacılıkta kiralanan uçakların yükümlülükleri de borca eklenmeli; bankalarda anlamsızdır.' },
      { ad: 'Cari oran', kisa: 'Cari', not: 'Kısa vadeli ödeme gücü. Perakendede 1\'in altında olması normaldir; bankaların bilanço yapısı farklı olduğu için kullanılmaz.' }
    ];
    const SEKTOR = [
      { id: 'banka', ad: 'Bankacılık', pusula: 'Net faiz marjı, sermaye yeterliliği', s: [1, 3, 3, 0, 0, 0] },
      { id: 'holding', ad: 'Holdingler', pusula: 'Net aktif değer iskontosu', s: [1, 2, 1, 1, 2, 1] },
      { id: 'gyo', ad: 'Gayrimenkul', pusula: 'Net aktif değer, kira geliri', s: [0, 3, 1, 1, 2, 1] },
      { id: 'perakende', ad: 'Perakende', pusula: 'Satış büyümesi, stok devir hızı', s: [2, 1, 2, 2, 1, 0] },
      { id: 'sanayi', ad: 'Sanayi', pusula: 'Brüt marjın seyri, hammadde', s: [3, 1, 2, 3, 3, 2] },
      { id: 'ulastirma', ad: 'Ulaştırma', pusula: 'Doluluk oranı, birim maliyet', s: [1, 1, 1, 3, 2, 1] }
    ];
    const SEVIYE = ['Anlamsız ya da yanıltıcı', 'Yardımcı', 'Önemli', 'Kilit gösterge'];
    const bilgi = el('p', { className: 'sh-bilgi', 'aria-live': 'polite' });
    const varsayilanBilgi = () => bilgi.replaceChildren('Bir göstergeye dokun: sektörler, o göstergenin önemine göre sıralansın.');
    let secili = -1;
    const govde = el('tbody');
    const satirlar = SEKTOR.map((s, r) => {
      const tr_ = el('tr', { dataset: { sira: r } },
        el('th', { scope: 'row' }, el('a', { href: '#' + s.id }, s.ad), el('small', {}, s.pusula)),
        ...s.s.map((v, k) => el('td', { dataset: { k, v }, title: `${s.ad} için ${ORAN[k].ad}: ${SEVIYE[v].toLocaleLowerCase('tr')}` },
          el('span', { className: 'sh-nokta v' + v, style: `--g: ${(r * 6 + k) * 0.025}s` }),
          el('span', { className: 'gizli' }, SEVIYE[v]))));
      tr_.veri = s;
      return tr_;
    });
    govde.append(...satirlar);

    // Satırları yeni sıralarına kaydırarak taşı (FLIP)
    const sirala = sira => {
      const once = new Map(satirlar.map(t => [t, t.getBoundingClientRect().top]));
      govde.append(...sira);
      if (azHareket) return;
      sira.forEach(t => {
        const fark = once.get(t) - t.getBoundingClientRect().top;
        if (!fark) return;
        t.animate([{ transform: `translateY(${fark}px)` }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(0.34, 1.2, 0.5, 1)' });
      });
    };
    const kolonSec = k => {
      secili = secili === k ? -1 : k;
      tablo.dataset.kolon = secili;
      basliklar.forEach((b, j) => b.setAttribute('aria-pressed', j === secili));
      if (secili < 0) {
        varsayilanBilgi();
        sirala([...satirlar]);
      } else {
        bilgi.replaceChildren(el('strong', {}, ORAN[secili].ad + ': '), ORAN[secili].not);
        sirala([...satirlar].sort((a, b) => b.veri.s[secili] - a.veri.s[secili] || a.dataset.sira - b.dataset.sira));
      }
    };
    const basliklar = ORAN.map((o, k) => el('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': o.ad, onclick: () => kolonSec(k) },
      el('span', { className: 'uzun' }, o.ad), el('span', { className: 'kisa', 'aria-hidden': 'true' }, o.kisa)));
    const tablo = el('table', { className: 'sh-tablo' },
      el('caption', { className: 'gizli' }, 'Sektörlere göre göstergelerin önemi'),
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, el('span', { className: 'ot-kose' }, 'Sektör')), ...basliklar.map(b => el('th', { scope: 'col' }, b)))),
      govde);
    const anahtar = el('div', { className: 'sh-anahtar', 'aria-hidden': 'true' },
      ...[3, 2, 1, 0].map(v => el('span', {}, el('span', { className: 'sh-nokta v' + v }), SEVIYE[v])));
    kok.append(el('div', { className: 'ot-kaydir' }, tablo), bilgi, anahtar);
    varsayilanBilgi();
    gorununce(kok);
  }

  // Tablo ekrana girince çubuklar ve noktalar dolar
  function gorununce(kok) {
    if (!('IntersectionObserver' in window)) { kok.classList.add('gorundu'); return; }
    const io = new IntersectionObserver(([g]) => {
      if (g.isIntersecting) { kok.classList.add('gorundu'); io.disconnect(); }
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(kok);
  }

  document.querySelectorAll('.oran-tablo').forEach(oranTablosu);
  document.querySelectorAll('.sektor-harita').forEach(sektorHaritasi);
})();
