// Paktolos Okulu: dersler, günün sorusu ve Karnem
// script.js'teki el(), store, prefersReducedMotion() ve showToast() kullanılır.
// Tüm ilerleme yalnızca bu cihazda (localStorage) tutulur.

const DERS_KEY = 'paktolos-dersler';
const GUNLUK_KEY = 'paktolos-gunluk';
const HARF = ['A', 'B', 'C', 'D'];

const svgIkon = (d, attrs = '') => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = d;
  if (attrs) s.setAttribute('class', attrs);
  return s;
};
const ONAY_IKON = '<path d="m5 12.5 4.5 4.5L19 7.5"/>';

// Yerel tarih: "2026-09-25"
function gunAnahtari(tarih = new Date()) {
  const y = tarih.getFullYear(), a = String(tarih.getMonth() + 1).padStart(2, '0'), g = String(tarih.getDate()).padStart(2, '0');
  return `${y}-${a}-${g}`;
}
function gunEkle(n) {
  const t = new Date();
  t.setDate(t.getDate() + n);
  return gunAnahtari(t);
}

function dersIlerleme() { return store.get(DERS_KEY, {}); }

function halka(oran, etiket, alt) {
  const C = 2 * Math.PI * 52;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fill" cx="60" cy="60" r="52" style="stroke-dashoffset:${C}"/>`;
  const kap = el('div', { className: 'result-ring' }, svg,
    el('div', { className: 'ring-label' }, el('strong', {}, etiket), alt ? el('span', {}, alt) : null));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    svg.querySelector('.ring-fill').style.strokeDashoffset = C * (1 - Math.max(0, Math.min(1, oran)));
  }));
  return kap;
}

// ============================================
// DERS OYNATICI
// ============================================
let oynatici = null;

function dersOynaticisi() {
  if (oynatici) return oynatici;

  const baslik = el('span', { className: 'lp-title' });
  const cubuklar = el('div', { className: 'lp-bars', 'aria-hidden': 'true' });
  const sahne = el('div', { className: 'lp-stage' });
  const geri = el('button', { type: 'button', className: 'button button-secondary', textContent: 'Geri' });
  const ileri = el('button', { type: 'button', className: 'button', textContent: 'Devam' });
  const kapat = el('button', { type: 'button', className: 'sheet-icon-button', 'aria-label': 'Dersi kapat' },
    svgIkon('<path d="m7 7 10 10M17 7 7 17"/>'));
  const panel = el('div', { className: 'lp-panel', tabIndex: -1 },
    el('div', { className: 'lp-top' }, el('div', { className: 'lp-row' }, baslik, kapat), cubuklar),
    sahne,
    el('div', { className: 'lp-foot' }, geri, ileri));
  const dlg = el('dialog', { className: 'lesson-player', 'aria-label': 'Ders' }, panel);
  document.body.appendChild(dlg);

  let ders = null, i = 0, cevaplar = {}, pushed = false, ignorePop = false;

  function kartlar() { return [...ders.kartlar, { tur: 'bitis' }]; }

  function cubuklariCiz() {
    const n = ders.kartlar.length;
    cubuklar.replaceChildren(...Array.from({ length: n }, (_, k) => el('span', { className: k < i || (k === i && kartlar()[i].tur !== 'soru') || cevaplar[k] !== undefined ? 'done' : '' })));
  }

  function kartCiz(k) {
    const kart = kartlar()[k];
    const c = el('div', { className: 'lp-card' });
    if (kart.tur === 'metin') {
      c.append(el('h2', {}, kart.baslik), el('p', {}, kart.metin));
    } else if (kart.tur === 'ornek') {
      c.append(el('span', { className: 'lp-kind' }, 'Örnek'), el('h2', {}, kart.baslik), el('div', { className: 'lp-example' }, kart.metin));
    } else if (kart.tur === 'soru') {
      const secenekler = el('div', { className: 'quiz-options', role: 'group' });
      const geriBildirim = el('div', { className: 'lp-feedback', 'aria-live': 'polite' }, el('div', {}));
      kart.secenekler.forEach((s, j) => {
        secenekler.appendChild(el('button', { type: 'button', className: 'quiz-option', onclick: () => cevapla(k, j) },
          el('span', { className: 'option-key' }, HARF[j]), el('span', {}, s)));
      });
      c.append(el('span', { className: 'lp-kind' }, 'Soru'), el('h2', {}, kart.soru), secenekler, geriBildirim);
      if (cevaplar[k] !== undefined) isaretle(c, kart, cevaplar[k]);
    } else if (kart.tur === 'ozet') {
      c.append(el('span', { className: 'lp-kind' }, 'Özet'), el('h2', {}, 'Bu derste öğrendiklerin'),
        el('ul', { className: 'lp-summary' }, ...kart.maddeler.map(m => el('li', {}, m))));
    } else {
      c.classList.add('lp-done');
      const sorular = ders.kartlar.map((x, n) => [x, n]).filter(([x]) => x.tur === 'soru');
      const dogru = sorular.filter(([x, n]) => cevaplar[n] === x.dogru).length;
      const sonraki = DERSLER[DERSLER.indexOf(ders) + 1];
      const kavramlar = typeof SOZLUK !== 'undefined' ? new Map(SOZLUK.map(t => [t.id, t.terim])) : new Map();
      c.append(
        halka(sorular.length ? dogru / sorular.length : 1, String(dogru), '/ ' + sorular.length),
        el('span', { className: 'lp-kind' }, 'Ders tamamlandı'),
        el('h2', {}, ders.baslik),
        el('p', {}, dogru === sorular.length ? 'Tüm soruları doğru cevapladın.' : 'Kaçırdığın soruları geri dönüp yeniden görebilirsin.'),
        el('div', { className: 'lp-links' },
          ...(ders.bag.kavramlar || []).filter(id => kavramlar.has(id)).map(id => el('a', { className: 'qa-chip', href: 'sozluk.html#' + id }, kavramlar.get(id))),
          ders.bag.arac ? el('a', { className: 'qa-chip', href: ders.bag.arac.href }, ders.bag.arac.ad + ' ›') : null,
          ders.bag.ders ? el('a', { className: 'qa-chip', href: ders.bag.ders.href }, ders.bag.ders.ad + ' ›') : null)
      );
      ileri.textContent = sonraki ? 'Sonraki ders: ' + sonraki.baslik : 'Karneme git';
      ileri.dataset.sonraki = sonraki ? sonraki.id : '';

      // Kaydet
      const ilerleme = dersIlerleme();
      const onceki = ilerleme[ders.id];
      ilerleme[ders.id] = { tamam: true, dogru: Math.max(dogru, onceki ? onceki.dogru : 0), toplam: sorular.length, tarih: gunAnahtari() };
      store.set(DERS_KEY, ilerleme);
      document.dispatchEvent(new CustomEvent('paktolos:ilerleme'));
    }
    return c;
  }

  function isaretle(c, kart, j) {
    [...c.querySelectorAll('.quiz-option')].forEach((b, k) => {
      b.disabled = true;
      if (k === kart.dogru) b.classList.add('correct');
      else if (k === j) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    const fb = c.querySelector('.lp-feedback');
    fb.firstChild.replaceChildren(el('p', {},
      el('strong', { className: j === kart.dogru ? 'ok' : 'no' }, j === kart.dogru ? 'Doğru.' : 'Doğru cevap: ' + HARF[kart.dogru]),
      kart.aciklama));
    fb.classList.add('open');
  }

  function cevapla(k, j) {
    if (cevaplar[k] !== undefined) return;
    cevaplar[k] = j;
    isaretle(sahne.firstChild, kartlar()[k], j);
    butonlar();
    cubuklariCiz();
    ileri.focus({ preventScroll: true });
  }

  function butonlar() {
    const kart = kartlar()[i];
    geri.hidden = i === 0 || kart.tur === 'bitis';
    if (kart.tur !== 'bitis') {
      ileri.textContent = i === ders.kartlar.length - 1 ? 'Dersi bitir' : 'Devam';
      delete ileri.dataset.sonraki;
    }
    ileri.disabled = kart.tur === 'soru' && cevaplar[i] === undefined;
  }

  function git(yeni, yon = 1) {
    if (yeni < 0 || yeni >= kartlar().length) return;
    const eski = sahne.firstChild;
    const goster = () => {
      i = yeni;
      const c = kartCiz(i);
      if (!prefersReducedMotion() && eski) {
        c.classList.add('entering');
        if (yon < 0) c.classList.add('back');
      }
      sahne.replaceChildren(c);
      sahne.scrollTop = 0;
      butonlar();
      cubuklariCiz();
      // Pasifleşen bir düğmede kalan odak sayfaya düşmesin
      if (!panel.contains(document.activeElement) || document.activeElement.disabled) panel.focus({ preventScroll: true });
      if (!prefersReducedMotion()) { void c.offsetWidth; c.classList.remove('entering', 'back'); }
    };
    if (eski && !prefersReducedMotion()) {
      eski.classList.add('leaving');
      if (yon < 0) eski.classList.add('back');
      setTimeout(goster, 220);
    } else goster();
  }

  function kapatDers({ gecmistenGeldi = false } = {}) {
    if (!dlg.open || dlg.classList.contains('closing')) return;
    if (!gecmistenGeldi) {
      if (pushed) { ignorePop = true; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search);
    }
    pushed = false;
    const bitir = () => { dlg.close(); dlg.classList.remove('closing'); document.documentElement.style.overflow = ''; };
    if (prefersReducedMotion()) { bitir(); return; }
    dlg.classList.add('closing');
    setTimeout(bitir, 300);
  }

  ileri.addEventListener('click', () => {
    if (ileri.dataset.sonraki !== undefined) {
      const sonraki = ileri.dataset.sonraki;
      if (sonraki) ac(sonraki, { gecmiseEkle: false, degistir: true });
      else location.href = 'karnem.html';
      return;
    }
    git(i + 1, 1);
  });
  geri.addEventListener('click', () => git(i - 1, -1));
  kapat.addEventListener('click', () => kapatDers());
  dlg.addEventListener('cancel', e => { e.preventDefault(); kapatDers(); });
  document.addEventListener('keydown', e => {
    if (!dlg.open || !ders || e.target.tagName === 'A' || e.metaKey || e.ctrlKey || e.altKey) return;
    const kart = kartlar()[i];
    if (kart.tur === 'soru' && '1234'.includes(e.key) && e.key !== '') { cevapla(i, Number(e.key) - 1); return; }
    if (e.key === 'ArrowRight' && !ileri.disabled && kart.tur !== 'bitis') git(i + 1, 1);
    if (e.key === 'ArrowLeft' && !geri.hidden) git(i - 1, -1);
  });
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    if (dlg.open && !DERSLER.some(d => '#' + d.id === location.hash)) kapatDers({ gecmistenGeldi: true });
  });

  function ac(id, { gecmiseEkle = true, degistir = false } = {}) {
    const yeni = DERSLER.find(d => d.id === id);
    if (!yeni) return;
    ders = yeni; cevaplar = {}; i = 0;
    baslik.textContent = ders.baslik;
    sahne.replaceChildren();
    if (degistir) history.replaceState({ ders: id }, '', '#' + id);
    if (!dlg.open) {
      dlg.classList.remove('closing');
      dlg.showModal();
      panel.focus();
      document.documentElement.style.overflow = 'hidden';
      if (gecmiseEkle) { history.pushState({ ders: id }, '', '#' + id); pushed = true; }
    }
    git(0);
  }

  oynatici = { ac };
  return oynatici;
}

// ============================================
// DERS LİSTESİ
// ============================================
function initDersler() {
  const kok = document.getElementById('tracks');
  if (!kok || typeof DERSLER === 'undefined') return;

  function ciz() {
    const ilerleme = dersIlerleme();
    const tamam = DERSLER.filter(d => ilerleme[d.id] && ilerleme[d.id].tamam).length;
    document.getElementById('school-count').textContent = tamam;
    document.getElementById('school-total').textContent = DERSLER.length;
    document.getElementById('school-fill').style.width = (tamam / DERSLER.length * 100) + '%';

    let sira = 0;
    kok.replaceChildren(...DERS_YOLLARI.map(yol => {
      const dersler = DERSLER.filter(d => d.yol === yol.id);
      return el('section', { className: 'track' },
        el('div', { className: 'track-head' }, el('h2', {}, yol.ad), el('p', {}, yol.aciklama)),
        el('div', { className: 'lesson-grid' }, ...dersler.map(d => {
          sira++;
          const durum = ilerleme[d.id];
          return el('button', { type: 'button', className: 'lesson-card', onclick: () => dersOynaticisi().ac(d.id) },
            el('span', { className: 'lesson-num' }, String(sira).padStart(2, '0')),
            el('h3', {}, d.baslik),
            el('p', {}, d.ozet),
            el('span', { className: 'lesson-meta' },
              el('span', {}, `${d.sure} dk · ${d.kartlar.length} kart`),
              durum && durum.tamam
                ? el('span', { className: 'lesson-state done' }, svgIkon(ONAY_IKON), `${durum.dogru}/${durum.toplam}`)
                : el('span', { className: 'lesson-state' }, 'Başla')));
        })));
    }));
  }

  document.addEventListener('paktolos:ilerleme', ciz);
  ciz();

  // dersler.html#faiz: sayfa açılırken ya da aramadan gelindiğinde ilgili ders açılır
  const hashtenAc = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const dlg = document.querySelector('.lesson-player');
    if (DERSLER.some(d => d.id === id) && !(dlg && dlg.open)) dersOynaticisi().ac(id, { gecmiseEkle: false });
  };
  window.addEventListener('hashchange', hashtenAc);
  hashtenAc();
}

// ============================================
// GÜNÜN SORUSU
// ============================================
function gunlukHavuz() {
  const havuz = [];
  if (typeof DERSLER !== 'undefined') {
    DERSLER.forEach(d => d.kartlar.filter(k => k.tur === 'soru').forEach(k => havuz.push({ ...k, kaynak: { ad: d.baslik, href: 'dersler.html#' + d.id } })));
  }
  if (typeof SORULAR !== 'undefined') {
    SORULAR.forEach(q => havuz.push({ soru: q.soru, durum: q.durum, veri: q.veri, secenekler: q.secenekler, dogru: q.dogru, aciklama: q.aciklama, kaynak: q.ders }));
  }
  return havuz;
}

function gunlukDurum() {
  const d = store.get(GUNLUK_KEY, { seri: 0, son: null, gecmis: {} });
  // Dün de cevaplanmadıysa seri kopmuştur
  if (d.son && d.son !== gunAnahtari() && d.son !== gunEkle(-1)) d.seri = 0;
  return d;
}

function initGununSorusu() {
  const kok = document.getElementById('daily-question');
  if (!kok) return;
  const havuz = gunlukHavuz();
  if (!havuz.length) return;

  const now = new Date();
  const gunNo = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const q = havuz[(gunNo * 7) % havuz.length];
  const bugun = gunAnahtari();

  function ciz() {
    const durum = gunlukDurum();
    const cevap = durum.gecmis[bugun];
    const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const hafta = Array.from({ length: 7 }, (_, k) => {
      const t = new Date(); t.setDate(t.getDate() - (6 - k));
      const anahtar = gunAnahtari(t);
      return el('span', { className: (durum.gecmis[anahtar] !== undefined ? 'on' : '') + (k === 6 ? ' today' : ''), title: anahtar },
        gunler[(t.getDay() + 6) % 7]);
    });

    const secenekler = el('div', { className: 'quiz-options' }, ...q.secenekler.map((s, j) =>
      el('button', { type: 'button', className: 'quiz-option', onclick: () => cevapla(j) },
        el('span', { className: 'option-key' }, HARF[j]), el('span', {}, s))));

    const alev = svgIkon('<path d="M12 2.5c.4 3-1.8 4.6-3.3 6.4C7.3 10.6 6.5 12.4 6.5 14.5a5.5 5.5 0 0 0 11 0c0-2.6-1.4-4.4-2.6-5.7-.2 1.4-.8 2.4-1.8 3 .3-3.2-.3-6.4-1.1-9.3z"/>');
    kok.replaceChildren(...[
      el('div', { className: 'dq-head' },
        el('span', { className: 'daily-label' }, 'Günün sorusu'),
        el('span', { className: 'dq-streak', title: 'Üst üste cevapladığın gün sayısı' }, alev, durum.seri + ' gün')),
      q.durum ? el('p', { className: 'quiz-situation' }, q.durum) : null,
      q.veri ? el('dl', { className: 'quiz-data' }, ...q.veri.map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v)))) : null,
      el('h3', { className: 'quiz-question' }, q.soru),
      secenekler,
      el('div', { className: 'lp-feedback' + (cevap !== undefined ? ' open' : ''), 'aria-live': 'polite' }, el('div', {},
        cevap !== undefined ? el('p', {},
          el('strong', { className: cevap === q.dogru ? 'ok' : 'no' }, cevap === q.dogru ? 'Doğru. Yarın yeni bir soru seni bekliyor.' : 'Doğru cevap: ' + HARF[q.dogru]),
          q.aciklama, ' ', q.kaynak ? el('a', { className: 'link-more', href: q.kaynak.href }, q.kaynak.ad) : null) : '')),
      el('div', { className: 'dq-week', 'aria-label': 'Son 7 gün' }, ...hafta)
    ].filter(Boolean));
    if (cevap !== undefined) {
      [...secenekler.children].forEach((b, k) => {
        b.disabled = true;
        b.classList.add(k === q.dogru ? 'correct' : k === cevap ? 'wrong' : 'dim');
      });
    }
  }

  function cevapla(j) {
    const durum = gunlukDurum();
    if (durum.gecmis[bugun] !== undefined) return;
    durum.gecmis[bugun] = j;
    durum.seri = durum.son === gunEkle(-1) ? durum.seri + 1 : 1;
    durum.son = bugun;
    // Geçmişte yalnızca son 60 gün tutulur
    const sinir = gunEkle(-60);
    Object.keys(durum.gecmis).forEach(k => { if (k < sinir) delete durum.gecmis[k]; });
    store.set(GUNLUK_KEY, durum);
    ciz();
    document.dispatchEvent(new CustomEvent('paktolos:ilerleme'));
  }

  ciz();
}

// ============================================
// KARNEM
// ============================================
const ROZETLER = [
  { id: 'ilk-ders', ad: 'İlk adım', aciklama: 'İlk dersini bitir', ikon: '<path d="M8 20c0-4 1.5-7 4-9"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 11C12 8 10 6 6.5 6c0 3 2 5 5.5 5z"/>',
    kosul: s => s.ders >= 1 },
  { id: 'yari-yol', ad: 'Yarı yol', aciklama: 'Üç ders bitir', ikon: '<path d="M4 19h16"/><path d="M6 19V9l6-5 6 5v10"/><path d="M10 19v-5h4v5"/>',
    kosul: s => s.ders >= 3 },
  { id: 'mezun', ad: 'Paktolos mezunu', aciklama: 'Tüm dersleri bitir', ikon: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11"/><path d="M21.5 9v5"/>',
    kosul: s => s.ders >= s.dersToplam },
  { id: 'kasif', ad: 'Sözlük kâşifi', aciklama: '20 kavram keşfet', ikon: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    kosul: s => s.kavram >= 20 },
  { id: 'ayakli-sozluk', ad: 'Ayaklı sözlük', aciklama: 'Tüm kavramları keşfet', ikon: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V19"/>',
    kosul: s => s.kavramToplam && s.kavram >= s.kavramToplam },
  { id: 'merakli', ad: 'Meraklı', aciklama: '10 soru oku', ikon: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M10 10a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2"/><path d="M12 15h.01"/>',
    kosul: s => s.soru >= 10 },
  { id: 'oran-ustasi', ad: 'Oran ustası', aciklama: 'Testte 8 ya da üzeri yap', ikon: '<path d="M4 19.5h16"/><path d="M5 15.5l4-4 3 3 6.5-7"/><path d="M14.5 7.5h4v4"/>',
    kosul: s => s.test >= 8 },
  { id: 'sirket-doktoru', ad: 'Şirket doktoru', aciklama: 'Laboratuvardaki 7 senaryoyu dene', ikon: '<path d="M9.5 3.5h5M10.5 3.5v5.2L5.3 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.7-2.9l-5.2-8.9V3.5"/><path d="M7.8 14h8.4"/>',
    kosul: s => s.lab >= 7 },
  { id: 'rontgen', ad: 'Röntgen', aciklama: 'Kendi finansal check-up\'ını yap', ikon: '<path d="M3.5 12h4l2-5 4 10 2-5h5"/>',
    kosul: s => s.checkup },
  { id: 'hafta', ad: 'Bir hafta', aciklama: '7 gün üst üste günün sorusu', ikon: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>',
    kosul: s => s.enUzunSeri >= 7 },
  { id: 'aliskanlik', ad: 'Alışkanlık', aciklama: '30 gün üst üste günün sorusu', ikon: '<path d="M12 2.5c.4 3-1.8 4.6-3.3 6.4C7.3 10.6 6.5 12.4 6.5 14.5a5.5 5.5 0 0 0 11 0c0-2.6-1.4-4.4-2.6-5.7-.2 1.4-.8 2.4-1.8 3 .3-3.2-.3-6.4-1.1-9.3z"/>',
    kosul: s => s.enUzunSeri >= 30 }
];

function karneOzeti() {
  const ilerleme = dersIlerleme();
  const gunluk = gunlukDurum();
  const kayitli = store.get(GUNLUK_KEY, {});
  const ozet = {
    ders: typeof DERSLER !== 'undefined' ? DERSLER.filter(d => ilerleme[d.id] && ilerleme[d.id].tamam).length : 0,
    dersToplam: typeof DERSLER !== 'undefined' ? DERSLER.length : 0,
    kavram: store.get('paktolos-okunan', []).length,
    kavramToplam: typeof SOZLUK !== 'undefined' ? SOZLUK.length : 0,
    soru: store.get('paktolos-sorular', []).length,
    soruToplam: typeof SORULAR_KUTUPHANE !== 'undefined' ? SORULAR_KUTUPHANE.length : 0,
    test: store.get('paktolos-test-en-iyi', 0) || 0,
    lab: store.get('paktolos-lab', []).length,
    checkup: !!store.get('paktolos-checkup', null),
    seri: gunluk.seri,
    enUzunSeri: Math.max(kayitli.enUzun || 0, gunluk.seri)
  };
  // En uzun seriyi sakla
  if (ozet.enUzunSeri > (kayitli.enUzun || 0)) store.set(GUNLUK_KEY, { ...kayitli, enUzun: ozet.enUzunSeri });
  return ozet;
}

function initKarnem() {
  const kok = document.getElementById('report');
  if (!kok) return;

  function ciz() {
    const s = karneOzeti();
    const oranlar = [
      s.dersToplam ? s.ders / s.dersToplam : 0,
      s.kavramToplam ? Math.min(1, s.kavram / s.kavramToplam) : 0,
      s.soruToplam ? Math.min(1, s.soru / s.soruToplam) : 0,
      s.test / 10
    ];
    const genel = oranlar.reduce((a, b) => a + b, 0) / oranlar.length;

    const kutu = (href, ad, deger, toplam) => el('a', { className: 'report-tile', href },
      el('dl', {}, el('dt', {}, ad), el('dd', {}, String(deger), toplam ? el('small', {}, ' / ' + toplam) : null)));

    kok.replaceChildren(
      halka(genel, '%' + Math.round(genel * 100), ''),
      el('div', { className: 'report-tiles' },
        kutu('dersler.html', 'Dersler', s.ders, s.dersToplam),
        kutu('sozluk.html', 'Keşfedilen kavram', s.kavram, s.kavramToplam),
        kutu('sorular.html', 'Okunan soru', s.soru, s.soruToplam),
        kutu('test.html', 'Test en iyi skor', s.test, 10))
    );

    // Sıradaki adım
    const ilerleme = dersIlerleme();
    const siradaki = DERSLER.find(d => !(ilerleme[d.id] && ilerleme[d.id].tamam));
    const adim = document.getElementById('next-step');
    adim.replaceChildren(...(siradaki
      ? [el('div', {}, el('span', { className: 'eyebrow' }, 'Sıradaki adım'), el('h3', {}, siradaki.baslik), el('p', {}, siradaki.ozet)),
         el('span', { className: 'button' }, 'Derse başla')]
      : s.test < 8
        ? [el('div', {}, el('span', { className: 'eyebrow' }, 'Sıradaki adım'), el('h3', {}, 'Kendini sına'), el('p', {}, 'Tüm dersleri bitirdin. Şimdi oranları yorumlayabildiğini göster.')),
           el('span', { className: 'button' }, 'Teste başla')]
        : [el('div', {}, el('span', { className: 'eyebrow' }, 'Tebrikler'), el('h3', {}, 'Paktolos mezunusun.'), el('p', {}, 'Öğrendiklerini araç kutusunda kendi rakamlarınla dene.')),
           el('span', { className: 'button' }, 'Araç kutusu')]));
    adim.href = siradaki ? 'dersler.html#' + siradaki.id : s.test < 8 ? 'test.html' : 'araclar.html';

    // Rozetler
    document.getElementById('badges').replaceChildren(...ROZETLER.map(r => {
      const acik = !!r.kosul(s);
      return el('div', { className: 'badge-item' + (acik ? ' on' : ''), title: acik ? 'Kazanıldı' : 'Henüz kazanılmadı' },
        el('span', { className: 'badge-medal' }, svgIkon(acik ? r.ikon : '<rect x="6" y="10.5" width="12" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>')),
        el('strong', {}, r.ad), el('span', {}, r.aciklama));
    }));
  }

  document.getElementById('reset-progress').addEventListener('click', () => {
    if (!confirm('Tüm ilerlemen (dersler, okunan kavram ve sorular, test skoru, günlük seri, laboratuvar ve check-up kayıtları) bu cihazdan silinecek. Emin misin?')) return;
    ['paktolos-dersler', 'paktolos-okunan', 'paktolos-sorular', 'paktolos-test-en-iyi', 'paktolos-gunluk', 'paktolos-lab', 'paktolos-checkup']
      .forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* yok say */ } });
    ciz();
    initGununSorusu();
    showToast('İlerleme sıfırlandı');
  });

  document.addEventListener('paktolos:ilerleme', ciz);
  ciz();
}

initDersler();
initGununSorusu();
initKarnem();
