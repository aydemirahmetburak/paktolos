// Araç kutusu: hesaplayıcılar ve grafik bileşeni
// script.js'teki el(), parseTr(), formatTL() ve prefersReducedMotion() kullanılır.

// ============================================
// ORTAK: SAYI ALANI (kaydırıcı + yazılabilir kutu)
// ============================================

function sayiYaz(n, ondalik = 0) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });
}

function yuzdeYaz(n, ondalik = 1) {
  return (n < 0 ? '−%' : '%') + sayiYaz(Math.abs(n), ondalik);
}

function sureYaz(ay) {
  const y = Math.floor(ay / 12), a = ay % 12;
  if (!y) return a + ' ay';
  return y + ' yıl' + (a ? ' ' + a + ' ay' : '');
}

// Kaydırıcı hızlı ayar için, kutu kesin değer için. Yazılan değer kaydırıcı
// aralığının dışında olabilir; kaydırıcı uçta durur, değer korunur.
function sayiAlani(etiket, { min, max, step, value, birim = '', ondalik = 0 }) {
  let deger = value;
  const kutu = el('input', { type: 'text', inputMode: 'decimal', value: sayiYaz(value, ondalik), 'aria-label': etiket });
  const kaydirici = el('input', { type: 'range', min, max, step, value, 'aria-label': etiket, tabIndex: -1 });
  const dinleyiciler = [];

  const doldur = () => kaydirici.style.setProperty('--p', ((Math.min(max, Math.max(min, deger)) - min) / (max - min) * 100) + '%');
  const bildir = () => dinleyiciler.forEach(fn => fn());

  kaydirici.addEventListener('input', () => {
    deger = Number(kaydirici.value);
    kutu.value = sayiYaz(deger, ondalik);
    doldur(); bildir();
  });
  kutu.addEventListener('input', () => {
    const n = parseTr(kutu.value);
    if (n === null || n < Math.min(0, min)) return;
    deger = n;
    kaydirici.value = Math.min(max, Math.max(min, n));
    doldur(); bildir();
  });
  kutu.addEventListener('blur', () => { kutu.value = sayiYaz(deger, ondalik); });
  kutu.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    deger = Math.max(Math.min(0, min), +(deger + (e.key === 'ArrowUp' ? 1 : -1) * step).toFixed(4));
    kutu.value = sayiYaz(deger, ondalik);
    kaydirici.value = deger;
    doldur(); bildir();
  });
  doldur();

  return {
    node: el('label', { className: 'num-field slider' },
      el('span', { className: 'num-head' }, etiket, el('span', { className: 'num-input' }, kutu, birim ? el('span', {}, birim) : null)),
      kaydirici),
    get: () => deger,
    // Dışarıdan değer ver (ör. senaryo); dinleyicileri tetiklemez
    set: v => { deger = v; kutu.value = sayiYaz(v, ondalik); kaydirici.value = Math.min(max, Math.max(min, v)); doldur(); },
    on: fn => dinleyiciler.push(fn)
  };
}

// Araç iskeleti: sol girişler, sağ sonuçlar
function aracIskeleti(kok, alanlar, not) {
  const girisler = el('div', { className: 'tool-inputs' }, ...alanlar.map(a => a.node), not ? el('p', { className: 'tool-note' }, ...[].concat(not)) : null);
  const sonuc = el('div', { className: 'tool-results', 'aria-live': 'polite' });
  kok.replaceChildren(girisler, sonuc);
  return sonuc;
}

function statSatiri(ciftler) {
  return el('dl', { className: 'stat-row' }, ...ciftler.map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v))));
}

function icgoru(...parcalar) {
  return el('div', { className: 'insight' }, el('span', { className: 'insight-title' }, 'Ne anlama geliyor?'), ...parcalar);
}

function tabloGorunumu(baslik, satirlar) {
  return el('details', { className: 'table-view' },
    el('summary', {}, 'Tablo olarak gör'),
    el('div', { className: 'table-scroll' },
      el('table', { className: 'data-table' },
        el('thead', {}, el('tr', {}, ...baslik.map(b => el('th', { scope: 'col' }, b)))),
        el('tbody', {}, ...satirlar.map(r => el('tr', {}, ...r.map(h => el('td', {}, h))))))));
}

function sozlukLink(id, metin) {
  return el('a', { href: 'sozluk.html#' + id }, metin);
}

// ============================================
// GRAFİK
// Çizgi (zaman içinde değişim) ve yığılmış sütun (parçaların toplamı).
// Tek eksen, ince çizgiler, silik ızgara; üzerine gelince tüm serilerin
// değerini gösteren ipucu; klavyeyle ← → gezilebilir.
// ============================================

// Eksen etiketleri: "150 B" yerine "150 bin" (B, milyar sanılmasın)
const kisaSayi = {
  format(n) {
    const a = Math.abs(n);
    if (a >= 1e9) return sayiYaz(n / 1e9, a >= 1e10 ? 0 : 1).replace(/,0$/, '') + ' mr';
    if (a >= 1e6) return sayiYaz(n / 1e6, a >= 1e7 ? 0 : 1).replace(/,0$/, '') + ' mn';
    if (a >= 1e3) return sayiYaz(n / 1e3, a >= 1e4 ? 0 : 1).replace(/,0$/, '') + ' bin';
    return sayiYaz(n);
  }
};

function guzelAdim(maks, adet = 4) {
  if (maks <= 0) return 1;
  const kaba = maks / adet;
  const us = Math.pow(10, Math.floor(Math.log10(kaba)));
  const oran = kaba / us;
  return (oran <= 1 ? 1 : oran <= 2 ? 2 : oran <= 2.5 ? 2.5 : oran <= 5 ? 5 : 10) * us;
}

function svgEl(tag, attrs = {}) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

// Üst köşeleri yuvarlak, tabanı düz sütun
function sutunYolu(x, y, w, h, r) {
  r = Math.min(r, h, w / 2);
  if (h <= 0) return '';
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

// spec: { tur: 'cizgi' | 'yigin', etiketler, seriler: [{ ad, renk, degerler }],
//         ipucuBaslik(i), bicim(n), xAdim, sonEtiket }
function grafik(kap, spec) {
  kap.classList.add('chart');
  kap._spec = spec;
  if (!kap._gozlem && 'ResizeObserver' in window) {
    let sonGenislik = 0;
    kap._gozlem = new ResizeObserver(() => {
      if (Math.abs(kap.clientWidth - sonGenislik) > 4) { sonGenislik = kap.clientWidth; ciz(kap); }
    });
    kap._gozlem.observe(kap);
  }
  ciz(kap);
}

function ciz(kap) {
  const spec = kap._spec;
  const { tur, etiketler, seriler, bicim } = spec;
  const W = Math.max(260, kap.clientWidth);
  const H = W < 480 ? 210 : 250;
  const n = etiketler.length;

  // Y ölçeği
  const tepe = tur === 'yigin'
    ? Math.max(...etiketler.map((_, i) => seriler.reduce((t, s) => t + (s.degerler[i] || 0), 0)))
    : Math.max(...seriler.flatMap(s => s.degerler.filter(v => v !== null)));
  const adim = guzelAdim(tepe);
  const yMaks = Math.max(adim, Math.ceil(tepe / adim) * adim);

  const sonEtiketGenislik = spec.sonEtiket && tur === 'cizgi' ? 64 : 0;
  const M = { sol: 48, sag: 8 + sonEtiketGenislik, ust: 10, alt: 24 };
  const pw = W - M.sol - M.sag, ph = H - M.ust - M.alt;
  const y = v => M.ust + ph - (v / yMaks) * ph;
  const bant = pw / n;
  const x = i => tur === 'yigin' ? M.sol + bant * (i + 0.5) : M.sol + (n === 1 ? pw / 2 : (i / (n - 1)) * pw);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, tabindex: 0, role: 'img',
    'aria-label': spec.aciklama || 'Grafik; değerler tablo görünümünde de var' });

  // Izgara ve eksen
  const izgara = svgEl('g', { class: 'grid' }), eksen = svgEl('g', { class: 'axis' });
  for (let v = 0; v <= yMaks + 1e-9; v += adim) {
    izgara.appendChild(svgEl('line', { x1: M.sol, x2: W - M.sag, y1: y(v), y2: y(v) }));
    const t = svgEl('text', { x: M.sol - 8, y: y(v) + 4, 'text-anchor': 'end' });
    t.textContent = kisaSayi.format(v);
    eksen.appendChild(t);
  }
  const xAdim = spec.xAdim || Math.ceil(n / Math.max(2, Math.floor(pw / 56)));
  etiketler.forEach((e, i) => {
    if (i % xAdim !== 0 && i !== n - 1) return;
    if (i === n - 1 && i % xAdim !== 0 && (i % xAdim) < xAdim / 2) return; // son etiket bir öncekine çok yakınsa atla
    const t = svgEl('text', { x: x(i), y: H - 6, 'text-anchor': 'middle' });
    t.textContent = e;
    eksen.appendChild(t);
  });
  svg.append(izgara, eksen);

  const gruplar = [];
  if (tur === 'yigin') {
    const w = Math.min(24, bant * 0.72);
    etiketler.forEach((_, i) => {
      const g = svgEl('g', { class: 'bar-group' });
      let taban = 0;
      const dolu = seriler.filter(s => (s.degerler[i] || 0) > 0);
      dolu.forEach((s, k) => {
        const v = s.degerler[i];
        const ustte = k === dolu.length - 1;
        const y0 = y(taban + v), h = y(taban) - y(taban + v) - (k > 0 ? 2 : 0); // 2px yüzey boşluğu
        g.appendChild(svgEl('path', { class: 'bar', fill: s.renk, d: ustte ? sutunYolu(x(i) - w / 2, y0, w, Math.max(0, h), 4) : `M${x(i) - w / 2},${y0} h${w} v${Math.max(0, h)} h${-w} Z` }));
        taban += v;
      });
      svg.appendChild(g);
      gruplar.push(g);
    });
  } else {
    seriler.forEach(s => {
      let d = '', basla = true;
      s.degerler.forEach((v, i) => {
        if (v === null) { basla = true; return; }
        d += (basla ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(v).toFixed(1);
        basla = false;
      });
      if (seriler.length === 1) {
        const son = s.degerler.length - 1;
        svg.appendChild(svgEl('path', { class: 'series-area', fill: s.renk, d: d + `L${x(son)},${y(0)}L${x(0)},${y(0)}Z` }));
      }
      svg.appendChild(svgEl('path', { class: 'series-line', stroke: s.renk, d }));
    });

    // Uç etiketleri: çakışırlarsa hiç koyma (lejant ve ipucu taşır)
    if (spec.sonEtiket) {
      const uclar = seriler.map(s => {
        let i = s.degerler.length - 1;
        while (i > 0 && s.degerler[i] === null) i--;
        return { s, i, v: s.degerler[i] };
      });
      const cakisma = uclar.some((a, k) => uclar.some((b, m) => m > k && Math.abs(y(a.v) - y(b.v)) < 16));
      uclar.forEach(({ s, i, v }) => {
        svg.appendChild(svgEl('circle', { class: 'dot', cx: x(i), cy: y(v), r: 4, fill: s.renk }));
        if (!cakisma) {
          const t = svgEl('text', { class: 'end-label', x: x(i) + 8, y: y(v) + 4 });
          t.textContent = kisaSayi.format(v);
          svg.appendChild(t);
        }
      });
    }
  }

  // Etkileşim katmanı
  const artiCizgi = svgEl('line', { class: 'crosshair', y1: M.ust, y2: M.ust + ph, visibility: 'hidden' });
  const noktalar = seriler.map(s => svgEl('circle', { class: 'dot', r: 4, fill: s.renk, visibility: 'hidden' }));
  if (tur === 'cizgi') svg.append(artiCizgi, ...noktalar);
  const kapan = svgEl('rect', { x: M.sol, y: M.ust, width: pw, height: ph, fill: 'transparent' });
  svg.appendChild(kapan);

  const ipucu = el('div', { className: 'chart-tip', role: 'status' });
  let aktif = -1;

  function goster(i) {
    aktif = Math.max(0, Math.min(n - 1, i));
    const cx = x(aktif);
    if (tur === 'cizgi') {
      artiCizgi.setAttribute('x1', cx); artiCizgi.setAttribute('x2', cx); artiCizgi.setAttribute('visibility', 'visible');
      seriler.forEach((s, k) => {
        const v = s.degerler[aktif];
        noktalar[k].setAttribute('visibility', v === null ? 'hidden' : 'visible');
        if (v !== null) { noktalar[k].setAttribute('cx', cx); noktalar[k].setAttribute('cy', y(v)); }
      });
    } else {
      gruplar.forEach((g, k) => g.classList.toggle('dim', k !== aktif));
    }
    const satirlar = seriler.map(s => {
      const v = s.degerler[aktif];
      return el('div', { className: 'tip-row' },
        el('span', { className: 'key-line', style: `background:${s.renk}` }),
        el('strong', {}, v === null ? (spec.bosMetin || '—') : bicim(v)),
        el('span', { className: 'tip-name' }, s.ad));
    });
    if (tur === 'yigin' && seriler.length > 1) {
      const top = seriler.reduce((t, s) => t + (s.degerler[aktif] || 0), 0);
      satirlar.push(el('div', { className: 'tip-row' }, el('span', { className: 'key-line', style: 'background:transparent' }), el('strong', {}, bicim(top)), el('span', { className: 'tip-name' }, 'Toplam')));
    }
    ipucu.replaceChildren(el('div', { className: 'tip-title' }, spec.ipucuBaslik ? spec.ipucuBaslik(aktif) : etiketler[aktif]), ...satirlar);
    ipucu.classList.add('show');
    const tw = ipucu.offsetWidth;
    const sol = cx + 14 + tw > W ? cx - 14 - tw : cx + 14;
    ipucu.style.transform = `translate(${Math.max(0, sol)}px, ${legend ? 24 : 0}px)`;
  }

  function gizle() {
    aktif = -1;
    ipucu.classList.remove('show');
    artiCizgi.setAttribute('visibility', 'hidden');
    noktalar.forEach(nk => nk.setAttribute('visibility', 'hidden'));
    gruplar.forEach(g => g.classList.remove('dim'));
  }

  const indeks = e => {
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    return tur === 'yigin' ? Math.floor((px - M.sol) / bant) : Math.round(((px - M.sol) / pw) * (n - 1));
  };
  svg.addEventListener('pointermove', e => goster(indeks(e)));
  svg.addEventListener('pointerdown', e => goster(indeks(e)));
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') gizle(); });
  svg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goster(aktif < 0 ? 0 : aktif + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goster(aktif < 0 ? n - 1 : aktif - 1); }
    if (e.key === 'Escape') gizle();
  });
  svg.addEventListener('blur', gizle);

  const legend = seriler.length > 1
    ? el('div', { className: 'chart-legend' }, ...seriler.map(s =>
        el('span', {}, el('i', { className: tur === 'yigin' ? 'key-rect' : 'key-line', style: `background:${s.renk}` }), s.ad)))
    : null;

  kap.replaceChildren(...[legend, svg, ipucu].filter(Boolean));
}

const RENK_1 = 'var(--chart-1)';
const RENK_2 = 'var(--chart-2)';

// ============================================
// 1. KREDİ
// ============================================
function krediAraci(kok) {
  const tutar = sayiAlani('Kredi tutarı', { min: 10000, max: 2000000, step: 5000, value: 250000, birim: 'TL' });
  const faiz = sayiAlani('Aylık faiz', { min: 0.5, max: 6, step: 0.01, value: 3.49, birim: '%', ondalik: 2 });
  const vade = sayiAlani('Vade', { min: 3, max: 120, step: 1, value: 24, birim: 'ay' });
  const sonuc = aracIskeleti(kok, [tutar, faiz, vade], [
    'Bankanın ilan ettiği faize KKDF ve BSMV gibi vergiler ile masraflar eklenebilir. Krediler arasında karşılaştırma yaparken ',
    sozlukLink('yillik-maliyet-orani', 'yıllık maliyet oranına'), ' bak.'
  ]);
  const grafikKap = el('div');

  function hesapla() {
    const P = tutar.get(), r = faiz.get() / 100, n = Math.max(1, Math.round(vade.get()));
    const T = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
    const plan = [];
    let kalan = P;
    for (let k = 1; k <= n; k++) {
      const f = kalan * r, a = T - f;
      kalan = Math.max(0, kalan - a);
      plan.push({ k, f, a, kalan });
    }
    const toplamFaiz = T * n - P;
    const yillik = (Math.pow(1 + r, 12) - 1) * 100;

    // 36 aydan uzunsa grafik yıllara toplanır
    const yillara = n > 36;
    const kovalar = yillara
      ? Array.from({ length: Math.ceil(n / 12) }, (_, y) => plan.slice(y * 12, y * 12 + 12))
      : plan.map(p => [p]);
    const toplamla = (dizi, alan) => dizi.reduce((t, p) => t + p[alan], 0);

    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, formatTL(T)),
      el('p', { className: 'hero-caption' }, `aylık taksit · ${n} ay`),
      statSatiri([
        ['Toplam geri ödeme', formatTL(T * n)],
        ['Toplam faiz', formatTL(toplamFaiz)],
        ['Yıllık bileşik karşılığı', yuzdeYaz(yillik)]
      ]),
      grafikKap,
      icgoru(
        'İlk taksitte ödediğin ', el('b', {}, formatTL(T)), ' içinde faizin payı ', el('b', {}, yuzdeYaz(plan[0].f / T * 100, 0)), '. ',
        'Taksit aynı kalsa da içindeki faiz payı her ay azalır; son taksitte bu pay ', el('b', {}, yuzdeYaz(plan[n - 1].f / T * 100, 0)), ' olur. ',
        'Borç aldığın her 100 TL için toplam ', el('b', {}, formatTL(toplamFaiz / P * 100)), ' faiz ödüyorsun.'
      ),
      tabloGorunumu(['Ay', 'Taksit', 'Faiz', 'Anapara', 'Kalan borç'],
        plan.map(p => [p.k, formatTL(T), formatTL(p.f), formatTL(p.a), formatTL(p.kalan)]))
    );
    grafik(grafikKap, {
      tur: 'yigin',
      etiketler: kovalar.map((_, i) => yillara ? (i + 1) + '. yıl' : String(i + 1)),
      seriler: [
        { ad: 'Anapara', renk: RENK_2, degerler: kovalar.map(k => toplamla(k, 'a')) },
        { ad: 'Faiz', renk: RENK_1, degerler: kovalar.map(k => toplamla(k, 'f')) }
      ],
      bicim: formatTL,
      ipucuBaslik: i => yillara ? `${i + 1}. yıl ödemeleri` : `${i + 1}. taksit`,
      aciklama: 'Her taksitteki anapara ve faiz payı'
    });
  }
  [tutar, faiz, vade].forEach(a => a.on(hesapla));
  hesapla();
}

// ============================================
// 2. ASGARİ ÖDEME
// ============================================
function kartBorcuSimule(borc, r, { oran, sabit }) {
  const bakiyeler = [borc];
  let B = borc, toplamFaiz = 0, toplamOdeme = 0, ay = 0;
  while (B > 0.5 && ay < 600) {
    let odeme = sabit ? Math.min(B, sabit) : (B < 50 ? B : B * oran);
    const kalan = B - odeme;
    const f = kalan * r;
    // Sabit ödeme faizi bile karşılamıyorsa borç hiç bitmez
    if (sabit && kalan + f >= B) return { bitmez: true, bakiyeler };
    toplamFaiz += f;
    toplamOdeme += odeme;
    B = kalan + f;
    ay++;
    bakiyeler.push(B > 0.5 ? B : 0);
  }
  return { ay, toplamFaiz, toplamOdeme, bakiyeler };
}

function asgariAraci(kok) {
  const borc = sayiAlani('Kart borcu', { min: 1000, max: 500000, step: 1000, value: 50000, birim: 'TL' });
  const faiz = sayiAlani('Aylık akdi faiz', { min: 1, max: 6, step: 0.05, value: 4.25, birim: '%', ondalik: 2 });
  const oran = sayiAlani('Asgari ödeme oranı', { min: 10, max: 50, step: 5, value: 20, birim: '%' });
  const sabit = sayiAlani('Karşılaştırma: her ay sabit ödeme', { min: 500, max: 100000, step: 500, value: 12000, birim: 'TL' });
  const sonuc = aracIskeleti(kok, [borc, faiz, oran, sabit],
    'Yeni harcama yapılmadığı ve faizin ödeme sonrası kalan borca işlediği varsayılır. Vergiler (KKDF, BSMV) ve gecikme faizi dahil değildir; gerçek maliyet daha yüksek olabilir. Faiz ve asgari oranı ekstrende yazar.');
  const grafikKap = el('div');

  function hesapla() {
    const B = borc.get(), r = faiz.get() / 100;
    const a = kartBorcuSimule(B, r, { oran: oran.get() / 100 });
    const s = kartBorcuSimule(B, r, { sabit: sabit.get() });
    const uzunluk = Math.max(a.bakiyeler.length, s.bakiyeler.length);
    const dolgu = dizi => Array.from({ length: uzunluk }, (_, i) => i < dizi.length ? dizi[i] : null);

    const sabitMetin = formatTL(sabit.get());
    const ilkAsgari = B * oran.get() / 100;
    const asgaridenAz = !s.bitmez && sabit.get() <= ilkAsgari;
    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, sureYaz(a.ay)),
      el('p', { className: 'hero-caption' }, 'yalnızca asgari ödersen borcun bu kadar sürer'),
      statSatiri([
        ['Asgariyle toplam faiz', formatTL(a.toplamFaiz)],
        [`Her ay ${sabitMetin} ile`, s.bitmez ? 'Bitmez' : sureYaz(s.ay)],
        [`${sabitMetin} ile toplam faiz`, s.bitmez ? '—' : formatTL(s.toplamFaiz)]
      ]),
      grafikKap,
      asgaridenAz
        ? icgoru('Her ay ', el('b', {}, sabitMetin), ' ödemek, ilk asgari ödemeden (', el('b', {}, formatTL(ilkAsgari)), ') az. ',
            'Asgari ödemenin tuzağı, borç küçüldükçe ödemenin de küçülmesi ve borcun yıllara yayılmasıdır. Karşılaştırmayı görmek için asgari tutardan yüksek bir sabit ödeme dene.')
        : s.bitmez
        ? icgoru('Her ay ', el('b', {}, sabitMetin), ' ödemek, işleyen faizi bile karşılamıyor; bu tutarla borç hiç bitmez. Ödemeyi artırmak ya da daha düşük faizli bir krediyle borcu kapatmak gerekir.')
        : icgoru('Yalnızca asgariyi ödersen borç ', el('b', {}, sureYaz(a.ay)), ' sürer ve ', el('b', {}, formatTL(a.toplamFaiz)), ' faiz ödersin. ',
            'Her ay ', el('b', {}, sabitMetin), ' ödersen ', el('b', {}, sureYaz(s.ay)), 'da biter; ',
            el('b', {}, formatTL(Math.max(0, a.toplamFaiz - s.toplamFaiz))), ' daha az faiz ödersin. ',
            'Asgari ödeme bir çözüm değil, bir ertelemedir. ', sozlukLink('asgari-odeme', 'Asgari ödeme nedir? ›')),
      tabloGorunumu(['Ay', 'Asgariyle kalan', `${sabitMetin} ile kalan`],
        Array.from({ length: uzunluk }, (_, i) => [i, i < a.bakiyeler.length ? formatTL(a.bakiyeler[i]) : '—', s.bitmez ? '—' : i < s.bakiyeler.length ? formatTL(s.bakiyeler[i]) : '—']))
    );
    grafik(grafikKap, {
      tur: 'cizgi',
      etiketler: Array.from({ length: uzunluk }, (_, i) => i === 0 ? 'Bugün' : i % 12 === 0 ? (i / 12) + '. yıl' : i + '. ay'),
      xAdim: uzunluk > 60 ? 24 : 12,
      seriler: [
        { ad: 'Yalnızca asgari', renk: RENK_1, degerler: dolgu(a.bakiyeler) },
        { ad: `Her ay ${sabitMetin}` + (s.bitmez ? ' (bitmez)' : ''), renk: RENK_2, degerler: s.bitmez ? a.bakiyeler.map(() => null) : dolgu(s.bakiyeler) }
      ],
      bicim: formatTL,
      bosMetin: s.bitmez ? 'Bitmez' : 'Bitti',
      ipucuBaslik: i => i === 0 ? 'Bugünkü borç' : `${i}. ay sonunda kalan borç`,
      aciklama: 'Aylara göre kalan kart borcu'
    });
  }
  [borc, faiz, oran, sabit].forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
// 3. TAKSİT Mİ PEŞİN Mİ
// ============================================
function taksitAraci(kok) {
  const pesin = sayiAlani('Peşin fiyat', { min: 1000, max: 500000, step: 500, value: 30000, birim: 'TL' });
  const toplam = sayiAlani('Taksitli toplam fiyat', { min: 1000, max: 600000, step: 500, value: 33000, birim: 'TL' });
  const adet = sayiAlani('Taksit sayısı', { min: 2, max: 36, step: 1, value: 9, birim: 'taksit' });
  const getiri = sayiAlani('Paranın aylık getirisi', { min: 0, max: 6, step: 0.1, value: 3, birim: '%', ondalik: 1 });
  const sonuc = aracIskeleti(kok, [pesin, toplam, adet, getiri],
    'Aylık getiri olarak, parayı bekletebileceğin yerin (ör. vadeli mevduat) vergi sonrası aylık getirisini yaz. İlk taksitin bir ay sonra ödendiği varsayılır.');

  function hesapla() {
    const P = pesin.get(), S = toplam.get(), n = Math.max(1, Math.round(adet.get())), i = getiri.get() / 100;
    const T = S / n;
    const bugunkuDeger = oranla => Array.from({ length: n }, (_, k) => T / Math.pow(1 + oranla, k + 1)).reduce((a, b) => a + b, 0);
    const BD = bugunkuDeger(i);
    const fark = P - BD; // artı: taksit daha ucuz

    // Taksitli planın gizli (örtük) aylık faizi: bugünkü değeri peşin fiyata eşitleyen oran
    let alt = -0.5, ust = 1;
    for (let k = 0; k < 80; k++) {
      const orta = (alt + ust) / 2;
      if (bugunkuDeger(orta) > P) alt = orta; else ust = orta;
    }
    const ortuk = (alt + ust) / 2 * 100;

    const esit = Math.abs(fark) < P * 0.005;
    const hukum = esit ? 'İkisi neredeyse aynı' : fark > 0 ? 'Taksit daha avantajlı' : 'Peşin daha avantajlı';
    const maks = Math.max(P, BD, S);
    const cubuk = (ad, v) => el('div', { className: 'compare-row' }, el('span', {}, ad),
      el('span', { className: 'compare-track' }, el('span', { className: 'compare-bar', style: `width:${(v / maks * 100).toFixed(1)}%` }), el('span', { className: 'compare-value' }, formatTL(v))));

    sonuc.replaceChildren(
      el('span', { className: 'verdict' }, hukum),
      el('div', { className: 'hero-figure' }, formatTL(Math.abs(fark))),
      el('p', { className: 'hero-caption' }, esit ? 'bugünün parasıyla fark çok küçük' : `bugünün parasıyla ${fark > 0 ? 'taksidin' : 'peşinin'} kazancı`),
      statSatiri([
        ['Vade farkı', formatTL(S - P) + ' (' + yuzdeYaz((S - P) / P * 100) + ')'],
        ['Planın gizli aylık faizi', yuzdeYaz(ortuk, 2)],
        ['Taksit tutarı', formatTL(T) + ' × ' + n]
      ]),
      el('div', { className: 'compare', role: 'img', 'aria-label': 'Peşin fiyat, taksitlerin bugünkü değeri ve taksitli toplam' },
        cubuk('Peşin fiyat', P), cubuk('Taksitlerin bugünkü değeri', BD), cubuk('Taksitli toplam', S)),
      icgoru(
        'Taksitli planın gizli faizi aylık ', el('b', {}, yuzdeYaz(ortuk, 2)), '; paranın getirisi aylık ', el('b', {}, yuzdeYaz(i * 100, 1)), '. ',
        esit ? 'İkisi birbirine çok yakın; karar için taksit rahatlığı ya da peşin indirimi gibi diğer etkenlere bakabilirsin.'
          : fark > 0 ? 'Paranı bekletip taksit ödemek, bugünün parasıyla daha ucuz.'
          : 'Parayı bekletmenin getirisi, taksitteki gizli faizi karşılamıyor; peşin ödemek daha ucuz.',
        ' ', sozlukLink('vade-farki', 'Vade farkı nedir? ›'))
    );
  }
  [pesin, toplam, adet, getiri].forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
// 4. BİRİKİM HEDEFİ
// ============================================
function hedefAraci(kok) {
  const hedef = sayiAlani('Hedef (bugünün fiyatıyla)', { min: 10000, max: 10000000, step: 10000, value: 500000, birim: 'TL' });
  const sure = sayiAlani('Süre', { min: 1, max: 30, step: 1, value: 3, birim: 'yıl' });
  const mevcut = sayiAlani('Şu anki birikimin', { min: 0, max: 5000000, step: 5000, value: 0, birim: 'TL' });
  const getiri = sayiAlani('Beklenen yıllık getiri', { min: 0, max: 80, step: 1, value: 40, birim: '%' });
  const enf = sayiAlani('Beklenen yıllık enflasyon', { min: 0, max: 80, step: 1, value: 30, birim: '%' });
  const sonuc = aracIskeleti(kok, [hedef, sure, mevcut, getiri, enf],
    'Getiri garanti değildir. Hesap, her yıl aynı getiri ve enflasyon gerçekleşeceği varsayımıyla yapılır; aylık birikim ay sonunda yatırılır.');
  const grafikKap = el('div');

  function hesapla() {
    const H = hedef.get(), y = Math.max(1, Math.round(sure.get())), PV = mevcut.get();
    const g = getiri.get() / 100, e = enf.get() / 100;
    const FV = H * Math.pow(1 + e, y);
    const i = Math.pow(1 + g, 1 / 12) - 1, n = 12 * y;
    const buyume = Math.pow(1 + i, n);
    let C = i === 0 ? (FV - PV) / n : (FV - PV * buyume) * i / (buyume - 1);
    const yeterli = C <= 0;
    C = Math.max(0, C);

    const bakiye = ay => PV * Math.pow(1 + i, ay) + (i === 0 ? C * ay : C * (Math.pow(1 + i, ay) - 1) / i);
    const yillar = Array.from({ length: y }, (_, k) => {
      const ay = 12 * (k + 1), toplam = bakiye(ay), yatirilan = PV + C * ay;
      return { toplam, yatirilan, getiri: Math.max(0, toplam - yatirilan) };
    });
    const yatirilanToplam = PV + C * n;
    const reel = ((1 + g) / (1 + e) - 1) * 100;

    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, formatTL(C)),
      el('p', { className: 'hero-caption' }, yeterli ? 'şu anki birikimin, bu getiriyle hedefe yetiyor' : `${y * 12} ay boyunca, her ay`),
      statSatiri([
        [`Hedefin ${y} yıl sonraki fiyatı`, formatTL(FV)],
        ['Toplam yatırdığın', formatTL(yatirilanToplam)],
        ['Getiriden gelen', formatTL(Math.max(0, FV - yatirilanToplam))]
      ]),
      grafikKap,
      icgoru(
        'Bugün ', el('b', {}, formatTL(H)), ' olan hedef, yıllık ', el('b', {}, yuzdeYaz(e * 100, 0)), ' enflasyonla ', el('b', {}, y + ' yıl'), ' sonra ',
        el('b', {}, formatTL(FV)), ' olur; planı bu rakama göre yapmak gerekir. ',
        reel < 0
          ? el('span', {}, 'Beklenen getiri enflasyonun altında (reel getiri ', el('b', {}, yuzdeYaz(reel)), '): biriktirdikçe hedef senden uzaklaşır.')
          : el('span', {}, 'Aylık yükünü asıl belirleyen, getirinin enflasyonun ne kadar üzerinde olduğu: reel getirin ', el('b', {}, yuzdeYaz(reel)), '.'),
        ' ', sozlukLink('reel-getiri', 'Reel getiri nedir? ›')),
      tabloGorunumu(['Yıl', 'Yatırdığın', 'Getiri', 'Toplam'],
        yillar.map((v, k) => [k + 1, formatTL(v.yatirilan), formatTL(v.getiri), formatTL(v.toplam)]))
    );
    grafik(grafikKap, {
      tur: 'yigin',
      etiketler: yillar.map((_, k) => (k + 1) + '. yıl'),
      seriler: [
        { ad: 'Yatırdığın', renk: RENK_2, degerler: yillar.map(v => v.yatirilan) },
        { ad: 'Getiri', renk: RENK_1, degerler: yillar.map(v => v.getiri) }
      ],
      bicim: formatTL,
      ipucuBaslik: i => `${i + 1}. yıl sonunda`,
      aciklama: 'Yıllara göre birikimin: yatırdığın ve getiri'
    });
  }
  [hedef, sure, mevcut, getiri, enf].forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
// 5. ERKEN BAŞLAMAK
// ============================================
function erkenAraci(kok) {
  const tutar = sayiAlani('Aylık birikim', { min: 500, max: 50000, step: 500, value: 2000, birim: 'TL' });
  const getiri = sayiAlani('Yıllık reel getiri', { min: 0, max: 12, step: 0.5, value: 5, birim: '%', ondalik: 1 });
  const sonuc = aracIskeleti(kok, [tutar, getiri],
    'Reel getiri, enflasyondan arındırılmış getiridir; bu yüzden sonuçlar bugünün parasıyla gösterilir. Uzun vadede birkaç puanlık reel getiri bile büyük fark yaratır.');
  const grafikKap = el('div');

  function hesapla() {
    const C = tutar.get(), i = Math.pow(1 + getiri.get() / 100, 1 / 12) - 1;
    // 25 yaşından 65 yaşına, her doğum gününde birikim
    const simule = (bas, bit) => {
      const yaslar = [];
      let B = 0;
      for (let yas = 25; yas <= 65; yas++) {
        yaslar.push(B);
        if (yas === 65) break;
        for (let a = 0; a < 12; a++) B = B * (1 + i) + (yas >= bas && yas < bit ? C : 0);
      }
      return yaslar;
    };
    const ayse = simule(25, 35), ali = simule(35, 65);
    const A = ayse[40], L = ali[40];
    const yatirA = C * 120, yatirL = C * 360;
    const ayseOnde = A >= L;

    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, formatTL(A)),
      el('p', { className: 'hero-caption' }, 'Ayşe\'nin 65 yaşındaki birikimi · bugünün parasıyla'),
      statSatiri([
        ['Ayşe\'nin yatırdığı', formatTL(yatirA)],
        ['Ali\'nin yatırdığı', formatTL(yatirL)],
        ['Ali\'nin birikimi', formatTL(L)]
      ]),
      grafikKap,
      ayseOnde
        ? icgoru('Ayşe, Ali\'nin ', el('b', {}, 'üçte biri kadar'), ' para yatırdı ama 65 yaşında ', el('b', {}, formatTL(A - L)), ' daha fazla birikime sahip. ',
            'Farkı yaratan para değil, zaman: Ayşe\'nin ilk birikimleri 40 yıl boyunca büyüdü. ', sozlukLink('bilesik-getiri', 'Bileşik getiri nedir? ›'))
        : icgoru('Bu getiriyle Ali öne geçiyor; ama ', el('b', {}, 'üç kat fazla'), ' para yatırarak. ',
            'Ayşe\'nin yatırdığı her lira ', el('b', {}, sayiYaz(A / yatirA, 1) + ' katına'), ' çıkarken, Ali\'ninki ', el('b', {}, sayiYaz(L / yatirL, 1) + ' katına'), ' çıktı. ',
            'Getiriyi biraz artırıp farkı izle. ', sozlukLink('bilesik-getiri', 'Bileşik getiri nedir? ›')),
      tabloGorunumu(['Yaş', 'Ayşe', 'Ali'], ayse.map((v, k) => [25 + k, formatTL(v), formatTL(ali[k])]))
    );
    grafik(grafikKap, {
      tur: 'cizgi',
      etiketler: ayse.map((_, k) => String(25 + k)),
      xAdim: 5,
      sonEtiket: true,
      seriler: [
        { ad: 'Ayşe · 25–35 arası', renk: RENK_1, degerler: ayse },
        { ad: 'Ali · 35–65 arası', renk: RENK_2, degerler: ali }
      ],
      bicim: formatTL,
      ipucuBaslik: i => `${25 + i} yaşında`,
      aciklama: 'Yaşa göre Ayşe ve Ali\'nin birikimi'
    });
  }
  [tutar, getiri].forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
const ARACLAR = { kredi: krediAraci, asgari: asgariAraci, taksit: taksitAraci, hedef: hedefAraci, erken: erkenAraci };
document.querySelectorAll('[data-tool]').forEach(kok => ARACLAR[kok.dataset.tool](kok));
