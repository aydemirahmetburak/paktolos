// ============================================
// VERİ GÖRSELLEŞTİRME SİSTEMİ
//
// İlke: grafik bir fikri anlatır, sayfayı süslemez.
//   · İnce çizgi (2px), silik ızgara, tek eksen; gereksiz eksen ve lejant yok
//   · En fazla iki seri, doğrulanmış renklerle (SERI). Metin seri rengini
//     giymez; kimliği rengin yanındaki işaret taşır
//   · Her grafikte ipucu (ölçü · değer · dönem · bağlam), klavyeyle ← →
//     gezinme ve tablo görünümü vardır
//   · Figür: başlık, kısa not ve kaynak künyesiyle (grafikFigur)
//
// Kullanan: araclar.js, kavram.js ve makale sayfaları. Canlı örnek: tasarim.html#grafik
// ============================================

// Doğrulanmış seri renkleri (tasarim/tokenlar.css: --data-1, --data-2)
const SERI = ['var(--data-1)', 'var(--data-2)'];

function sayiYaz(n, ondalik = 0) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });
}

function yuzdeYaz(n, ondalik = 1) {
  return (n < 0 ? '−%' : '%') + sayiYaz(Math.abs(n), ondalik);
}

function tabloGorunumu(baslik, satirlar) {
  return el('details', { className: 'table-view' },
    el('summary', {}, 'Tablo olarak gör'),
    el('div', { className: 'table-scroll' },
      el('table', { className: 'data-table' },
        el('thead', {}, el('tr', {}, ...baslik.map(b => el('th', { scope: 'col' }, b)))),
        el('tbody', {}, ...satirlar.map(r => el('tr', {}, ...r.map(h => el('td', {}, h))))))));
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
//         bicim(n), ipucuBaslik(i), baglam(i), xAdim, sonEtiket, aciklama, bosMetin }
//   renk: SERI[0], SERI[1] (doğrulanmış iki renk). Tek seride lejant yoktur,
//   başlık seriyi adlandırır; iki seride lejant ve (sığıyorsa) uç etiketleri.
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
    const baglam = spec.baglam ? spec.baglam(aktif) : null;
    ipucu.replaceChildren(...[el('div', { className: 'tip-title' }, spec.ipucuBaslik ? spec.ipucuBaslik(aktif) : etiketler[aktif]), ...satirlar,
      baglam ? el('div', { className: 'tip-context' }, baglam) : null].filter(Boolean));
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


// Figür: başlık, not ve kaynakla sarılmış grafik.
// grafikFigur({ baslik, not, kaynak }, spec, tablo?) → <figure>
function grafikFigur({ baslik, not, kaynak }, spec, tablo) {
  const kap = el('div');
  const figur = el('figure', { className: 'grafik-figur' },
    el('figcaption', {}, el('strong', {}, baslik), not ? el('span', {}, not) : null),
    kap,
    tablo ? tabloGorunumu(tablo.baslik, tablo.satirlar) : null,
    kaynak ? el('p', { className: 'grafik-kaynak' }, 'Kaynak: ', kaynak) : null);
  requestAnimationFrame(() => grafik(kap, spec));
  return figur;
}
