// Ana sayfa: hero'daki ekonomi ağı ve "Faiz değişince ne olur?" zinciri.
// Veri: ekonomi-veri.js (EKONOMI_AGI, FAIZ_ZINCIRI)

(() => {
  const azHareket = prefersReducedMotion();
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  // ============================================
  // EKONOMİ AĞI
  // Beş düğüm, aralarında neden-sonuç bağları. Bir işaret bağlar boyunca
  // sırayla dolaşır ve alttaki cümle o bağı anlatır: süs değil, açıklama.
  // Bir düğüme dokununca akış durur ve o düğümün bağları öne çıkar.
  // ============================================
  function initAg() {
    const kap = document.getElementById('ekonomi-agi');
    if (!kap || typeof EKONOMI_AGI === 'undefined') return;
    const { dugumler, baglar } = EKONOMI_AGI;
    const konum = Object.fromEntries(dugumler.map(d => [d.id, d]));

    const cizim = svg('svg', { viewBox: '0 0 560 460', class: 'ag-svg', role: 'img', 'aria-labelledby': 'ag-baslik' });
    const baslik = svg('title', { id: 'ag-baslik' });
    baslik.textContent = 'Faiz, para ve kredi, büyüme, enflasyon ve piyasalar arasındaki neden-sonuç bağları';
    cizim.append(baslik);

    // Bağlar: hafif kavisli, düz çizgi
    const yollar = baglar.map(b => {
      const A = konum[b.a], B = konum[b.b];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const dx = B.x - A.x, dy = B.y - A.y, uz = Math.hypot(dx, dy);
      const bukum = 0.12 * uz;
      const cx = mx - dy / uz * bukum, cy = my + dx / uz * bukum;
      const yol = svg('path', { d: `M${A.x} ${A.y} Q${cx} ${cy} ${B.x} ${B.y}`, class: 'ag-bag' });
      cizim.append(yol);
      return { ...b, yol };
    });

    const isaret = svg('circle', { r: 4.5, class: 'ag-isaret' });
    cizim.append(isaret);

    // Düğümler
    const dugumEl = {};
    dugumler.forEach(d => {
      const g = svg('g', { class: 'ag-dugum', tabindex: 0, role: 'button', 'aria-label': `${d.ad}: ${d.tanim}` });
      const sagda = d.x < 280;
      g.append(
        svg('circle', { cx: d.x, cy: d.y, r: 22, class: 'ag-hale' }),
        svg('circle', { cx: d.x, cy: d.y, r: 6, class: 'ag-nokta' }));
      const t = svg('text', { x: d.x + (sagda ? 16 : -16), y: d.y + 5, class: 'ag-ad', 'text-anchor': sagda ? 'start' : 'end' });
      t.textContent = d.ad;
      g.append(t);
      cizim.append(g);
      dugumEl[d.id] = g;
    });

    const altyazi = el('p', { className: 'ag-altyazi', 'aria-live': 'polite' });
    kap.append(cizim, altyazi);

    const yaz = metin => {
      altyazi.classList.remove('yeni');
      void altyazi.offsetWidth;
      altyazi.textContent = metin;
      altyazi.classList.add('yeni');
    };

    // Akış: bağları sırayla dolaş
    let sira = 0, kare = 0, duraklat = false, t0 = 0;
    const SURE = 2600;
    const bagiVurgula = b => {
      yollar.forEach(y => y.yol.classList.toggle('etkin', y === b));
      Object.values(dugumEl).forEach(g => g.classList.remove('etkin', 'secili'));
      dugumEl[b.a].classList.add('etkin');
      dugumEl[b.b].classList.add('etkin');
      yaz(b.metin);
    };
    const adim = t => {
      if (duraklat) return;
      if (!t0) { t0 = t; bagiVurgula(yollar[sira]); }
      const p = Math.min(1, (t - t0) / SURE);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const yol = yollar[sira].yol;
      const nokta = yol.getPointAtLength(e * yol.getTotalLength());
      isaret.setAttribute('cx', nokta.x);
      isaret.setAttribute('cy', nokta.y);
      if (p >= 1) { sira = (sira + 1) % yollar.length; t0 = 0; }
      kare = requestAnimationFrame(adim);
    };

    const dugumSec = id => {
      duraklat = true;
      cancelAnimationFrame(kare);
      isaret.classList.add('gizli-isaret');
      const d = konum[id];
      yollar.forEach(y => y.yol.classList.toggle('etkin', y.a === id || y.b === id));
      Object.entries(dugumEl).forEach(([k, g]) => {
        g.classList.toggle('secili', k === id);
        g.classList.toggle('etkin', yollar.some(y => (y.a === id && y.b === k) || (y.b === id && y.a === k)));
      });
      yaz(`${d.ad}: ${d.tanim}`);
    };
    const devam = () => {
      if (azHareket || !duraklat) return;
      duraklat = false;
      isaret.classList.remove('gizli-isaret');
      t0 = 0;
      kare = requestAnimationFrame(adim);
    };
    Object.entries(dugumEl).forEach(([id, g]) => {
      g.addEventListener('mouseenter', () => dugumSec(id));
      g.addEventListener('focus', () => dugumSec(id));
      g.addEventListener('click', () => dugumSec(id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dugumSec(id); } });
      g.addEventListener('mouseleave', devam);
      g.addEventListener('blur', devam);
    });

    if (azHareket) {
      isaret.classList.add('gizli-isaret');
      yollar.forEach(y => y.yol.classList.add('etkin'));
      yaz('Faiz, para, büyüme, enflasyon ve piyasalar birbirini etkiler. Bir düğüme dokun.');
      return;
    }
    // Ekranda değilken akışı durdur
    new IntersectionObserver(([g]) => {
      if (g.isIntersecting && !duraklat) { t0 = 0; cancelAnimationFrame(kare); kare = requestAnimationFrame(adim); }
      else cancelAnimationFrame(kare);
    }).observe(kap);
  }

  // ============================================
  // FAİZ DEĞİŞİNCE NE OLUR?
  // İki yönlü seçim; zincir adım adım, neden-sonuç sırasıyla belirir.
  // ============================================
  function initZincir() {
    const kok = document.getElementById('faiz-zinciri');
    if (!kok || typeof FAIZ_ZINCIRI === 'undefined') return;
    const liste = kok.querySelector('.zincir');
    const bedel = kok.querySelector('.zincir-bedel');
    const baslik = kok.querySelector('.zincir-baslik');
    const OK = {
      artar: '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></svg>',
      azalir: '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="m18 13-6 6-6-6"/></svg>'
    };
    const ciz = yon => {
      const z = FAIZ_ZINCIRI[yon];
      baslik.textContent = z.baslik;
      liste.replaceChildren(...z.adimlar.map((a, i) => {
        const ok = el('span', { className: 'zincir-yon ' + a.yon });
        ok.innerHTML = OK[a.yon];
        return el('li', { style: `--i: ${i}` },
          ok,
          el('div', {},
            el('strong', {}, a.ad, el('span', { className: 'zincir-fiil' }, a.yon === 'artar' ? ' artar' : ' azalır')),
            el('p', {}, a.not)));
      }));
      bedel.textContent = z.bedel;
      kok.classList.remove('oynat');
      void kok.offsetWidth;
      kok.classList.add('oynat');
    };
    const dugmeler = [...kok.querySelectorAll('[data-yon]')];
    dugmeler.forEach(b => b.addEventListener('click', () => {
      dugmeler.forEach(x => x.setAttribute('aria-checked', x === b));
      ciz(b.dataset.yon);
    }));
    kok.querySelector('.zincir-not').textContent = FAIZ_ZINCIRI.not;
    ciz('artis');
  }

  initAg();
  initZincir();
})();
