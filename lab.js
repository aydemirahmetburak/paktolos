// Şirket laboratuvarı: arayüz
// lab-model.js'teki labModel() hesaplar; burası kolları, senaryoları ve
// üç tablonun canlı görünümünü yönetir. araclar.js'teki sayiAlani() ve
// script.js'teki el(), store kullanılır.

(function () {
  const kok = document.getElementById('lab-controls');
  if (!kok || typeof labModel === 'undefined') return;

  const LAB_KEY = 'paktolos-lab';
  const BAZ = labModel(LAB_BAZ);

  // ---------- Biçimlendirme ----------
  const eksi = '−';
  const tam = n => (n < -0.5 ? eksi : '') + sayiYaz(Math.abs(Math.round(n)));
  const mn = n => tam(n) + ' milyon TL';
  const ondalik = (n, h = 1) => (n < 0 ? eksi : '') + sayiYaz(Math.abs(n), h);
  const yuzdeMetin = n => '%' + sayiYaz(Math.abs(n), Math.abs(n) < 10 ? 1 : 0);
  const degisimYuzde = (once, simdi) => (Math.abs(once) < 1e-9 ? null : (simdi - once) / Math.abs(once) * 100);

  // ---------- Kollar ----------
  const KOLLAR = [
    { grup: 'Faaliyet', alanlar: [
      { k: 'hacim', ad: 'Satış hacmi değişimi', min: -40, max: 60, step: 1, birim: '%' },
      { k: 'brut', ad: 'Brüt kâr marjı', min: 10, max: 45, step: 0.5, birim: '%', ondalik: 1 },
      { k: 'gider', ad: 'Faaliyet giderleri / hasılat', min: 3, max: 20, step: 0.5, birim: '%', ondalik: 1 }
    ] },
    { grup: 'Nakit döngüsü', alanlar: [
      { k: 'tahsilat', ad: 'Müşteriden tahsilat süresi', min: 15, max: 180, step: 5, birim: 'gün' }
    ] },
    { grup: 'Yatırım ve borç', alanlar: [
      { k: 'yatirim', ad: 'Yeni yatırım', min: 0, max: 6000, step: 250, birim: 'mn TL' },
      { k: 'borc', ad: 'Finansal borç (yıl sonu)', min: 0, max: 10000, step: 250, birim: 'mn TL' },
      { k: 'faiz', ad: 'Borç faizi (yıllık)', min: 0, max: 60, step: 1, birim: '%' }
    ] },
    { grup: 'Ortaklar ve piyasa', alanlar: [
      { k: 'temettu', ad: 'Kârın dağıtılan kısmı', min: 0, max: 100, step: 5, birim: '%' },
      { k: 'piyasa', ad: 'Piyasa değeri', min: 1000, max: 20000, step: 100, birim: 'mn TL' }
    ] }
  ];

  const alanlar = {};
  const ayar = { ...LAB_BAZ };
  const panel = el('details', { className: 'lab-dial', open: true },
    el('summary', {}, el('span', {}, 'Kolları kendin çevir'), el('span', { className: 'qa-chevron', 'aria-hidden': 'true' }, '⌄')),
    ...KOLLAR.map(g => el('div', { className: 'lab-group' },
      el('span', { className: 'lab-group-title' }, g.grup),
      ...g.alanlar.map(a => {
        const alan = sayiAlani(a.ad, { min: a.min, max: a.max, step: a.step, value: LAB_BAZ[a.k], birim: a.birim, ondalik: a.ondalik || 0 });
        alan.on(() => { ayar[a.k] = alan.get(); aktifSenaryo = 'serbest'; guncelle(); });
        alanlar[a.k] = alan;
        return alan.node;
      }))),
    el('button', { type: 'button', className: 'button button-secondary lab-reset', onclick: () => senaryoUygula('normal') }, 'Başlangıca dön'));
  kok.appendChild(panel);
  if (isPhone()) panel.open = false;

  // ---------- Senaryolar ----------
  const ikon = d => { const s = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }); s.innerHTML = d; return s; };
  const b = t => el('b', {}, t);

  const SENARYOLAR = [
    { id: 'normal', ad: 'Normal bir yıl', kisa: 'Başlangıç noktası', ayar: {},
      ikon: '<path d="M4 19.5h16"/><path d="M6 16l4-4 3 2 5-6"/>',
      anlat: m => ['Nehir Mobilya bu yıl ', b(mn(m.gelir.hasilat)), ' satış yaptı, ', b(mn(m.gelir.netKar)), ' net kâr etti ve yılı ', b(mn(m.bilanco.nakit)),
        ' nakitle kapattı. Yukarıdan bir senaryo seç ya da kolları kendin çevir; her değişiklikte üç tablo birlikte güncellenir.'] },

    { id: 'satis-dustu', ad: 'Satışlar %20 düştü', kisa: 'Talep azalırsa ne olur?', ayar: { hacim: -20 },
      ikon: '<path d="M4 6h4v13H4zM10 10h4v9h-4zM16 14h4v5h-4z"/>',
      anlat: m => {
        const d = degisimYuzde(BAZ.gelir.netKar, m.gelir.netKar);
        const parca = ['Satışlar %20 azaldı, ama net kâr ', b(yuzdeMetin(d)), ' azaldı. Neden daha fazla? Amortisman ve faiz gibi giderler satışlarla birlikte küçülmedi. Sabit giderlerin kârdaki değişimi büyütmesine ',
          el('a', { href: 'sozluk.html#kaldirac' }, 'kaldıraç'), ' etkisi denir.'];
        if (m.bilanco.nakit > BAZ.bilanco.nakit) parca.push(' Şaşırtıcı bir ayrıntı: kasadaki nakit ', b(mn(m.bilanco.nakit - BAZ.bilanco.nakit)),
          ' arttı. Satışlar azalınca alacaklar ve stoklar da küçüldü; bu kalemlere bağlanan para serbest kaldı.');
        return parca;
      } },

    { id: 'borcla-buyume', ad: 'Borçla büyüme', kisa: '4 milyar TL\'lik yeni fabrika', ayar: { yatirim: 4000, borc: 7000, hacim: 30 },
      ikon: '<path d="M3 20h18"/><path d="M5 20V10l5 3V10l5 3V6h4v14"/>',
      anlat: m => {
        const dFavok = m.gelir.favok - BAZ.gelir.favok;
        const dNet = degisimYuzde(BAZ.gelir.netKar, m.gelir.netKar);
        return ['Yeni fabrikayla satışlar %30 büyüdü ve FAVÖK ', b(mn(dFavok)), ' arttı. ',
          dNet < 0 ? el('span', {}, 'Ama net kâr ', b(yuzdeMetin(dNet)), ' azaldı: yıllık faiz gideri ', b(mn(BAZ.gelir.faizGideri)), ' iken ', b(mn(m.gelir.faizGideri)), ' oldu. ')
                   : el('span', {}, 'Net kâr da ', b(yuzdeMetin(dNet)), ' arttı. '),
          'Net borç / FAVÖK ', b(ondalik(BAZ.oranlar.netBorcFavok)), ' iken ', b(ondalik(m.oranlar.netBorcFavok)), ' oldu; şirket artık faiz değişimlerine çok daha duyarlı. ',
          'Büyüme kendiliğinden kâr getirmez: yatırımın getirisi, finansman maliyetini aşmalıdır.'];
      } },

    { id: 'faiz-yukseldi', ad: 'Faizler yükseldi', kisa: 'Borç faizi %20\'den %45\'e', ayar: { faiz: 45 },
      ikon: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
      anlat: m => ['Satışlar, marjlar ve FAVÖK hiç değişmedi. Ama faiz gideri ', b(mn(BAZ.gelir.faizGideri)), ' iken ', b(mn(m.gelir.faizGideri)),
        ' oldu ve net kâr ', b(yuzdeMetin(degisimYuzde(BAZ.gelir.netKar, m.gelir.netKar))), ' eridi. ',
        'Aynı şirket, aynı faaliyetler; yalnızca farklı bir faiz ortamı. Borçlu şirketleri incelerken faiz giderini FAVÖK ile birlikte oku.'] },

    { id: 'hammadde', ad: 'Hammadde pahalandı', kisa: 'Brüt marj %30\'dan %22\'ye', ayar: { brut: 22 },
      ikon: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M8 9V6h8v3"/>',
      anlat: m => ['Brüt marjdaki 8 puanlık düşüş, net kârı ', b(mn(BAZ.gelir.netKar)), ' seviyesinden ', b(mn(m.gelir.netKar)), ' seviyesine indirdi; ',
        b(yuzdeMetin(degisimYuzde(BAZ.gelir.netKar, m.gelir.netKar))), ' azalış. ',
        'Maliyet artışlarını satış fiyatına yansıtabilme gücü, bu yüzden bir şirketi değerlendirirken sorulacak en önemli sorulardan biridir.'] },

    { id: 'gec-tahsilat', ad: 'Müşteriler geç ödüyor', kisa: 'Tahsilat 60 günden 150 güne', ayar: { tahsilat: 150 },
      ikon: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
      anlat: m => {
        const parca = ['Net kâr hiç değişmedi: ', b(mn(m.gelir.netKar)), '. Ama müşteriler daha geç ödediği için ', b(mn(m.bilanco.alacak - BAZ.bilanco.alacak)),
          ' alacaklarda bağlandı. İşletme faaliyetlerinden nakit akışı ', b(mn(m.nakitAkisi.isletme)), ' oldu. '];
        if (m.bilanco.ekBorc > 0) parca.push('Kasa yetmedi; şirket yılı kapatmak için ', b(mn(m.bilanco.ekBorc)), ' ek kısa vadeli borç almak zorunda kaldı. ');
        parca.push('Kâr eden bir şirket de nakitsiz kalabilir. Bu yüzden net kârı her zaman ', el('a', { href: 'sozluk.html#nakit-akisi' }, 'nakit akışıyla'), ' birlikte oku.');
        return parca;
      } },

    { id: 'temettu', ad: 'Kârın tamamı dağıtıldı', kisa: 'Temettü oranı %100', ayar: { temettu: 100 },
      ikon: '<circle cx="9" cy="9" r="5"/><path d="M14.5 6.5A5 5 0 1 1 9.5 14"/>',
      anlat: m => ['Ortaklar kârın tamamını, ', b(mn(m.gelir.temettu)), ' temettü olarak aldı. Özkaynak bu yıl büyümedi ve kasadaki nakit ',
        b(mn(BAZ.bilanco.nakit - m.bilanco.nakit)), ' daha az. Dağıtılan kâr şirketten çıkar; büyümek için geride kaynak kalmaz. ',
        'Yüksek temettü tek başına iyi ya da kötü değildir; şirketin bunu nakitten karşılayıp karşılayamadığına bak.'] },

    { id: 'piyasa-costu', ad: 'Piyasa coştu', kisa: 'Piyasa değeri iki katına', ayar: { piyasa: 10800 },
      ikon: '<path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"/><circle cx="12" cy="12" r="3.5"/>',
      anlat: m => ['Şirketin hiçbir rakamı değişmedi: satışlar, kâr, borç ve nakit aynı. Yalnızca piyasanın biçtiği değer iki katına çıktı. ',
        'F/K ', b(ondalik(BAZ.oranlar.fk)), ' iken ', b(ondalik(m.oranlar.fk)), ', PD/DD ', b(ondalik(BAZ.oranlar.pddd, 2)), ' iken ', b(ondalik(m.oranlar.pddd, 2)), ' oldu. ',
        'Oranlar şirket hakkında olduğu kadar, piyasanın o şirketten ne beklediği hakkında da konuşur.'] }
  ];

  function serbestAnlat(m) {
    const d = degisimYuzde(BAZ.gelir.netKar, m.gelir.netKar);
    const parca = ['Başlangıca göre net kâr ', b(d === null ? tam(m.gelir.netKar) : (d >= 0 ? '+' : eksi) + yuzdeMetin(d)),
      ' değişti; dönem sonu nakit ', b(mn(m.bilanco.nakit)), ', net borç / FAVÖK ', b(m.oranlar.netBorcFavok === null ? 'anlamlı değil' : ondalik(m.oranlar.netBorcFavok)), '. '];
    if (m.gelir.netKar < 0) parca.push(el('span', { className: 'lab-warn' }, 'Şirket zarar ediyor. '));
    if (m.bilanco.ekBorc > 0) parca.push(el('span', { className: 'lab-warn' }, 'Nakit yetmedi: ', mn(m.bilanco.ekBorc), ' ek kısa vadeli borç alındı. '));
    if (m.gelir.netKar >= 0 && m.nakitAkisi.isletme < 0) parca.push('Dikkat: şirket kâr ediyor ama işletme faaliyetleri nakit tüketiyor. ');
    parca.push('İpucu: tahsilat süresini uzatıp kârın ve nakdin nasıl ayrıştığını izle.');
    return parca;
  }

  const senaryoKap = document.getElementById('scenarios');
  senaryoKap.append(...SENARYOLAR.map(s => el('button', { type: 'button', className: 'scenario', dataset: { id: s.id }, onclick: () => senaryoUygula(s.id, true) },
    el('span', { className: 'scenario-icon' }, ikon(s.ikon)), el('strong', {}, s.ad), el('span', {}, s.kisa))));

  let aktifSenaryo = 'normal';
  function senaryoUygula(id, kullanici) {
    const s = SENARYOLAR.find(x => x.id === id) || SENARYOLAR[0];
    Object.assign(ayar, LAB_BAZ, s.ayar);
    for (const [k, alan] of Object.entries(alanlar)) alan.set(ayar[k]);
    aktifSenaryo = s.id;
    history.replaceState(null, '', s.id === 'normal' ? location.pathname + location.search : '#' + s.id);
    if (s.id !== 'normal') {
      const denenen = new Set(store.get(LAB_KEY, []));
      denenen.add(s.id);
      store.set(LAB_KEY, [...denenen]);
    }
    guncelle();
    if (kullanici && isPhone()) document.getElementById('lab-story').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  // ---------- Sayı animasyonu ----------
  function sayiGecis(node, hedef, bicim) {
    const bas = node._deger ?? hedef;
    node._deger = hedef;
    if (prefersReducedMotion() || Math.abs(hedef - bas) < 1e-9) { node.textContent = bicim(hedef); return; }
    const t0 = performance.now();
    cancelAnimationFrame(node._raf);
    const adim = t => {
      const p = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - p, 3);
      node.textContent = bicim(bas + (hedef - bas) * e);
      if (p < 1) node._raf = requestAnimationFrame(adim);
    };
    node._raf = requestAnimationFrame(adim);
  }

  function isaretle(node, degisti) {
    if (!degisti) return;
    node.classList.remove('changed');
    void node.offsetWidth;
    node.classList.add('changed');
  }

  // ---------- Hikâye kartı ----------
  const hikaye = document.getElementById('lab-story');
  function hikayeCiz(m) {
    const s = SENARYOLAR.find(x => x.id === aktifSenaryo);
    const baslik = s ? s.ad : 'Senin şirketin';
    const metin = s ? s.anlat(m) : serbestAnlat(m);
    const yeni = el('div', { className: 'lab-story-inner' },
      el('span', { className: 'eyebrow' }, s && s.id !== 'normal' ? 'Ne oldu?' : s ? 'Nehir Mobilya' : 'Serbest ayar'),
      el('h3', {}, baslik),
      el('p', {}, ...metin));
    if (hikaye.firstChild && !prefersReducedMotion() && hikaye._baslik !== baslik) {
      yeni.classList.add('entering');
      hikaye.replaceChildren(yeni);
      requestAnimationFrame(() => yeni.classList.remove('entering'));
    } else hikaye.replaceChildren(yeni);
    hikaye._baslik = baslik;
    senaryoKap.querySelectorAll('.scenario').forEach(x => x.setAttribute('aria-pressed', x.dataset.id === aktifSenaryo));
  }

  // ---------- Ana göstergeler ----------
  const kpiKap = document.getElementById('lab-kpis');
  const KPI = [
    { ad: 'Net kâr', al: m => m.gelir.netKar },
    { ad: 'FAVÖK', al: m => m.gelir.favok },
    { ad: 'Dönem sonu nakit', al: m => m.bilanco.nakit },
    { ad: 'Özkaynak', al: m => m.bilanco.ozkaynak }
  ];
  const kpiDugum = KPI.map(k => {
    const deger = el('span', { className: 'kpi-value' });
    const fark = el('span', { className: 'delta' });
    kpiKap.appendChild(el('div', { className: 'kpi' }, el('span', { className: 'kpi-label' }, k.ad), deger, fark));
    return { deger, fark };
  });

  function farkYaz(node, once, simdi, tur) {
    let metin, yon = 0;
    if (tur === 'puan') {
      const d = simdi - once; yon = Math.sign(Math.round(d * 10));
      metin = yon === 0 ? 'değişmedi' : (d > 0 ? '+' : eksi) + sayiYaz(Math.abs(d), 1) + ' puan';
    } else if (tur === 'kat') {
      const d = simdi - once; yon = Math.sign(Math.round(d * 100));
      metin = yon === 0 ? 'değişmedi' : (d > 0 ? '+' : eksi) + sayiYaz(Math.abs(d), Math.abs(d) < 1 ? 2 : 1);
    } else {
      const d = degisimYuzde(once, simdi); yon = d === null ? Math.sign(simdi - once) : Math.sign(Math.round(d * 10));
      metin = yon === 0 ? 'değişmedi' : d === null ? (simdi > once ? '+' : eksi) + tam(Math.abs(simdi - once)) : (d > 0 ? '+' : eksi) + yuzdeMetin(d);
    }
    node.textContent = (yon > 0 ? '▲ ' : yon < 0 ? '▼ ' : '') + metin;
    node.dataset.yon = yon > 0 ? 'artti' : yon < 0 ? 'azaldi' : 'ayni';
  }

  // ---------- Şelale (gelir tablosu ve nakit akışı) ----------
  function selale(kap, satirlar, { tabanMaks }) {
    let cal = 0;
    const konumlar = satirlar.map(s => {
      let bas, bit;
      if (s.tur === 'toplam') { bas = 0; bit = s.v; cal = s.v; }
      else { bas = cal; bit = cal + s.v; cal = bit; }
      return { ...s, bas, bit };
    });
    const uclar = konumlar.flatMap(k => [k.bas, k.bit]);
    const dMin = Math.min(0, ...uclar), dMaks = Math.max(tabanMaks || 0, ...uclar);
    const x = v => (v - dMin) / (dMaks - dMin) * 100;

    konumlar.forEach(k => {
      let satir = kap.querySelector(`[data-k="${k.ad}"]`);
      if (!satir) {
        satir = el('div', { className: 'wf-row', dataset: { k: k.ad } },
          el('span', { className: 'wf-label' }, k.ad),
          el('span', { className: 'wf-track' }, el('span', { className: 'wf-zero' }), el('span', { className: 'wf-bar' })),
          el('span', { className: 'wf-value' }));
        kap.appendChild(satir);
      }
      const sol = Math.min(x(k.bas), x(k.bit)), gen = Math.abs(x(k.bit) - x(k.bas));
      const bar = satir.querySelector('.wf-bar');
      bar.style.left = sol + '%';
      bar.style.width = Math.max(0.4, gen) + '%';
      satir.dataset.tur = k.tur === 'toplam' ? (k.v < 0 ? 'negatif' : 'toplam') : k.v < 0 ? 'eksi' : 'arti';
      satir.classList.toggle('wf-total', k.tur === 'toplam');
      satir.querySelector('.wf-zero').style.left = x(0) + '%';
      const deger = satir.querySelector('.wf-value');
      isaretle(satir, deger._deger !== undefined && Math.abs(deger._deger - k.v) > Math.max(1, Math.abs(deger._deger) * 0.005));
      sayiGecis(deger, k.v, v => (k.tur === 'toplam' ? tam(v) : (v >= 0 ? '+' : eksi) + sayiYaz(Math.abs(Math.round(v)))));
      satir.title = k.ipucu || '';
    });
  }

  // ---------- Canlı bilanço ----------
  const bilancoKap = document.getElementById('lab-bilanco');
  const TABAN_TOPLAM = BAZ.bilanco.varliklar;
  const VARLIK = [
    { k: 'nakit', ad: 'Nakit', renk: 'var(--bal-1)' },
    { k: 'alacak', ad: 'Alacaklar', renk: 'var(--bal-2)' },
    { k: 'stok', ad: 'Stoklar', renk: 'var(--bal-3)' },
    { k: 'duran', ad: 'Duran varlıklar', renk: 'var(--bal-4)' }
  ];
  const KAYNAK = [
    { k: 'ticariBorc', ad: 'Tedarikçi borçları', renk: 'var(--bal-5)' },
    { k: 'borc', ad: 'Finansal borç', renk: 'var(--bal-6)' },
    { k: 'ekBorc', ad: 'Ek kısa vadeli borç', renk: 'var(--color-danger)' },
    { k: 'ozkaynak', ad: 'Özkaynak', renk: 'var(--bal-7)' }
  ];
  const sutun = (baslik, parcalar) => {
    const kolon = el('div', { className: 'bal-col' }, ...parcalar.map(p => el('span', { className: 'bal-seg', dataset: { k: p.k }, style: `background:${p.renk}` })));
    const liste = el('ul', { className: 'bal-list' }, ...parcalar.map(p => el('li', { dataset: { k: p.k } },
      el('i', { className: 'key-rect', style: `background:${p.renk}` }), el('span', {}, p.ad), el('b', {}))));
    return el('div', { className: 'bal-side' }, el('span', { className: 'bal-title' }, baslik), el('div', { className: 'bal-stage' }, kolon), liste);
  };
  bilancoKap.append(sutun('Varlıklar', VARLIK), el('div', { className: 'bal-eq', 'aria-hidden': 'true' }, '='), sutun('Yükümlülükler + Özkaynak', KAYNAK));

  function bilancoCiz(m) {
    const bl = m.bilanco;
    const deger = { nakit: bl.nakit, alacak: bl.alacak, stok: bl.stok, duran: bl.duran, ticariBorc: bl.ticariBorc,
      borc: bl.finansalBorc - bl.ekBorc, ekBorc: bl.ekBorc, ozkaynak: bl.ozkaynak };
    // Özkaynak eksiye düşerse borçlar varlıkları aşar; sütun buna göre ölçeklenir
    const olcek = Math.max(TABAN_TOPLAM, bl.varliklar, bl.ticariBorc + bl.finansalBorc) * 1.02;
    const ciz = (parcalar, toplam) => {
      parcalar.forEach(p => {
        const ham = deger[p.k], v = Math.max(0, ham);
        bilancoKap.querySelectorAll(`[data-k="${p.k}"]`).forEach(n => {
          if (n.classList.contains('bal-seg')) {
            n.style.height = (v / olcek * 100) + '%';
            n.title = `${p.ad}: ${mn(ham)}`;
          } else {
            n.hidden = p.k === 'ekBorc' && v < 0.5;
            n.classList.toggle('negative', ham < 0);
            const hucre = n.querySelector('b');
            isaretle(n, hucre._deger !== undefined && Math.abs(hucre._deger - ham) > Math.max(1, Math.abs(hucre._deger) * 0.005));
            sayiGecis(hucre, ham, tam);
          }
        });
      });
    };
    ciz(VARLIK); ciz(KAYNAK);
    bilancoKap.classList.toggle('negatif-ozkaynak', bl.ozkaynak < 0);
    const esitlik = document.getElementById('lab-equation');
    esitlik.textContent = `${tam(bl.varliklar)} = ${tam(bl.kaynaklar)}`;
    esitlik.title = 'Varlıklar her zaman yükümlülükler ile özkaynağın toplamına eşittir';
  }

  // ---------- Oranlar ----------
  const oranKap = document.getElementById('lab-oranlar');
  const ORANLAR = [
    { k: 'fk', ad: 'F/K', kavram: 'fk', tur: 'kat', h: 1 },
    { k: 'pddd', ad: 'PD/DD', kavram: 'pddd', tur: 'kat', h: 2 },
    { k: 'roe', ad: 'Özkaynak kârlılığı', kavram: 'roe', tur: 'puan', yuzde: true },
    { k: 'netMarj', ad: 'Net kâr marjı', kavram: 'net-kar-marji', tur: 'puan', yuzde: true },
    { k: 'brutMarj', ad: 'Brüt kâr marjı', kavram: 'gelir-tablosu', tur: 'puan', yuzde: true },
    { k: 'fdFavok', ad: 'FD/FAVÖK', kavram: 'fd-favok', tur: 'kat', h: 1 },
    { k: 'netBorcFavok', ad: 'Net borç / FAVÖK', kavram: 'net-borc-favok', tur: 'kat', h: 2 },
    { k: 'cari', ad: 'Cari oran', kavram: 'cari-oran', tur: 'kat', h: 2 }
  ];
  const oranDugum = ORANLAR.map(o => {
    const deger = el('span', { className: 'ratio-value' });
    const fark = el('span', { className: 'delta' });
    oranKap.appendChild(el('a', { className: 'ratio', href: 'sozluk.html#' + o.kavram }, el('span', { className: 'ratio-name' }, o.ad), deger, fark));
    return { deger, fark };
  });

  // ---------- Hepsini güncelle ----------
  function guncelle() {
    const m = labModel(ayar);

    hikayeCiz(m);

    KPI.forEach((k, i) => {
      const v = k.al(m), n = kpiDugum[i];
      n.deger.classList.toggle('negative', v < 0);
      sayiGecis(n.deger, v, tam);
      farkYaz(n.fark, k.al(BAZ), v);
    });

    const H = m.gelir.hasilat;
    const pay = v => `Hasılatın %${sayiYaz(Math.abs(v) / H * 100, 1)} kadarı`;
    selale(document.getElementById('lab-gelir'), [
      { ad: 'Hasılat', tur: 'toplam', v: H },
      { ad: 'Satışların maliyeti', tur: 'akis', v: -m.gelir.smm, ipucu: pay(m.gelir.smm) },
      { ad: 'Brüt kâr', tur: 'toplam', v: m.gelir.brutKar, ipucu: pay(m.gelir.brutKar) },
      { ad: 'Faaliyet giderleri', tur: 'akis', v: -m.gelir.gider, ipucu: pay(m.gelir.gider) },
      { ad: 'Amortisman', tur: 'akis', v: -m.gelir.amortisman, ipucu: 'Makine ve binaların yıllık yıpranma payı' },
      { ad: 'Esas faaliyet kârı', tur: 'toplam', v: m.gelir.fvok, ipucu: 'FAVÖK: ' + mn(m.gelir.favok) },
      { ad: 'Finansman gideri', tur: 'akis', v: -m.gelir.faizGideri, ipucu: 'Borcun faizi' },
      { ad: 'Vergi', tur: 'akis', v: -m.gelir.vergi, ipucu: 'Basitlik için %25' },
      { ad: 'Net kâr', tur: 'toplam', v: m.gelir.netKar }
    ], { tabanMaks: BAZ.gelir.hasilat });

    const na = m.nakitAkisi;
    selale(document.getElementById('lab-nakit'), [
      { ad: 'Dönem başı nakit', tur: 'toplam', v: na.baslangic },
      { ad: 'İşletme faaliyetleri', tur: 'akis', v: na.isletme, ipucu: `Net kâr + amortisman − işletme sermayesi artışı (${tam(na.isletmeSermayesiArtisi)})` },
      { ad: 'Yatırım faaliyetleri', tur: 'akis', v: na.yatirim, ipucu: 'Makine yenileme ve yeni yatırımlar' },
      { ad: 'Finansman faaliyetleri', tur: 'akis', v: na.finansman, ipucu: `Borç değişimi ${tam(na.borcDegisimi)}, temettü −${tam(na.temettu)}${na.ekBorc > 0 ? ', ek borç +' + tam(na.ekBorc) : ''}` },
      { ad: 'Dönem sonu nakit', tur: 'toplam', v: na.son }
    ], { tabanMaks: 0 });

    bilancoCiz(m);

    ORANLAR.forEach((o, i) => {
      const v = m.oranlar[o.k], v0 = BAZ.oranlar[o.k], n = oranDugum[i];
      if (v === null) { n.deger.textContent = '—'; n.deger._deger = undefined; n.fark.textContent = 'anlamlı değil'; n.fark.dataset.yon = 'ayni'; return; }
      sayiGecis(n.deger, v, x => (o.yuzde ? '%' : '') + ondalik(x, o.yuzde ? 1 : o.h));
      if (v0 === null) { n.fark.textContent = ''; return; }
      farkYaz(n.fark, v0, v, o.tur);
    });
  }

  // Başlangıç: lab.html#faiz-yukseldi gibi bağlantılar senaryoyu açar
  const ilk = decodeURIComponent(location.hash.slice(1));
  senaryoUygula(SENARYOLAR.some(s => s.id === ilk) ? ilk : 'normal');
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (SENARYOLAR.some(s => s.id === id) && id !== aktifSenaryo) senaryoUygula(id);
  });

  window.LAB_SENARYO_SAYISI = SENARYOLAR.length - 1;
})();
