// Ana sayfa demosu: satıra dokununca açıklamayı yumuşakça aç/kapat
function toggleExplain(id) {
  const panel = document.getElementById('explain-' + id);
  const button = document.querySelector('[aria-controls="explain-' + id + '"]');
  const open = panel.classList.toggle('open');
  button.setAttribute('aria-expanded', open);
}

// Açılış ekranı: oturum başına bir kez gösterilir, dokununca geçilir
function initSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  let seen = false;
  try {
    seen = sessionStorage.getItem('splash-seen') === '1';
    sessionStorage.setItem('splash-seen', '1');
  } catch (e) { /* gizli sekme vb. — her seferinde göster */ }

  if (seen) {
    splash.remove();
    return;
  }
  splash.addEventListener('click', () => splash.classList.add('hide'));
  splash.addEventListener('animationend', e => {
    if (e.animationName === 'splash-out') splash.remove();
  });
}

// Menü: sayfa kaydırılınca alt çizgi belirir
function initNav() {
  const bar = document.querySelector('.nav-bar');
  if (!bar) return;
  const update = () => bar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Kaydırınca belirme
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => observer.observe(el));
}

// ============================================
// HESAPLAYICI
// ============================================

// Örnek A.Ş. — hayali şirket, milyon TL
const ORNEK_AS = {
  pd: 8000, netKar: 1000, hasilat: 10000, favok: 2000, ozkaynak: 5000,
  borc: 3000, nakit: 1000, donen: 4000, kv: 2500
};

// "1.250.000,5" → 1250000.5 (Türkçe yazım)
function parseTr(text) {
  const clean = text.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (clean === '') return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

function formatTr(n, digits = 1) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const ORANLAR = [
  {
    ad: 'F/K',
    gerekli: ['pd', 'netKar'],
    hesapla: v => v.netKar > 0 ? v.pd / v.netKar : null,
    yaz: (r, v) => v.netKar <= 0
      ? { deger: '—', not: 'Şirket zarar ediyor; F/K bu durumda anlamlı değil.' }
      : { deger: formatTr(r), not: `Bugünkü kâr sabit kalsa, piyasa değerini kazanmak ${formatTr(r)} yıl sürerdi.` }
  },
  {
    ad: 'PD/DD',
    gerekli: ['pd', 'ozkaynak'],
    hesapla: v => v.ozkaynak > 0 ? v.pd / v.ozkaynak : null,
    yaz: r => r === null
      ? { deger: '—', not: 'Özkaynak sıfır ya da negatif; oran anlamlı değil.' }
      : { deger: formatTr(r), not: r < 1
          ? 'Piyasa, şirkete özkaynağından daha düşük değer biçiyor.'
          : `Piyasa, şirkete özkaynağının ${formatTr(r)} katı değer biçiyor.` }
  },
  {
    ad: 'FD/FAVÖK',
    gerekli: ['pd', 'borc', 'nakit', 'favok'],
    hesapla: v => v.favok > 0 ? (v.pd + v.borc - v.nakit) / v.favok : null,
    yaz: r => r === null
      ? { deger: '—', not: 'FAVÖK sıfır ya da negatif; oran anlamlı değil.' }
      : { deger: formatTr(r), not: 'Borç dahil şirket değeri, yıllık faaliyet kârının bu kadar katı.' }
  },
  {
    ad: 'Özkaynak kârlılığı',
    gerekli: ['netKar', 'ozkaynak'],
    hesapla: v => v.ozkaynak > 0 ? v.netKar / v.ozkaynak * 100 : null,
    yaz: r => r === null
      ? { deger: '—', not: 'Özkaynak sıfır ya da negatif; oran anlamlı değil.' }
      : { deger: '%' + formatTr(r), not: `Her 100 TL özkaynak, yılda ${formatTr(r)} TL net kâr üretiyor.` }
  },
  {
    ad: 'Net kâr marjı',
    gerekli: ['netKar', 'hasilat'],
    hesapla: v => v.hasilat > 0 ? v.netKar / v.hasilat * 100 : null,
    yaz: r => r === null
      ? { deger: '—', not: 'Hasılat sıfır; oran hesaplanamıyor.' }
      : { deger: '%' + formatTr(r), not: `Her 100 TL'lik satıştan ${formatTr(r)} TL net kâr kalıyor.` }
  },
  {
    ad: 'Net borç / FAVÖK',
    gerekli: ['borc', 'nakit', 'favok'],
    hesapla: v => v.favok > 0 ? (v.borc - v.nakit) / v.favok : null,
    yaz: r => r === null
      ? { deger: '—', not: 'FAVÖK sıfır ya da negatif; oran anlamlı değil.' }
      : { deger: formatTr(r), not: r < 0
          ? 'Şirketin nakdi, finansal borcundan fazla (net nakit).'
          : `Net borç, bugünkü faaliyet kârıyla yaklaşık ${formatTr(r)} yılda kapanır.` }
  },
  {
    ad: 'Cari oran',
    gerekli: ['donen', 'kv'],
    hesapla: v => v.kv > 0 ? v.donen / v.kv : null,
    yaz: r => r === null
      ? { deger: '—', not: 'Kısa vadeli yükümlülük sıfır; oran hesaplanamıyor.' }
      : { deger: formatTr(r), not: r >= 1
          ? 'Kısa vadeli varlıklar, kısa vadeli borçları karşılıyor.'
          : 'Kısa vadeli borçlar, kısa vadeli varlıklardan fazla. Sektörü göz önünde bulundur.' }
  }
];

function initCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) return;
  const results = document.getElementById('calc-results');

  // Sonuç satırlarını bir kez oluştur, sonra yalnızca içeriği güncelle
  const rows = ORANLAR.map(oran => {
    const row = document.createElement('div');
    row.className = 'result';
    row.innerHTML = '<div class="result-head"><span class="result-name"></span><span class="result-value">—</span></div><p class="result-note"></p>';
    row.querySelector('.result-name').textContent = oran.ad;
    results.appendChild(row);
    return {
      value: row.querySelector('.result-value'),
      note: row.querySelector('.result-note')
    };
  });

  function update() {
    const v = {};
    for (const input of form.elements) {
      if (input.name) v[input.name] = parseTr(input.value);
    }

    ORANLAR.forEach((oran, i) => {
      const eksik = oran.gerekli.filter(k => v[k] === null);
      const row = rows[i];
      if (eksik.length) {
        row.value.textContent = '—';
        row.value.classList.remove('filled');
        row.note.textContent = 'Eksik: ' + eksik.map(k => form.elements[k].closest('.field').querySelector('span').firstChild.textContent.trim()).join(', ');
        return;
      }
      const sonuc = oran.yaz(oran.hesapla(v), v);
      row.value.textContent = sonuc.deger;
      row.value.classList.toggle('filled', sonuc.deger !== '—');
      row.note.textContent = sonuc.not;
    });
  }

  form.addEventListener('input', update);

  document.getElementById('calc-example').addEventListener('click', () => {
    for (const [k, n] of Object.entries(ORNEK_AS)) {
      form.elements[k].value = n.toLocaleString('tr-TR');
    }
    update();
  });

  document.getElementById('calc-clear').addEventListener('click', () => {
    form.reset();
    update();
  });

  update();
}

// ============================================
// ORTAK YARDIMCILAR
// ============================================

// Tarayıcı hafızası: gizli sekmede ya da kapalıysa sessizce vazgeçer
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* yok say */ }
  }
};

// Küçük DOM yardımcısı: el('p', { className: 'x' }, 'metin', çocuk...)
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style') node.style.cssText = v;
    else if (k in node) node[k] = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.filter(c => c !== null && c !== undefined));
  return node;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = () => window.matchMedia('(max-width: 734px)').matches;

function formatTL(n) {
  return Math.round(n).toLocaleString('tr-TR') + ' TL';
}

function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ============================================
// SÖZLÜK
// ============================================

const OKUNAN_KEY = 'paktolos-okunan';
const TR_ALFABE = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

// Türkçe karakterleri sadeleştirir; "sermaye" araması "Sermaye"yi,
// "ozkaynak" araması "Özkaynak"ı bulur. Harf sayısı değişmez, bu yüzden
// eşleşen yerin konumu orijinal metinde de aynıdır.
const SADE = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
function sadelestir(text) {
  return [...text].map(ch => {
    const lower = ch.toLocaleLowerCase('tr');
    return lower.length === 1 ? (SADE[lower] || lower) : ch.toLowerCase();
  }).join('');
}

// Eşleşen kısmı <mark> ile işaretleyerek metni DOM'a çevirir
function vurgula(text, query) {
  if (!query) return document.createTextNode(text);
  const i = sadelestir(text).indexOf(query);
  if (i === -1) return document.createTextNode(text);
  const frag = document.createDocumentFragment();
  frag.append(text.slice(0, i), el('mark', {}, text.slice(i, i + query.length)), text.slice(i + query.length));
  return frag;
}

function basHarf(terim) {
  return terim[0].toLocaleUpperCase('tr');
}

function gununKavrami() {
  const now = new Date();
  const gun = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return SOZLUK[(gun * 37) % SOZLUK.length];
}

// Ana sayfadaki "günün kavramı" kartı
function initHomeDaily() {
  const card = document.getElementById('home-daily');
  if (!card || typeof SOZLUK === 'undefined') return;
  const t = gununKavrami();
  document.getElementById('home-daily-term').textContent = t.terim;
  document.getElementById('home-daily-short').textContent = t.kisa;
  document.getElementById('home-daily-link').href = 'sozluk.html#' + t.id;
}

function initGlossary() {
  const list = document.getElementById('glossary-list');
  if (!list || typeof SOZLUK === 'undefined') return;

  const byId = new Map(SOZLUK.map(t => [t.id, t]));
  const sorted = [...SOZLUK].sort((a, b) => a.terim.localeCompare(b.terim, 'tr'));
  const search = document.getElementById('glossary-search');
  const filters = document.getElementById('glossary-filters');
  const empty = document.getElementById('glossary-empty');
  const letterIndex = document.getElementById('letter-index');
  const bar = document.getElementById('glossary-bar');

  let okunan = new Set(store.get(OKUNAN_KEY, []).filter(id => byId.has(id)));
  let aktifKategori = 'tum';
  let gorunen = sorted.map(t => t.id); // önceki/sonraki gezinmesi için

  // ---- İlerleme ----
  document.getElementById('total-count').textContent = SOZLUK.length;
  function updateProgress() {
    document.getElementById('read-count').textContent = okunan.size;
    document.getElementById('progress-fill').style.width = (okunan.size / SOZLUK.length * 100) + '%';
  }

  function markRead(id) {
    if (okunan.has(id)) return;
    okunan.add(id);
    store.set(OKUNAN_KEY, [...okunan]);
    updateProgress();
    const card = list.querySelector(`[data-id="${id}"]`);
    if (card) card.classList.add('read');
  }

  // ---- Günün kavramı ----
  const daily = gununKavrami();
  document.getElementById('daily-term').textContent = daily.terim;
  document.getElementById('daily-short').textContent = daily.kisa;
  document.getElementById('daily-open').addEventListener('click', () => openTerm(daily.id));
  document.getElementById('random-term').addEventListener('click', () => {
    const okunmamis = SOZLUK.filter(t => !okunan.has(t.id));
    const havuz = okunmamis.length ? okunmamis : SOZLUK;
    openTerm(havuz[Math.floor(Math.random() * havuz.length)].id);
  });

  // ---- Konu filtresi ----
  const secenekler = [['tum', 'Tümü'], ...Object.entries(KATEGORILER)];
  secenekler.forEach(([key, ad]) => {
    const b = el('button', { type: 'button', role: 'tab', textContent: ad });
    b.setAttribute('aria-selected', key === aktifKategori);
    b.addEventListener('click', () => {
      aktifKategori = key;
      filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', x === b));
      b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      render();
    });
    filters.appendChild(b);
  });

  // ---- Liste ----
  function termCard(t, query, i) {
    return el('button', {
      type: 'button',
      className: 'term-card' + (okunan.has(t.id) ? ' read' : ''),
      dataset: { id: t.id },
      style: `--i: ${Math.min(i, 12)}`
    },
      el('span', { className: 'term-meta' }, KATEGORILER[t.kategori], el('span', { className: 'term-read', title: 'Henüz okunmadı' })),
      el('span', { className: 'term-name' }, vurgula(t.terim, query)),
      el('span', { className: 'term-short' }, vurgula(t.kisa, query))
    );
  }

  function render() {
    const query = sadelestir(search.value.trim());
    let terimler = sorted.filter(t => aktifKategori === 'tum' || t.kategori === aktifKategori);

    const groups = [];
    if (query) {
      // Aramada en ilgili sonuç en üstte: adın başı > adın içi > özet > açıklama
      const puan = t => {
        const ad = sadelestir(t.terim);
        if (ad.startsWith(query)) return 4;
        if (ad.includes(query)) return 3;
        if (sadelestir(t.kisa).includes(query)) return 2;
        if (sadelestir(t.aciklama + ' ' + t.ornek).includes(query)) return 1;
        return 0;
      };
      terimler = terimler.map(t => [t, puan(t)]).filter(([, p]) => p > 0)
        .sort((a, b) => b[1] - a[1] || a[0].terim.localeCompare(b[0].terim, 'tr')).map(([t]) => t);
      if (terimler.length) groups.push([terimler.length + ' sonuç', terimler, null]);
    } else {
      for (const t of terimler) {
        const h = basHarf(t.terim);
        const last = groups[groups.length - 1];
        if (last && last[2] === h) last[1].push(t);
        else groups.push([h, [t], h]);
      }
    }

    gorunen = terimler.map(t => t.id);
    let i = 0;
    list.replaceChildren(...groups.map(([baslik, items, harf]) =>
      el('section', { className: 'letter-group' },
        el('h2', { className: 'letter-heading', id: harf ? 'harf-' + harf : null }, baslik,
          harf ? el('small', {}, items.length + ' kavram') : null),
        el('div', { className: 'term-grid' }, ...items.map(t => termCard(t, query, i++)))
      )
    ));
    empty.hidden = terimler.length > 0;

    // Harf dizini yalnızca alfabetik görünümde anlamlı
    const harfler = query ? [] : groups.map(g => g[2]);
    letterIndex.replaceChildren(...harfler.map(h => el('a', { href: '#harf-' + h, textContent: h })));
    letterIndex.hidden = harfler.length === 0;
  }

  list.addEventListener('click', e => {
    const card = e.target.closest('.term-card');
    if (card) openTerm(card.dataset.id);
  });

  let aramaZamani;
  search.addEventListener('input', () => {
    clearTimeout(aramaZamani);
    aramaZamani = setTimeout(render, 80);
  });
  search.addEventListener('keydown', e => {
    if (e.key === 'Escape') { search.value = ''; render(); }
    if (e.key === 'Enter') {
      const first = list.querySelector('.term-card');
      if (first) openTerm(first.dataset.id);
    }
  });

  // "/" tuşu aramaya odaklanır
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !sheet.open) {
      e.preventDefault();
      search.focus();
      bar.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  });

  // Arama çubuğu üste yapışınca cam zemin alır
  const navH = () => document.querySelector('.nav-bar').offsetHeight;
  const updateStuck = () => bar.classList.toggle('stuck', bar.getBoundingClientRect().top <= navH() + 0.5);
  window.addEventListener('scroll', updateStuck, { passive: true });
  updateStuck();

  // Harf dizini yalnızca liste görünürken belirir
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('glossary-in-view', entry.isIntersecting);
    }, { rootMargin: '-40% 0px -40% 0px' }).observe(list);
  }

  // Harf dizininde parmakla kaydırma (iOS Kişiler gibi)
  function scrubTo(x, y) {
    const a = document.elementFromPoint(x, y);
    if (a && a.parentElement === letterIndex) {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
    }
  }
  letterIndex.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.getAttribute('href').slice(1))
      .scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
  letterIndex.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    letterIndex.classList.add('active');
    letterIndex.setPointerCapture(e.pointerId);
    scrubTo(e.clientX, e.clientY);
  });
  letterIndex.addEventListener('pointermove', e => {
    if (letterIndex.classList.contains('active')) scrubTo(e.clientX, e.clientY);
  });
  const endScrub = () => letterIndex.classList.remove('active');
  letterIndex.addEventListener('pointerup', endScrub);
  letterIndex.addEventListener('pointercancel', endScrub);

  // ---- Kavram penceresi ----
  const sheet = document.getElementById('term-sheet');
  const panel = document.getElementById('sheet-panel');
  const content = document.getElementById('sheet-content');
  const scroller = document.getElementById('sheet-scroll');
  const prevBtn = document.getElementById('sheet-prev');
  const nextBtn = document.getElementById('sheet-next');
  let current = null;
  let pushedHistory = false;
  let ignorePop = false;
  let lastFocus = null;

  function fill(t) {
    current = t.id;
    document.getElementById('sheet-category').textContent = KATEGORILER[t.kategori];
    document.getElementById('sheet-term').textContent = t.terim;
    document.getElementById('sheet-short').textContent = t.kisa;
    document.getElementById('sheet-explain').textContent = t.aciklama;
    document.getElementById('sheet-example').textContent = t.ornek;
    document.getElementById('sheet-evaluate').textContent = t.degerlendir;

    const calc = document.getElementById('sheet-calc');
    calc.hidden = !t.hesap;
    calc.replaceChildren();
    if (t.hesap) calc.appendChild(MINI_HESAP[t.hesap]());

    const learn = document.getElementById('sheet-learn');
    learn.hidden = !t.ogren;
    if (t.ogren) learn.href = t.ogren;

    const tool = document.getElementById('sheet-tool');
    tool.hidden = !t.arac;
    if (t.arac) { tool.href = t.arac.href; tool.textContent = 'Kendin hesapla: ' + t.arac.ad; }

    document.getElementById('sheet-related').replaceChildren(...t.ilgili.map(id =>
      el('button', { type: 'button', textContent: byId.get(id).terim, onclick: () => swap(id) })
    ));

    // Önceki/sonraki: ekranda görünen sıraya göre; kavram listede yoksa tam listeye göre
    const sira = gorunen.includes(t.id) ? gorunen : sorted.map(x => x.id);
    const i = sira.indexOf(t.id);
    setNav(prevBtn, sira[i - 1]);
    setNav(nextBtn, sira[i + 1]);

    scroller.scrollTop = 0;
    markRead(t.id);
  }

  function setNav(btn, id) {
    btn.hidden = !id;
    btn.dataset.id = id || '';
    btn.querySelector('.sheet-nav-term').textContent = id ? byId.get(id).terim : '';
  }

  function openTerm(id, { push = true } = {}) {
    const t = byId.get(id);
    if (!t) return;
    if (sheet.open) { swap(id); return; }
    lastFocus = document.activeElement;
    fill(t);
    sheet.classList.remove('closing');
    panel.style.transform = '';
    sheet.showModal();
    document.documentElement.style.overflow = 'hidden';
    if (push) {
      history.pushState({ sheet: id }, '', '#' + id);
      pushedHistory = true;
    }
  }

  function swap(id) {
    if (id === current) return;
    history.replaceState({ sheet: id }, '', '#' + id);
    if (prefersReducedMotion()) { fill(byId.get(id)); return; }
    content.classList.add('swapping');
    setTimeout(() => {
      fill(byId.get(id));
      content.classList.remove('swapping');
    }, 180);
  }

  function finishClose() {
    sheet.classList.remove('closing');
    panel.classList.remove('dragging');
    panel.style.transform = '';
    panel.style.transition = '';
    if (sheet.open) sheet.close();
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function closeSheet({ fromHistory = false, animated = true } = {}) {
    if (!sheet.open || sheet.classList.contains('closing')) return;
    if (!fromHistory) {
      if (pushedHistory) { ignorePop = true; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search);
    }
    pushedHistory = false;
    current = null;
    if (!animated || prefersReducedMotion()) { finishClose(); return; }
    sheet.classList.add('closing');
    const done = () => { clearTimeout(fallback); finishClose(); };
    const fallback = setTimeout(done, 450);
    panel.addEventListener('animationend', done, { once: true });
  }

  document.getElementById('sheet-close').addEventListener('click', () => closeSheet());
  sheet.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
  prevBtn.addEventListener('click', () => prevBtn.dataset.id && swap(prevBtn.dataset.id));
  nextBtn.addEventListener('click', () => nextBtn.dataset.id && swap(nextBtn.dataset.id));
  sheet.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' && nextBtn.dataset.id) swap(nextBtn.dataset.id);
    if (e.key === 'ArrowLeft' && prevBtn.dataset.id) swap(prevBtn.dataset.id);
  });

  document.getElementById('sheet-share').addEventListener('click', async () => {
    const t = byId.get(current);
    const url = location.origin + location.pathname + '#' + t.id;
    if (navigator.share) {
      try { await navigator.share({ title: t.terim + ' — Paktolos', text: t.kisa, url }); } catch (e) { /* vazgeçildi */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('Bağlantı kopyalandı');
    } catch (e) {
      showToast(url);
    }
  });

  // Tarayıcının geri tuşu pencereyi kapatır; adres çubuğundaki #kavram açar
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    const id = decodeURIComponent(location.hash.slice(1));
    if (byId.has(id)) {
      if (sheet.open) swap(id);
      else openTerm(id, { push: false });
    } else if (sheet.open) {
      pushedHistory = false;
      closeSheet({ fromHistory: true });
    }
  });

  // Telefonda tutamaçtan aşağı çekerek kapatma
  const grabZone = [document.getElementById('sheet-grabber')];
  let drag = null;
  panel.addEventListener('pointerdown', e => {
    if (!isPhone() || !grabZone.some(z => z.contains(e.target))) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0 };
    panel.classList.add('dragging');
    panel.setPointerCapture(e.pointerId);
  });
  panel.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.dy = Math.max(0, e.clientY - drag.y);
    panel.style.transform = `translateY(${drag.dy}px)`;
  });
  const endDrag = () => {
    if (!drag) return;
    const hiz = drag.dy / (performance.now() - drag.t);
    const kapat = drag.dy > 140 || hiz > 0.6;
    drag = null;
    panel.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    if (kapat) {
      panel.style.transform = 'translateY(100%)';
      if (pushedHistory) { ignorePop = true; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search);
      pushedHistory = false;
      current = null;
      setTimeout(finishClose, 300);
    } else {
      panel.style.transform = '';
      setTimeout(() => { panel.style.transition = ''; panel.classList.remove('dragging'); }, 300);
    }
  };
  panel.addEventListener('pointerup', endDrag);
  panel.addEventListener('pointercancel', endDrag);

  updateProgress();
  render();

  // Sayfa bir kavram bağlantısıyla açıldıysa (sozluk.html#enflasyon)
  const ilk = decodeURIComponent(location.hash.slice(1));
  if (byId.has(ilk)) openTerm(ilk, { push: false });
}

// ---- Sözlük içindeki mini hesaplayıcılar ----

function slider(label, { min, max, step, value, format }) {
  const input = el('input', { type: 'range', min, max, step, value });
  const out = el('output', {});
  const update = () => {
    out.textContent = format(Number(input.value));
    input.style.setProperty('--p', ((input.value - min) / (max - min) * 100) + '%');
  };
  input.addEventListener('input', update);
  update();
  input.setAttribute('aria-label', label);
  return { node: el('label', { className: 'slider' }, el('span', { className: 'slider-head' }, label, out), input), input };
}

const yuzde = n => '%' + n.toLocaleString('tr-TR');

function barsFor(values, gain) {
  const max = Math.max(...values);
  return values.map(v => el('span', { className: gain ? 'gain' : '', style: `height: ${Math.max(2, v / max * 100)}%` }));
}

const MINI_HESAP = {
  reel() {
    const nominal = slider('Yıllık getirin', { min: 0, max: 100, step: 1, value: 45, format: yuzde });
    const enf = slider('Yıllık enflasyon', { min: 0, max: 100, step: 1, value: 35, format: yuzde });
    const big = el('div', { className: 'calc-big' });
    const text = el('p', {});
    const update = () => {
      const r = ((1 + nominal.input.value / 100) / (1 + enf.input.value / 100) - 1) * 100;
      const abs = Math.abs(r).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
      big.textContent = (r < 0 ? '−%' : '%') + abs;
      big.className = 'calc-big ' + (r > 0.05 ? 'positive' : r < -0.05 ? 'negative' : '');
      text.textContent = r > 0.05 ? `Paranın alım gücü yılda yaklaşık %${abs} artıyor.`
        : r < -0.05 ? `Hesabındaki rakam artsa da alım gücün yılda yaklaşık %${abs} azalıyor.`
        : 'Getirin enflasyonu ancak karşılıyor; alım gücün yerinde sayıyor.';
    };
    [nominal, enf].forEach(s => s.input.addEventListener('input', update));
    update();
    return el('div', { className: 'mini-calc' }, el('h3', {}, 'Kendin dene: reel getiri'), nominal.node, enf.node,
      el('div', { className: 'calc-answer' }, big, text));
  },

  bilesik() {
    const anapara = slider('Başlangıç', { min: 1000, max: 100000, step: 1000, value: 10000, format: formatTL });
    const oran = slider('Yıllık getiri', { min: 1, max: 100, step: 1, value: 40, format: yuzde });
    const yil = slider('Süre', { min: 1, max: 30, step: 1, value: 10, format: n => n + ' yıl' });
    const big = el('div', { className: 'calc-big' });
    const text = el('p', {});
    const bars = el('div', { className: 'bars', 'aria-hidden': 'true' });
    const update = () => {
      const P = Number(anapara.input.value), r = oran.input.value / 100, n = Number(yil.input.value);
      const degerler = Array.from({ length: n + 1 }, (_, k) => P * (1 + r) ** k);
      const toplam = degerler[n];
      const basit = P * (1 + r * n);
      big.textContent = formatTL(toplam);
      text.textContent = `Bunun ${formatTL(toplam - basit)} kadarı "faizin faizi". Bu hesap enflasyonu dikkate almaz; gerçek kazancı görmek için reel getiriye bak.`;
      bars.replaceChildren(...barsFor(degerler, true));
    };
    [anapara, oran, yil].forEach(s => s.input.addEventListener('input', update));
    update();
    return el('div', { className: 'mini-calc' }, el('h3', {}, 'Kendin dene: bileşik getiri'), anapara.node, oran.node, yil.node,
      el('div', { className: 'calc-answer' }, big, text, bars));
  },

  alimgucu() {
    const tutar = slider('Bugünkü tutar', { min: 1000, max: 100000, step: 1000, value: 10000, format: formatTL });
    const enf = slider('Yıllık enflasyon', { min: 1, max: 100, step: 1, value: 40, format: yuzde });
    const yil = slider('Süre', { min: 1, max: 10, step: 1, value: 5, format: n => n + ' yıl' });
    const big = el('div', { className: 'calc-big negative' });
    const text = el('p', {});
    const bars = el('div', { className: 'bars', 'aria-hidden': 'true' });
    const update = () => {
      const P = Number(tutar.input.value), i = enf.input.value / 100, n = Number(yil.input.value);
      const degerler = Array.from({ length: n + 1 }, (_, k) => P / (1 + i) ** k);
      big.textContent = formatTL(degerler[n]);
      text.textContent = `Yastık altında duran ${formatTL(P)}, ${n} yıl sonra bugünün ${formatTL(degerler[n])}'si kadar alışveriş yapabilir. Aynı sepeti alabilmek için ${formatTL(P * (1 + i) ** n)} gerekir.`;
      bars.replaceChildren(...barsFor(degerler, false));
    };
    [tutar, enf, yil].forEach(s => s.input.addEventListener('input', update));
    update();
    return el('div', { className: 'mini-calc' }, el('h3', {}, 'Kendin dene: alım gücü'), tutar.node, enf.node, yil.node,
      el('div', { className: 'calc-answer' }, big, text, bars));
  }
};

// ============================================
// KENDİNİ SINA
// ============================================

const TEST_EN_IYI_KEY = 'paktolos-test-en-iyi';

function initQuiz() {
  const quiz = document.getElementById('quiz');
  if (!quiz || typeof SORULAR === 'undefined') return;

  const card = document.getElementById('quiz-card');
  const options = document.getElementById('quiz-options');
  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const result = document.getElementById('quiz-result');
  const HARFLER = ['A', 'B', 'C', 'D'];

  let index = 0;
  let cevaplar = [];

  function show(i) {
    const q = SORULAR[i];
    document.getElementById('quiz-count').textContent = `${i + 1} / ${SORULAR.length}`;
    document.getElementById('quiz-situation').textContent = q.durum;
    document.getElementById('quiz-data').replaceChildren(...q.veri.map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v))));
    document.getElementById('quiz-question').textContent = q.soru;
    options.replaceChildren(...q.secenekler.map((s, j) =>
      el('button', { type: 'button', className: 'quiz-option', onclick: () => answer(j) },
        el('span', { className: 'option-key' }, HARFLER[j]), el('span', {}, s))
    ));
    feedback.classList.remove('open');
    nextBtn.disabled = true;
    nextBtn.textContent = i === SORULAR.length - 1 ? 'Sonucu gör' : 'Sonraki soru';
  }

  function answer(j) {
    if (cevaplar[index] !== undefined) return;
    const q = SORULAR[index];
    cevaplar[index] = j;
    const dogru = j === q.dogru;

    [...options.children].forEach((b, k) => {
      b.disabled = true;
      if (k === q.dogru) b.classList.add('correct');
      else if (k === j) b.classList.add('wrong');
      else b.classList.add('dim');
    });

    const verdict = document.getElementById('quiz-verdict');
    verdict.textContent = dogru ? 'Doğru.' : `Doğru cevap: ${HARFLER[q.dogru]}`;
    verdict.className = 'quiz-verdict ' + (dogru ? 'ok' : 'no');
    document.getElementById('quiz-explain').textContent = q.aciklama;
    const lesson = document.getElementById('quiz-lesson');
    lesson.textContent = 'Tekrar bak: ' + q.ders.ad;
    lesson.href = q.ders.href;

    feedback.classList.add('open');
    document.getElementById('quiz-track-fill').style.width = ((index + 1) / SORULAR.length * 100) + '%';
    nextBtn.disabled = false;
    nextBtn.focus({ preventScroll: true });
  }

  function next() {
    if (cevaplar[index] === undefined) return;
    if (index === SORULAR.length - 1) { finish(); return; }
    index++;
    if (prefersReducedMotion()) { show(index); return; }
    card.classList.add('leaving');
    setTimeout(() => {
      show(index);
      card.classList.remove('leaving');
      card.classList.add('entering');
      void card.offsetWidth; // yeni konumu uygula, sonra kaydırarak getir
      card.classList.remove('entering');
      const top = quiz.getBoundingClientRect().top;
      if (top < 0) quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  function finish() {
    const skor = cevaplar.filter((c, i) => c === SORULAR[i].dogru).length;
    const onceki = store.get(TEST_EN_IYI_KEY, null);
    if (onceki === null || skor > onceki) store.set(TEST_EN_IYI_KEY, skor);

    quiz.hidden = true;
    result.hidden = false;

    const [baslik, metin] =
      skor === SORULAR.length ? ['Kusursuz.', 'Oranları sadece hesaplamıyor, yorumlayabiliyorsun. Bu, çoğu yatırımcının atlamadığı bir adım.'] :
      skor >= 8 ? ['Çok iyi.', 'Sayıları okumayı biliyorsun. Kaçırdığın birkaç konuya aşağıdan tekrar bakabilirsin.'] :
      skor >= 5 ? ['İyi bir başlangıç.', 'Temel fikirler oturmuş. Aşağıdaki konulara tekrar göz atıp yeniden dene.'] :
      ['Her uzman bir yerden başladı.', 'Bu sorular kolay değil. Aşağıdaki konuları okuyup yeniden denediğinde farkı göreceksin.'];
    document.getElementById('result-title').textContent = baslik;
    document.getElementById('result-text').textContent = metin;
    document.getElementById('result-best').textContent =
      onceki !== null && skor > onceki ? `Yeni rekorun! Önceki en iyi skorun ${onceki}/${SORULAR.length} idi.` :
      onceki !== null ? `En iyi skorun: ${Math.max(onceki, skor)}/${SORULAR.length}` : '';

    const yanlislar = SORULAR.filter((q, i) => cevaplar[i] !== q.dogru);
    const review = document.getElementById('review');
    review.replaceChildren(...(yanlislar.length ? [el('p', { className: 'review-title' }, 'Tekrar bakmak isteyebileceğin konular')] : []),
      ...yanlislar.map(q => el('a', { href: q.ders.href }, el('span', {}, q.ders.ad), el('span', {}, '›'))));

    // Halka ve skor sayacı
    const ring = document.getElementById('ring-fill');
    const C = 2 * Math.PI * 52;
    ring.style.strokeDashoffset = C;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.strokeDashoffset = C * (1 - skor / SORULAR.length);
    }));
    const scoreEl = document.getElementById('result-score');
    if (prefersReducedMotion()) { scoreEl.textContent = skor; }
    else {
      const start = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - start) / 1200);
        scoreEl.textContent = Math.round(skor * (1 - (1 - p) ** 3));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    result.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function restart() {
    index = 0;
    cevaplar = [];
    document.getElementById('quiz-track-fill').style.width = '0';
    result.hidden = true;
    quiz.hidden = false;
    show(0);
    quiz.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  nextBtn.addEventListener('click', next);
  document.getElementById('quiz-restart').addEventListener('click', restart);

  // Klavye: 1–4 ya da A–D ile seç, Enter ile ilerle
  document.addEventListener('keydown', e => {
    if (quiz.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLocaleUpperCase('tr');
    const j = '1234'.includes(k) ? Number(k) - 1 : HARFLER.indexOf(k);
    if (j >= 0 && k !== '') answer(j);
    if (e.key === 'Enter' && !nextBtn.disabled && document.activeElement !== nextBtn) next();
  });

  show(0);
}

// ============================================
// SİTE GENELİ ARAMA (Spotlight)
// ============================================

const SPOT_SIMGE = {
  kavram: '<path d="M3.5 18.5l4.5-13 4.5 13"/><path d="M5.2 14h5.6"/><circle cx="17" cy="15.5" r="3"/><path d="M20 12.5v6"/>',
  ders: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V19"/>',
  arac: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 7.5h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  sektor: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  sayfa: '<path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M14 3.5V8h4"/>'
};
const SPOT_GRUP = { kavram: 'Kavramlar', ders: 'Dersler', arac: 'Araçlar', sektor: 'Sektörler', sayfa: 'Sayfalar' };
const SPOT_ONERI = ['Enflasyon', 'F/K oranı', 'Kredi notu', 'Bileşik getiri', 'Temettü', 'Bilanço'];

// Veri dosyası sayfada yoksa ilk aramada yüklenir
function scriptYukle(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

let spotDizin = null;
async function spotDiziniHazirla() {
  if (spotDizin) return spotDizin;
  const bekle = [];
  if (typeof SOZLUK === 'undefined') bekle.push(scriptYukle('sozluk-veri.js'));
  if (typeof ARAMA_DIZINI === 'undefined') bekle.push(scriptYukle('arama-veri.js'));
  await Promise.all(bekle);
  spotDizin = [
    ...SOZLUK.map(t => ({ tur: 'kavram', baslik: t.terim, aciklama: t.kisa, href: 'sozluk.html#' + t.id,
      anahtar: KATEGORILER[t.kategori], metin: t.aciklama })),
    ...ARAMA_DIZINI
  ].map(item => ({
    ...item,
    _baslik: sadelestir(item.baslik),
    _anahtar: sadelestir((item.anahtar || '') + ' ' + item.aciklama),
    _metin: sadelestir(item.metin || '')
  }));
  return spotDizin;
}

function spotAra(dizin, q) {
  const puanla = it => {
    if (it._baslik.startsWith(q)) return 6;
    if (it._baslik.includes(q)) return 5;
    if ((' ' + it._anahtar).includes(' ' + q)) return 4;
    if (it._anahtar.includes(q)) return 3;
    if (it._metin.includes(q)) return 1;
    return 0;
  };
  return dizin.map(it => [it, puanla(it)]).filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1] || a[0].baslik.localeCompare(b[0].baslik, 'tr'))
    .map(([it]) => it);
}

function initSpotlight() {
  const triggers = document.querySelectorAll('.search-trigger');
  let dialog = null, input, results, secili = 0, gorunen = [];

  function build() {
    dialog = el('dialog', { className: 'spotlight', 'aria-label': 'Sitede ara' });
    input = el('input', { type: 'search', placeholder: 'Kavram, ders ya da araç ara', autocomplete: 'off',
      'aria-label': 'Sitede ara', 'aria-controls': 'spot-results', 'aria-autocomplete': 'list' });
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.innerHTML = '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>';
    results = el('div', { className: 'spot-results', id: 'spot-results', role: 'listbox' });
    const panel = el('div', { className: 'spot-panel' },
      el('label', { className: 'spot-field' }, icon, input,
        el('button', { type: 'button', className: 'spot-close', textContent: 'Kapat', onclick: close })),
      results,
      el('div', { className: 'spot-foot' },
        el('span', {}, el('kbd', {}, '↑'), ' ', el('kbd', {}, '↓'), ' gezin'),
        el('span', {}, el('kbd', {}, '↵'), ' aç'),
        el('span', {}, el('kbd', {}, 'esc'), ' kapat'))
    );
    dialog.appendChild(panel);
    document.body.appendChild(dialog);

    let zaman;
    input.addEventListener('input', () => { clearTimeout(zaman); zaman = setTimeout(render, 60); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); select(secili + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); select(secili - 1); }
      if (e.key === 'Enter' && gorunen[secili]) { e.preventDefault(); go(gorunen[secili]); }
    });
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  }

  function select(i) {
    if (!gorunen.length) return;
    secili = (i + gorunen.length) % gorunen.length;
    results.querySelectorAll('.spot-item').forEach((a, k) => a.setAttribute('aria-selected', k === secili));
    const aktif = results.querySelectorAll('.spot-item')[secili];
    aktif.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', aktif.id);
  }

  function go(item) {
    close();
    location.href = item.href;
  }

  async function render() {
    const dizin = await spotDiziniHazirla();
    const q = sadelestir(input.value.trim());
    secili = 0;
    if (!q) {
      gorunen = [];
      results.replaceChildren(el('div', { className: 'spot-empty' },
        el('p', {}, 'Aklına takılan bir kavramı yaz.'),
        el('div', { className: 'spot-suggest' }, ...SPOT_ONERI.map(o =>
          el('button', { type: 'button', textContent: o, onclick: () => { input.value = o; render(); input.focus(); } })))));
      return;
    }
    const bulunan = spotAra(dizin, q).slice(0, 24);
    if (!bulunan.length) {
      gorunen = [];
      results.replaceChildren(el('div', { className: 'spot-empty' }, el('p', {}, `"${input.value.trim()}" için sonuç bulunamadı.`)));
      return;
    }
    // Gruplara ayır, her grupta en fazla 6 sonuç; gruplar ilk sonuca göre sıralanır
    const gruplar = new Map();
    for (const it of bulunan) {
      if (!gruplar.has(it.tur)) gruplar.set(it.tur, []);
      if (gruplar.get(it.tur).length < 6) gruplar.get(it.tur).push(it);
    }
    gorunen = [...gruplar.values()].flat();
    let n = 0;
    results.replaceChildren(...[...gruplar].flatMap(([tur, items]) => [
      el('div', { className: 'spot-group', role: 'presentation' }, SPOT_GRUP[tur]),
      ...items.map(it => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.innerHTML = SPOT_SIMGE[it.tur];
        const i = n++;
        return el('a', { className: 'spot-item', href: it.href, id: 'spot-' + i, role: 'option', 'aria-selected': i === 0,
          onclick: e => { e.preventDefault(); go(it); }, onmousemove: () => { if (secili !== i) select(i); } },
          el('span', { className: 'spot-icon' }, svg),
          el('span', { className: 'spot-text' },
            el('span', { className: 'spot-title' }, vurgula(it.baslik, q)),
            el('span', { className: 'spot-sub' }, it.aciklama)));
      })
    ]));
    input.setAttribute('aria-activedescendant', 'spot-0');
  }

  function open() {
    if (!dialog) build();
    if (dialog.open) return;
    dialog.classList.remove('closing');
    dialog.showModal();
    input.value = '';
    render();
    input.focus();
  }

  function close() {
    if (!dialog || !dialog.open || dialog.classList.contains('closing')) return;
    if (prefersReducedMotion()) { dialog.close(); return; }
    dialog.classList.add('closing');
    setTimeout(() => { dialog.close(); dialog.classList.remove('closing'); }, 190);
  }

  triggers.forEach(t => t.addEventListener('click', open));
  document.addEventListener('keydown', e => {
    const yaziyor = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    // Sözlük sayfasında "/" kendi aramasına gider
    else if (e.key === '/' && !yaziyor && !document.getElementById('glossary-search') && !document.querySelector('dialog[open]')) {
      e.preventDefault(); open();
    }
  });
}

// ============================================
// TEMA SEÇİCİ (alt bilgide)
// ============================================
function initThemeSwitch() {
  const sw = document.querySelector('.theme-switch');
  if (!sw || !window.paktolosTema) return;
  const buttons = sw.querySelectorAll('button');
  const guncelle = () => buttons.forEach(b => b.setAttribute('aria-checked', b.dataset.tema === paktolosTema.get()));
  buttons.forEach(b => b.addEventListener('click', () => { paktolosTema.set(b.dataset.tema); guncelle(); }));
  guncelle();
}

// ============================================
// UYGULAMA OLARAK YÜKLEME
// ============================================
function initInstall() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* çevrimdışı destek olmadan da çalışır */ });
  }

  const card = document.getElementById('install-card');
  if (!card) return;
  const yuklu = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (yuklu) return; // zaten ana ekranda

  const steps = document.getElementById('install-steps');
  const button = document.getElementById('install-button');
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  steps.innerHTML = ios
    ? 'Safari\'de <b>Paylaş</b> simgesine, ardından <b>Ana Ekrana Ekle</b>\'ye dokun.'
    : 'Tarayıcı menüsünden <b>Ana ekrana ekle</b> ya da <b>Uygulamayı yükle</b> seçeneğini kullan.';
  card.hidden = false;

  let istem = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    istem = e;
    button.hidden = false;
    steps.textContent = 'Tek dokunuşla ana ekranına ekle; internet olmadan da açılır.';
  });
  button.addEventListener('click', async () => {
    if (!istem) return;
    istem.prompt();
    await istem.userChoice;
    istem = null;
    button.hidden = true;
  });
  window.addEventListener('appinstalled', () => { card.hidden = true; });
}

// ============================================
// HİKÂYE — kaydırdıkça akan nehir
// ============================================
function initStory() {
  const story = document.querySelector('.story');
  const flow = document.querySelector('.river-flow');
  if (!story || !flow) return;

  const len = flow.getTotalLength();
  flow.style.strokeDasharray = len;
  flow.style.strokeDashoffset = len;

  // Sahnelerdeki çizimlerin uzunluğunu ölç (çizilme efekti için)
  document.querySelectorAll('.scene .draw').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength())));

  let bekliyor = false;
  const guncelle = () => {
    bekliyor = false;
    const r = story.getBoundingClientRect();
    const ilerleme = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    flow.style.strokeDashoffset = len * (1 - ilerleme);
  };
  window.addEventListener('scroll', () => {
    if (!bekliyor) { bekliyor = true; requestAnimationFrame(guncelle); }
  }, { passive: true });
  guncelle();

  if (prefersReducedMotion()) {
    document.querySelectorAll('.scene svg').forEach(svg => svg.pauseAnimations && svg.pauseAnimations());
  }
}

initSplash();
initNav();
initReveal();
initCalculator();
initHomeDaily();
initGlossary();
initQuiz();
initSpotlight();
initThemeSwitch();
initInstall();
initStory();
