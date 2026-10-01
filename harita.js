// "Ekonomi nasıl çalışır?" haritası — ekonomi-haritasi.html
// Veri: ekonomi-veri.js (EKONOMI_HARITASI)
//
// Altı oyuncu, aralarında para (düz), kredi (kesikli) ve sermaye (noktalı)
// akışları. Tür renkle değil çizgi biçimiyle ayrılır; renk yalnızca "şu an
// anlatılan" akışı işaretler (vurgu mavisi). Bir kuruma dokununca o kurumun
// akışları öne çıkar ve yan panel ne yaptığını, neyi kontrol ettiğini ve
// diğerlerini nasıl etkilediğini anlatır. "Faiz artarsa" turu, etkinin
// adım adım yayılışını gösterir.

(() => {
  const kok = document.getElementById('ekonomi-haritasi');
  if (!kok || typeof EKONOMI_HARITASI === 'undefined') return;
  const { dugumler, akislar, senaryolar } = EKONOMI_HARITASI;
  const azHareket = prefersReducedMotion();
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const dugum = Object.fromEntries(dugumler.map(d => [d.id, d]));
  const TUR = { para: 'Para', kredi: 'Kredi', sermaye: 'Sermaye' };
  const KUTU = { g: 168, y: 58 };  // düğüm kutusu

  // ---------- Geometri ----------
  // Kutunun kenarında, merkezden (dx, dy) yönündeki nokta
  const kenar = (d, dx, dy, pay = 6) => {
    const t = Math.min((KUTU.g / 2 + pay) / Math.abs(dx || 1e-9), (KUTU.y / 2 + pay) / Math.abs(dy || 1e-9));
    return [d.x + dx * t, d.y + dy * t];
  };
  const karsilikli = new Set(akislar.map(a => a.a + '>' + a.b));
  const yollar = akislar.map(a => {
    const A = dugum[a.a], B = dugum[a.b];
    // İkili için ortak normal: sıralı çiftten
    const [p, q] = a.a < a.b ? [A, B] : [B, A];
    const ux = q.x - p.x, uy = q.y - p.y, uz = Math.hypot(ux, uy);
    const nx = -uy / uz, ny = ux / uz;
    const ciftMi = karsilikli.has(a.b + '>' + a.a);
    const bukum = (a.bukum || 0) + (ciftMi ? (a.a < a.b ? 18 : -18) : 0);
    const mx = (A.x + B.x) / 2 + nx * bukum * 2, my = (A.y + B.y) / 2 + ny * bukum * 2; // kontrol noktası
    const [x1, y1] = kenar(A, mx - A.x, my - A.y);
    const [x2, y2] = kenar(B, mx - B.x, my - B.y, 10);
    const orta = [0.25 * x1 + 0.5 * mx + 0.25 * x2, 0.25 * y1 + 0.5 * my + 0.25 * y2];
    return { ...a, d: `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, orta, n: [nx * Math.sign(bukum || 1), ny * Math.sign(bukum || 1)] };
  });

  // ---------- Çizim ----------
  const cizim = svg('svg', { viewBox: '0 0 800 580', class: 'eh-svg', role: 'group', 'aria-label': 'Ekonomi haritası: altı kurum ve aralarındaki akışlar' });
  const defs = svg('defs');
  ['silik', 'etkin', 'gecmis'].forEach(k => {
    const m = svg('marker', { id: 'eh-ok-' + k, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
    m.append(svg('path', { d: 'M1 1.5 L8.5 5 L1 8.5', class: 'eh-ok eh-ok-' + k }));
    defs.append(m);
  });
  cizim.append(defs);

  const akisKatmani = svg('g'), etiketKatmani = svg('g'), noktaKatmani = svg('g', { 'aria-hidden': 'true' });
  yollar.forEach(y => {
    y.el = svg('path', { d: y.d, class: `eh-akis eh-${y.tur}`, 'marker-end': 'url(#eh-ok-silik)' });
    akisKatmani.append(y.el);
  });
  cizim.append(akisKatmani);

  const dugumEl = {};
  dugumler.forEach(d => {
    const g = svg('g', { class: 'eh-dugum', tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': `${d.ad}: ${d.rol}` });
    g.append(
      svg('rect', { x: d.x - KUTU.g / 2, y: d.y - KUTU.y / 2, width: KUTU.g, height: KUTU.y, rx: 12 }),
      Object.assign(svg('text', { x: d.x, y: d.y - 3, class: 'eh-ad', 'text-anchor': 'middle' }), { textContent: d.ad }),
      Object.assign(svg('text', { x: d.x, y: d.y + 15, class: 'eh-rol', 'text-anchor': 'middle' }), { textContent: d.rol }));
    cizim.append(g);
    dugumEl[d.id] = g;
  });
  cizim.append(etiketKatmani, noktaKatmani);

  // ---------- Filtre, panel ----------
  const filtre = new Set(Object.keys(TUR));
  const filtreDugmeleri = Object.entries(TUR).map(([k, ad]) => {
    const ornek = svg('svg', { viewBox: '0 0 28 8', class: 'eh-ornek', 'aria-hidden': 'true' });
    ornek.append(svg('path', { d: 'M1 4 H27', class: `eh-akis eh-${k}` }));
    const b = el('button', { type: 'button', className: 'eh-filtre', 'aria-pressed': 'true' }, ornek, ad);
    b.addEventListener('click', () => {
      if (filtre.has(k) && filtre.size === 1) return; // en az bir tür görünsün
      filtre.has(k) ? filtre.delete(k) : filtre.add(k);
      b.setAttribute('aria-pressed', filtre.has(k));
      yenile();
    });
    return b;
  });
  const senaryo = senaryolar.faiz;
  const senaryoDugme = el('button', { type: 'button', className: 'btn btn-ikincil btn-kucuk' }, senaryo.ad);
  const panel = el('div', { className: 'eh-panel', 'aria-live': 'polite' });

  // Akışları liste olarak (erişilebilirlik ve yazdırma)
  const liste = el('details', { className: 'table-view eh-liste' }, el('summary', {}, 'Akışları liste olarak gör'),
    el('div', { className: 'table-scroll' }, el('table', { className: 'data-table' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Kimden'), el('th', { scope: 'col' }, 'Kime'), el('th', { scope: 'col' }, 'Akış'), el('th', { scope: 'col' }, 'Tür'))),
      el('tbody', {}, ...akislar.map(a => el('tr', {}, el('td', {}, dugum[a.a].ad), el('td', {}, dugum[a.b].ad), el('td', {}, a.ad), el('td', {}, TUR[a.tur])))))));

  kok.replaceChildren(
    el('div', { className: 'eh-arac' }, el('div', { className: 'eh-filtreler', role: 'group', 'aria-label': 'Akış türü' }, ...filtreDugmeleri), senaryoDugme),
    el('div', { className: 'eh-duzen' }, el('figure', { className: 'eh-figur' }, cizim), panel),
    liste);

  // ---------- Durum ----------
  let secili = null;       // düğüm id
  let adim = -1;           // senaryo adımı; -1: senaryo kapalı

  const etiketYaz = y => {
    const g = svg('g', { class: 'eh-etiket' });
    const t = svg('text', { x: y.orta[0] + y.n[0] * 12, y: y.orta[1] + y.n[1] * 12 + 4, 'text-anchor': 'middle' });
    t.textContent = y.ad;
    g.append(t);
    etiketKatmani.append(g);
    const k = t.getBBox();
    g.prepend(svg('rect', { x: k.x - 6, y: k.y - 3, width: k.width + 12, height: k.height + 6, rx: 6 }));
  };
  const noktaAkit = y => {
    if (azHareket) return;
    for (let i = 0; i < 2; i++) {
      const c = svg('circle', { r: 3.5, class: 'eh-nokta' });
      const an = svg('animateMotion', { dur: '2.4s', repeatCount: 'indefinite', begin: `${-i * 1.2}s`, path: y.d });
      c.append(an);
      noktaKatmani.append(c);
    }
  };

  function yenile() {
    etiketKatmani.replaceChildren();
    noktaKatmani.replaceChildren();
    const senaryoAcik = adim >= 0;
    const etkin = new Set(), gecmis = new Set();
    if (senaryoAcik) {
      senaryo.adimlar.forEach((a, i) => a.akislar.forEach(id => (i === adim ? etkin : i < adim ? gecmis : null)?.add(id)));
    } else if (secili) {
      yollar.forEach(y => { if (y.a === secili || y.b === secili) etkin.add(y.id); });
    }
    const odak = etkin.size > 0;
    yollar.forEach(y => {
      const gorunur = filtre.has(y.tur) || etkin.has(y.id);
      y.el.style.display = gorunur ? '' : 'none';
      const durum = etkin.has(y.id) ? 'etkin' : gecmis.has(y.id) ? 'gecmis' : 'silik';
      y.el.setAttribute('class', `eh-akis eh-${y.tur} eh-${durum}${odak && durum === 'silik' ? ' eh-soluk' : ''}`);
      y.el.setAttribute('marker-end', `url(#eh-ok-${durum})`);
      if (gorunur && durum === 'etkin') { etiketYaz(y); noktaAkit(y); }
    });
    const ilgili = new Set([...etkin].flatMap(id => { const y = yollar.find(x => x.id === id); return [y.a, y.b]; }));
    Object.entries(dugumEl).forEach(([id, g]) => {
      g.setAttribute('aria-pressed', String(id === secili));
      g.classList.toggle('secili', id === secili);
      g.classList.toggle('soluk', odak && !ilgili.has(id) && id !== secili);
    });
    panelYaz();
  }

  function panelYaz() {
    if (adim >= 0) {
      const a = senaryo.adimlar[adim], son = adim === senaryo.adimlar.length - 1;
      panel.replaceChildren(...[
        el('span', { className: 'overline' }, `${senaryo.ad} · ${adim + 1} / ${senaryo.adimlar.length}`),
        el('p', { className: 'eh-senaryo-metin' }, a.metin),
        son ? el('p', { className: 'eh-sonuc' }, senaryo.sonuc) : null,
        el('div', { className: 'eh-tur' },
          el('button', { type: 'button', className: 'btn btn-ikincil btn-kucuk', disabled: adim === 0, onclick: () => { adim--; yenile(); } }, 'Önceki'),
          son ? el('button', { type: 'button', className: 'btn btn-birincil btn-kucuk', onclick: () => { adim = -1; yenile(); } }, 'Turu bitir')
            : el('button', { type: 'button', className: 'btn btn-birincil btn-kucuk', onclick: () => { adim++; olc('harita_tur', { adim: adim + 1 }); yenile(); } }, 'Sonraki'))
      ].filter(Boolean));
      return;
    }
    if (!secili) {
      panel.replaceChildren(
        el('span', { className: 'overline' }, 'Nasıl okunur?'),
        el('p', { className: 'eh-giris' }, 'Ekonomi, altı oyuncu arasında dönen para, kredi ve sermaye akışıdır. Bir kuruma dokun: ne yaptığını, neyi kontrol ettiğini ve diğerlerini nasıl etkilediğini gör.'),
        el('p', { className: 'govde-kucuk' }, 'Ya da bir değişikliğin ekonomiye nasıl yayıldığını adım adım izle.'),
        el('button', { type: 'button', className: 'btn btn-birincil btn-kucuk', onclick: () => { secili = null; adim = 0; yenile(); } }, senaryo.ad));
      return;
    }
    const d = dugum[secili];
    panel.replaceChildren(
      el('span', { className: 'overline' }, d.rol),
      el('h2', {}, d.ad),
      el('p', {}, d.ne),
      el('h3', {}, 'Neyi kontrol eder?'),
      el('p', {}, d.kontrol),
      el('h3', {}, 'Diğerlerini nasıl etkiler?'),
      el('ul', { className: 'eh-etkiler' }, ...d.etkiler.map(([hedef, metin]) =>
        el('li', {}, el('button', { type: 'button', className: 'eh-hedef', onclick: () => sec(hedef) }, dugum[hedef].ad), ' ', metin))),
      el('div', { className: 'ilgili-liste' }, ...d.kavramlar.map(id => {
        const t = typeof SOZLUK !== 'undefined' && SOZLUK.find(x => x.id === id);
        return t ? el('a', { className: 'tag', href: 'kavram.html?k=' + id }, t.terim) : null;
      }).filter(Boolean)),
      el('button', { type: 'button', className: 'btn btn-sade btn-kucuk', onclick: () => sec(null) }, 'Tüm haritaya dön'));
  }

  function sec(id) {
    if (id && id !== secili) olc('harita_oyuncu', { oyuncu: id });
    adim = -1;
    secili = secili === id ? null : id;
    yenile();
    if (id && isPhone()) panel.scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth', block: 'nearest' });
  }

  Object.entries(dugumEl).forEach(([id, g]) => {
    g.addEventListener('click', () => sec(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(id); } });
  });
  senaryoDugme.addEventListener('click', () => { secili = null; adim = 0; yenile(); });
  kok.addEventListener('keydown', e => { if (e.key === 'Escape' && (secili || adim >= 0)) { secili = null; adim = -1; yenile(); } });

  yenile();
  // Telefonda kaydırılabilir haritayı ortala
  const figur = kok.querySelector('.eh-figur');
  if (figur.scrollWidth > figur.clientWidth) figur.scrollLeft = (figur.scrollWidth - figur.clientWidth) / 2;
})();
