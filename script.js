// Ana sayfa demosu: metriğe dokununca açıklamayı aç/kapat
function toggleExplain(id) {
  const el = document.getElementById('explain-' + id);
  el.classList.toggle('open');
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
}

// Şirketler sayfası: arama ve sektör filtresi
function initCompanyList() {
  const list = document.getElementById('company-list');
  if (!list) return;

  const search = document.getElementById('search');
  const filters = document.getElementById('filters');
  const empty = document.getElementById('empty');
  let activeSector = null;

  const sectors = [...new Set(SIRKETLER.map(s => s.sektor))].sort((a, b) => a.localeCompare(b, 'tr'));
  ['Tümü', ...sectors].forEach((name, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (i === 0 ? ' active' : '');
    chip.textContent = name;
    chip.addEventListener('click', () => {
      filters.querySelector('.active').classList.remove('active');
      chip.classList.add('active');
      activeSector = i === 0 ? null : name;
      render();
    });
    filters.appendChild(chip);
  });

  function render() {
    const q = search.value.trim().toLocaleLowerCase('tr');
    const matches = SIRKETLER.filter(s =>
      (!activeSector || s.sektor === activeSector) &&
      (s.kod.toLocaleLowerCase('tr').includes(q) || s.ad.toLocaleLowerCase('tr').includes(q))
    );

    list.replaceChildren(...matches.map(s => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'company-row';
      a.href = 'sirket.html?kod=' + encodeURIComponent(s.kod);

      const info = document.createElement('div');
      const code = document.createElement('div');
      code.className = 'company-code';
      code.textContent = s.kod;
      const name = document.createElement('div');
      name.className = 'company-name';
      name.textContent = s.ad;
      info.append(code, name);

      const price = document.createElement('div');
      price.className = 'company-price';
      price.textContent = '—';

      a.append(info, price);
      li.appendChild(a);
      return li;
    }));

    empty.hidden = matches.length > 0;
  }

  search.addEventListener('input', render);
  render();
}

// Şirket detay sayfası: ?kod=THYAO
function initCompanyDetail() {
  const codeEl = document.getElementById('company-code');
  if (!codeEl) return;

  const kod = (new URLSearchParams(location.search).get('kod') || '').toUpperCase();
  const sirket = SIRKETLER.find(s => s.kod === kod);

  if (!sirket) {
    codeEl.textContent = kod || '—';
    document.getElementById('company-name').textContent = 'Bu şirket listede bulunamadı.';
    return;
  }

  document.title = sirket.kod + ' — Paktolos';
  codeEl.textContent = sirket.kod;
  document.getElementById('company-name').textContent = sirket.ad;
  document.getElementById('company-sector').textContent = sirket.sektor;

  const notes = SEKTOR_NOTLARI[sirket.sektor] || SEKTOR_NOTLARI.VARSAYILAN;
  document.getElementById('company-notes').replaceChildren(...notes.map(text => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
}

initSplash();
initCompanyList();
initCompanyDetail();
