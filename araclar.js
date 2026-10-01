// Araç kutusu: hesaplayıcılar
// script.js'teki el(), parseTr(), formatTL() ile grafik.js'teki grafik(), sayiYaz(),
// tabloGorunumu() kullanılır; grafik.js bu dosyadan önce yüklenmelidir.

// ============================================
// ORTAK: SAYI ALANI (kaydırıcı + yazılabilir kutu)
// ============================================

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

function sozlukLink(id, metin) {
  return el('a', { className: 'kavram-baglanti', href: 'kavram/' + id + '.html' }, metin);
}

// Seri renkleri grafik.js'teki SERI'den: [0] temel tutar (mavi), [1] faiz, maliyet ya da ek (kiremit)

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
        { ad: 'Anapara', renk: SERI[0], degerler: kovalar.map(k => toplamla(k, 'a')) },
        { ad: 'Faiz', renk: SERI[1], degerler: kovalar.map(k => toplamla(k, 'f')) }
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
        { ad: 'Yalnızca asgari', renk: SERI[1], degerler: dolgu(a.bakiyeler) },
        { ad: `Her ay ${sabitMetin}` + (s.bitmez ? ' (bitmez)' : ''), renk: SERI[0], degerler: s.bitmez ? a.bakiyeler.map(() => null) : dolgu(s.bakiyeler) }
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
        { ad: 'Yatırdığın', renk: SERI[0], degerler: yillar.map(v => v.yatirilan) },
        { ad: 'Getiri', renk: SERI[1], degerler: yillar.map(v => v.getiri) }
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
// 5. BİLEŞİK BÜYÜME
// ============================================
function bilesikAraci(kok) {
  const baslangic = sayiAlani('Başlangıç tutarı', { min: 0, max: 5000000, step: 5000, value: 100000, birim: 'TL' });
  const katki = sayiAlani('Aylık katkı', { min: 0, max: 200000, step: 500, value: 5000, birim: 'TL' });
  const getiri = sayiAlani('Yıllık getiri', { min: 0, max: 80, step: 1, value: 30, birim: '%' });
  const sure = sayiAlani('Süre', { min: 1, max: 40, step: 1, value: 10, birim: 'yıl' });
  const alanlar = [baslangic, katki, getiri, sure];
  const sonuc = aracIskeleti(kok, alanlar,
    'Getiri garanti değildir. Hesap her yıl aynı getiri varsayımıyla yapılır; katkı ay sonunda eklenir. Vergi, masraf ve enflasyon dahil değildir.');
  const grafikKap = el('div');

  function hesapla() {
    const PV = baslangic.get(), C = katki.get(), g = getiri.get() / 100, y = Math.max(1, Math.round(sure.get()));
    const i = Math.pow(1 + g, 1 / 12) - 1;
    const bakiye = ay => PV * Math.pow(1 + i, ay) + (i === 0 ? C * ay : C * (Math.pow(1 + i, ay) - 1) / i);
    const yillar = Array.from({ length: y }, (_, k) => {
      const ay = 12 * (k + 1), toplam = bakiye(ay), yatirilan = PV + C * ay;
      return { toplam, yatirilan, getiri: Math.max(0, toplam - yatirilan) };
    });
    const son = yillar[y - 1];
    // Toplam getirinin yarısı hangi yıldan sonra oluşuyor?
    const yariYil = yillar.findIndex(v => v.getiri >= son.getiri / 2) + 1;
    const katsayi = son.yatirilan > 0 ? son.toplam / son.yatirilan : 0;

    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, formatTL(son.toplam)),
      el('p', { className: 'hero-caption' }, `${y} yıl sonra birikimin`),
      statSatiri([
        ['Toplam yatırdığın', formatTL(son.yatirilan)],
        ['Getiriden gelen', formatTL(son.getiri)],
        ['Yatırdığının katı', sayiYaz(katsayi, 1) + ' kat']
      ]),
      grafikKap,
      icgoru(
        son.getiri > 0 && y > 1
          ? el('span', {}, 'Toplam getirinin yarısı son ', el('b', {}, (y - yariYil + 1) + ' yılda'), ' oluşuyor. Bileşik büyüme zamana ihtiyaç duyar: en büyük artış en sonda gelir. ')
          : el('span', {}, 'Getiri sıfırken birikim yalnızca yatırdığın kadar büyür. '),
        'Bu rakam nominaldir; aynı sürede fiyatlar da artar. ', sozlukLink('reel-getiri', 'Reel getiri nedir? ›')),
      tabloGorunumu(['Yıl', 'Yatırdığın', 'Getiri', 'Toplam'],
        yillar.map((v, k) => [k + 1, formatTL(v.yatirilan), formatTL(v.getiri), formatTL(v.toplam)]))
    );
    grafik(grafikKap, {
      tur: 'yigin',
      etiketler: yillar.map((_, k) => (k + 1) + '. yıl'),
      seriler: [
        { ad: 'Yatırdığın', renk: SERI[0], degerler: yillar.map(v => v.yatirilan) },
        { ad: 'Getiri', renk: SERI[1], degerler: yillar.map(v => v.getiri) }
      ],
      bicim: formatTL,
      ipucuBaslik: k => `${k + 1}. yıl sonunda`,
      baglam: k => 'Getirinin toplamdaki payı: %' + sayiYaz(yillar[k].toplam > 0 ? yillar[k].getiri / yillar[k].toplam * 100 : 0),
      aciklama: 'Yıllara göre birikim: yatırdığın ve getiri'
    });
  }
  alanlar.forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
// 6. ENFLASYON VE ALIM GÜCÜ
// ============================================
function enflasyonAraci(kok) {
  const tutar = sayiAlani('Bugünkü tutar', { min: 1000, max: 10000000, step: 1000, value: 100000, birim: 'TL' });
  const oran = sayiAlani('Yıllık enflasyon', { min: 1, max: 100, step: 1, value: 40, birim: '%' });
  const sure = sayiAlani('Süre', { min: 1, max: 30, step: 1, value: 5, birim: 'yıl' });
  const alanlar = [tutar, oran, sure];
  const sonuc = aracIskeleti(kok, alanlar,
    'Hesap her yıl aynı enflasyon varsayımıyla yapılır. Gerçek enflasyon yıldan yıla değişir; kişisel enflasyonun da resmî orandan farklı olabilir.');
  const grafikKap = el('div');

  function hesapla() {
    const T = tutar.get(), e = oran.get() / 100, y = Math.max(1, Math.round(sure.get()));
    const guc = Array.from({ length: y + 1 }, (_, k) => T / Math.pow(1 + e, k));
    const kayip = (1 - guc[y] / T) * 100;
    const gereken = T * Math.pow(1 + e, y);
    const yarilanma = Math.log(2) / Math.log(1 + e);

    sonuc.replaceChildren(
      el('div', { className: 'hero-figure' }, formatTL(guc[y])),
      el('p', { className: 'hero-caption' }, `${y} yıl sonra ${formatTL(T)} ile bugünkü fiyatlarla alabileceğin`),
      statSatiri([
        ['Alım gücü kaybı', '%' + sayiYaz(kayip)],
        ['Aynı alım gücü için gereken', formatTL(gereken)],
        ['Fiyatlar', sayiYaz(Math.pow(1 + e, y), 1) + ' katına çıkar']
      ]),
      grafikKap,
      icgoru(
        'Yıllık ', el('b', {}, '%' + sayiYaz(e * 100)), ' enflasyonda paranın alım gücü yaklaşık ', el('b', {}, sayiYaz(yarilanma, 1) + ' yılda'), ' yarıya iner. ',
        'Kenarda bekleyen para rakam olarak değişmez, ama her yıl daha az şey alır. ', sozlukLink('enflasyon', 'Enflasyon nedir? ›')),
      tabloGorunumu(['Yıl', 'Alım gücü', 'Gereken tutar'],
        guc.map((v, k) => [k, formatTL(v), formatTL(T * Math.pow(1 + e, k))]))
    );
    grafik(grafikKap, {
      tur: 'cizgi',
      etiketler: guc.map((_, k) => k === 0 ? 'Bugün' : k + '. yıl'),
      seriler: [{ ad: 'Alım gücü', renk: SERI[0], degerler: guc }],
      bicim: formatTL,
      baglam: k => k === 0 ? 'Başlangıç' : 'Bugüne göre kayıp: %' + sayiYaz((1 - guc[k] / T) * 100),
      aciklama: 'Yıllara göre alım gücü'
    });
  }
  alanlar.forEach(x => x.on(hesapla));
  hesapla();
}

// ============================================
// 7. ERKEN BAŞLAMAK
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
        { ad: 'Ayşe · 25–35 arası', renk: SERI[0], degerler: ayse },
        { ad: 'Ali · 35–65 arası', renk: SERI[1], degerler: ali }
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
const ARACLAR = { kredi: krediAraci, asgari: asgariAraci, taksit: taksitAraci, hedef: hedefAraci, bilesik: bilesikAraci, enflasyon: enflasyonAraci, erken: erkenAraci };
document.querySelectorAll('[data-tool]').forEach(kok => {
  ARACLAR[kok.dataset.tool](kok);
  // Ölçüm: aracın kullanıldığı bilgisi (girilen rakam değil), sayfa başına bir kez
  kok.addEventListener('input', () => olc('arac_kullanildi', { arac: kok.dataset.tool }), { once: true });
});
