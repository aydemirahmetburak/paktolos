// Finansal check-up: altı rakamla bütçe, birikim ve borç görünümü.
// Eşikler genel kabul görmüş kurallardır; kişisel duruma göre değişebilir.
// araclar.js'teki sayiAlani(), script.js'teki el(), store kullanılır.

(function () {
  const kok = document.getElementById('checkup');
  if (!kok) return;

  const KEY = 'paktolos-checkup';
  const kayit = store.get(KEY, {});
  const tl = n => (n < 0 ? '−' : '') + sayiYaz(Math.abs(Math.round(n))) + ' TL';

  const A = {
    gelir: sayiAlani('Aylık net gelir', { min: 5000, max: 300000, step: 1000, value: kayit.gelir ?? 40000, birim: 'TL' }),
    zorunlu: sayiAlani('Zorunlu giderler (kira, fatura, market)', { min: 0, max: 200000, step: 500, value: kayit.zorunlu ?? 22000, birim: 'TL' }),
    birikim: sayiAlani('Her ay biriktirdiğin', { min: 0, max: 100000, step: 500, value: kayit.birikim ?? 4000, birim: 'TL' }),
    fon: sayiAlani('Acil durum için kenardaki para', { min: 0, max: 1000000, step: 1000, value: kayit.fon ?? 30000, birim: 'TL' }),
    taksit: sayiAlani('Aylık kredi taksitleri', { min: 0, max: 150000, step: 500, value: kayit.taksit ?? 5000, birim: 'TL' }),
    kart: sayiAlani('Kredi kartı borcu (dönem borcu)', { min: 0, max: 500000, step: 1000, value: kayit.kart ?? 15000, birim: 'TL' })
  };

  const girisler = el('div', { className: 'tool-inputs' }, ...Object.values(A).map(a => a.node),
    el('p', { className: 'tool-note' }, 'Rakamların yalnızca bu cihazda tutulur; hiçbir yere gönderilmez. Eşikler genel kurallardır ve herkesin durumuna birebir uymayabilir; bir yönlendirme olarak düşün.'));
  const sonuc = el('div', { className: 'tool-results checkup-results', 'aria-live': 'polite' });
  kok.replaceChildren(girisler, sonuc);

  const DURUM = {
    iyi: { ad: 'Güçlü', ikon: '<path d="m6 12.5 4 4 8-9"/>' },
    orta: { ad: 'Geliştirilebilir', ikon: '<circle cx="12" cy="12" r="3.5"/>' },
    dikkat: { ad: 'Dikkat', ikon: '<path d="M12 7v6"/><path d="M12 17h.01"/>' }
  };

  function durumEtiketi(durum, baglam) {
    const d = DURUM[durum];
    const svg = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    svg.innerHTML = d.ikon;
    return el('span', { className: 'status-pill', dataset: { durum }, title: baglam ? baglam + ': ' + d.ad : d.ad }, svg, d.ad);
  }

  function gosterge({ ad, deger, degerMetin, durum, bolgeler, olcekMaks, aciklama, linkler }) {
    const konum = Math.max(0, Math.min(100, deger / olcekMaks * 100));
    const d = DURUM[durum];
    return el('div', { className: 'meter', dataset: { durum } },
      el('div', { className: 'meter-head' },
        el('span', { className: 'meter-name' }, ad),
        durumEtiketi(durum)),
      el('div', { className: 'meter-value' }, degerMetin),
      el('div', { className: 'meter-track', role: 'img', 'aria-label': `${ad}: ${degerMetin}, ${d.ad}` },
        ...bolgeler.map(([bas, bit, etiket]) => el('span', { className: 'meter-zone', style: `left:${bas / olcekMaks * 100}%;width:${(bit - bas) / olcekMaks * 100}%`, title: etiket })),
        el('span', { className: 'meter-mark', style: `left:${konum}%` })),
      el('p', { className: 'meter-note' }, ...[].concat(aciklama)),
      el('div', { className: 'meter-links' }, ...linkler.map(([metin, href]) => el('a', { className: 'qa-chip', href }, metin))));
  }

  function hesapla() {
    const v = Object.fromEntries(Object.entries(A).map(([k, a]) => [k, a.get()]));
    store.set(KEY, v);

    const serbest = v.gelir - v.zorunlu - v.taksit - v.birikim;           // ay sonunda kalan
    const odemeGucu = v.gelir - v.zorunlu - v.taksit;                      // borç kapatmaya ayrılabilecek en fazla
    const birikimOrani = v.gelir > 0 ? v.birikim / v.gelir * 100 : 0;
    const fonAy = v.zorunlu > 0 ? v.fon / v.zorunlu : (v.fon > 0 ? 12 : 0);
    const borcYuku = v.gelir > 0 ? v.taksit / v.gelir * 100 : 0;
    const kartAy = v.kart <= 0 ? 0 : odemeGucu > 0 ? v.kart / odemeGucu : Infinity;

    const g = {
      denge: { durum: serbest < 0 ? 'dikkat' : serbest < v.gelir * 0.05 ? 'orta' : 'iyi' },
      fon: { durum: fonAy >= 3 ? 'iyi' : fonAy >= 1 ? 'orta' : 'dikkat' },
      kart: { durum: kartAy === 0 || kartAy <= 1 ? 'iyi' : kartAy <= 6 ? 'orta' : 'dikkat' },
      borc: { durum: borcYuku < 20 ? 'iyi' : borcYuku <= 35 ? 'orta' : 'dikkat' },
      birikim: { durum: birikimOrani >= 20 ? 'iyi' : birikimOrani >= 10 ? 'orta' : 'dikkat' }
    };
    const ADLAR = { denge: 'aylık bütçe dengesi', fon: 'acil durum fonu', kart: 'kredi kartı borcu', borc: 'borç yükü', birikim: 'birikim oranı' };
    const oncelik = ['denge', 'fon', 'kart', 'borc', 'birikim'];
    const ilkDikkat = oncelik.find(k => g[k].durum === 'dikkat') || oncelik.find(k => g[k].durum === 'orta');
    const gucluler = oncelik.filter(k => g[k].durum === 'iyi');
    const iyiSayisi = gucluler.length;

    // Paranın aylık dağılımı
    const dilimler = [
      ['Zorunlu giderler', v.zorunlu, 'var(--bal-4)'],
      ['Kredi taksitleri', v.taksit, 'var(--bal-6)'],
      ['Birikim', v.birikim, 'var(--bal-2)'],
      ['Diğer harcamalar için kalan', Math.max(0, serbest), 'var(--bal-7)']
    ];
    const payda = Math.max(v.gelir, v.zorunlu + v.taksit + v.birikim);

    const ozet = el('div', { className: 'checkup-summary' },
      halkaMini(iyiSayisi, 5),
      el('div', {},
        el('span', { className: 'eyebrow' }, 'Röntgen sonucu'),
        el('h3', {}, iyiSayisi === 5 ? 'Temellerin sağlam.' : iyiSayisi >= 3 ? 'İyi bir yoldasın.' : 'Önce temelleri güçlendir.'),
        el('p', {},
          gucluler.length ? el('span', {}, 'Güçlü yanın: ', el('b', {}, gucluler.map(k => ADLAR[k]).join(', ')), '. ') : '',
          ilkDikkat ? el('span', {}, 'İlk odak: ', el('b', {}, ADLAR[ilkDikkat]), '.') : 'Beş göstergenin hepsi genel kuralların üzerinde.')));

    const dagilim = el('div', { className: 'flow' },
      el('div', { className: 'flow-head' }, el('span', { className: 'meter-name' }, 'Gelirin nereye gidiyor?'), durumEtiketi(g.denge.durum, 'Aylık bütçe dengesi')),
      el('div', { className: 'flow-bar', role: 'img', 'aria-label': 'Aylık gelirin dağılımı' },
        ...dilimler.filter(d => d[1] > 0).map(([ad, t, renk]) => el('span', { style: `width:${t / payda * 100}%;background:${renk}`, title: `${ad}: ${tl(t)}` }))),
      el('p', { className: 'flow-sum' }, 'Aylık net gelir ', el('b', {}, tl(v.gelir)), serbest >= 0 ? el('span', {}, ' · ay sonunda kalan ', el('b', {}, tl(serbest))) : ''),
      el('ul', { className: 'flow-legend' }, ...dilimler.map(([ad, t, renk]) =>
        el('li', {}, el('i', { className: 'key-rect', style: `background:${renk}` }), el('span', {}, ad), el('b', {}, tl(t), el('small', {}, ' · %' + sayiYaz(v.gelir > 0 ? t / v.gelir * 100 : 0, 0)))))),
      serbest < 0 ? el('p', { className: 'lab-warn' }, 'Harcamalar gelirden ', tl(-serbest), ' fazla: fark birikimden, kart borcundan ya da yeni borçtan karşılanıyor olabilir.') : null);

    sonuc.replaceChildren(ozet, dagilim, el('div', { className: 'meters' },
      gosterge({ ad: 'Acil durum fonu', deger: fonAy, degerMetin: sayiYaz(fonAy, fonAy < 10 ? 1 : 0) + ' aylık gider', durum: g.fon.durum, olcekMaks: 8,
        bolgeler: [[0, 1, 'Dikkat'], [1, 3, 'Geliştirilebilir'], [3, 8, 'Güçlü']],
        aciklama: ['Kenardaki para, zorunlu giderlerini kaç ay karşılar? Genellikle ', el('b', {}, '3 ila 6 ay'), ' önerilir.'],
        linkler: [['Bütçe ve acil durum fonu dersi', 'dersler.html#butce'], ['Fonu nerede tutmalı?', 'sorular.html#acil-fon-nerede']] }),
      gosterge({ ad: 'Kredi kartı borcu', deger: Math.min(kartAy, 12), degerMetin: v.kart <= 0 ? 'Borç yok' : kartAy === Infinity ? 'Kapatılamıyor' : sayiYaz(kartAy, 1) + ' ayda kapanabilir', durum: g.kart.durum, olcekMaks: 12,
        bolgeler: [[0, 1, 'Güçlü'], [1, 6, 'Geliştirilebilir'], [6, 12, 'Dikkat']],
        aciklama: ['Zorunlu giderler ve taksitlerden sonra kalan parayla (', el('b', {}, tl(Math.max(0, odemeGucu))), ') kart borcunu kaç ayda kapatabilirsin? Faiz hariç, en iyimser hesap.'],
        linkler: [['Asgari ödeme simülatörü', 'araclar.html#asgari'], ['Kart borcu nasıl kapatılır?', 'sorular.html#kart-borcu']] }),
      gosterge({ ad: 'Borç yükü', deger: Math.min(borcYuku, 60), degerMetin: '%' + sayiYaz(borcYuku, 0) + ' gelirin', durum: g.borc.durum, olcekMaks: 60,
        bolgeler: [[0, 20, 'Güçlü'], [20, 35, 'Geliştirilebilir'], [35, 60, 'Dikkat']],
        aciklama: ['Kredi taksitlerinin net gelire oranı. Birçok kaynak, taksitlerin gelirin ', el('b', {}, 'yaklaşık üçte birini'), ' aşmamasını önerir.'],
        linkler: [['Kredi çekmeli miyim?', 'sorular.html#kredi-cekmeli-mi'], ['Kredi hesaplayıcı', 'araclar.html#kredi']] }),
      gosterge({ ad: 'Birikim oranı', deger: Math.min(birikimOrani, 40), degerMetin: '%' + sayiYaz(birikimOrani, 0) + ' gelirin', durum: g.birikim.durum, olcekMaks: 40,
        bolgeler: [[0, 10, 'Dikkat'], [10, 20, 'Geliştirilebilir'], [20, 40, 'Güçlü']],
        aciklama: ['Gelirinin ne kadarını düzenli biriktiriyorsun? 50/30/20 kuralı örnek olarak ', el('b', {}, '%20'), ' önerir.'],
        linkler: [['Birikim hedefi aracı', 'araclar.html#hedef'], ['Maaşım yatınca ne yapmalıyım?', 'sorular.html#maas-yatinca']] })
    ));
  }

  function halkaMini(n, toplam) {
    const C = 2 * Math.PI * 52;
    const svg = svgEl('svg', { viewBox: '0 0 120 120', 'aria-hidden': 'true' });
    svg.innerHTML = `<circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fill" cx="60" cy="60" r="52" style="stroke-dashoffset:${C * (1 - n / toplam)}"/>`;
    return el('div', { className: 'result-ring mini-ring' }, svg, el('div', { className: 'ring-label' }, el('strong', {}, String(n)), el('span', {}, '/ ' + toplam)));
  }

  Object.values(A).forEach(a => a.on(hesapla));
  hesapla();
})();
