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

initSplash();
initNav();
initReveal();
initCalculator();
