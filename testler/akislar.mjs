// Kullanıcı akışları: sitenin en çok kullanılan yolları uçtan uca denenir.
// Her akış kendi temiz tarayıcı oturumunda çalışır; biri bozulsa da
// diğerleri denenmeye devam eder.

const AKISLAR = {
  async 'Arama paleti kavram buluyor ve götürüyor'(p, t) {
    await p.goto(t + 'index.html');
    await p.click('.search-trigger');
    await p.waitForSelector('dialog.spotlight[open] input');
    await p.fill('dialog.spotlight[open] input', 'enflasyon');
    await p.waitForSelector('.spot-item');
    const ilk = await p.textContent('.spot-item');
    if (!/enflasyon/i.test(ilk)) throw new Error(`ilk sonuç "${ilk.trim()}"`);
    await p.keyboard.press('Enter');
    await p.waitForURL(/kavram\.html\?k=enflasyon|sozluk\.html#enflasyon|dersler\.html#enflasyon/);
  },

  async 'Sözlük süzülüyor, boş sonuç uyarısı çıkıyor'(p, t) {
    await p.goto(t + 'sozluk.html');
    const hepsi = await p.locator('.term-card').count();
    await p.fill('#glossary-search', 'faiz');
    await p.waitForTimeout(250);
    const suzulen = await p.locator('.term-card').count();
    if (!(suzulen > 0 && suzulen < hepsi)) throw new Error(`süzme çalışmadı (${hepsi} → ${suzulen})`);
    await p.fill('#glossary-search', 'qqqqzz');
    await p.waitForTimeout(250);
    if (!(await p.isVisible('#glossary-empty'))) throw new Error('boş sonuç uyarısı görünmedi');
  },

  async 'Ders baştan sona oynuyor, ilerleme kaydediliyor'(p, t) {
    await p.goto(t + 'dersler.html#sektor');
    await p.waitForSelector('dialog.lesson-player[open]');
    const ileri = 'dialog[open] .lp-foot .button:not(.button-secondary)';
    let yanlisDenendi = false;
    for (let i = 0; i < 20; i++) {
      if (await p.$('dialog[open] .quiz-option:not([disabled])')) {
        const dogru = await p.evaluate(() => {
          const soru = document.querySelector('dialog[open] h2').textContent;
          return DERSLER.flatMap(d => d.kartlar).find(k => k.soru === soru).dogru;
        });
        if (!yanlisDenendi) {
          // Önce bir yanlış cevap: doğru şık ve harf doğru gösterilmeli
          await p.click(`dialog[open] .quiz-option:not([data-j="${dogru}"]) >> nth=0`);
          const r = await p.evaluate(d => {
            const b = document.querySelector(`dialog[open] .quiz-option[data-j="${d}"]`);
            return { isaretli: b.classList.contains('correct'), harf: b.querySelector('.option-key').textContent, mesaj: document.querySelector('dialog[open] .lp-feedback strong').textContent };
          }, dogru);
          if (!r.isaretli || r.mesaj !== 'Doğru cevap: ' + r.harf) throw new Error(`yanlış cevapta geri bildirim tutarsız: ${JSON.stringify(r)}`);
          yanlisDenendi = true;
        } else {
          await p.click(`dialog[open] .quiz-option[data-j="${dogru}"]`);
        }
      }
      const yazi = (await p.textContent(ileri)).trim();
      if (yazi === 'Karneme git' || yazi.startsWith('Sonraki ders')) break;
      await p.click(ileri);
      await p.waitForTimeout(120);
    }
    const kayit = await p.evaluate(() => JSON.parse(localStorage.getItem('paktolos-dersler') || '{}'));
    if (!kayit.sektor?.tamam) throw new Error('ders tamamlandı olarak kaydedilmedi');
    await p.goto(t + 'dersler.html');
    if ((await p.textContent('#school-count')).trim() !== '1') throw new Error('ilerleme sayacı 1 değil');
  },

  async 'Kredi hesaplayıcı sonucu değişiyor'(p, t) {
    await p.goto(t + 'araclar.html#kredi');
    const kok = '[data-tool="kredi"]';
    await p.waitForSelector(`${kok} .num-input input`);
    const once = await p.textContent(`${kok} .tool-results`);
    if (!once.includes('15.552')) throw new Error('varsayılan taksit 15.552 TL değil');
    const kutu = p.locator(`${kok} .num-input input`).first();
    await kutu.fill('500.000');
    await kutu.press('Tab');
    await p.waitForTimeout(200);
    const sonra = await p.textContent(`${kok} .tool-results`);
    if (!sonra.includes('31.104')) throw new Error('500.000 TL için taksit 31.104 TL olmalı');
  },

  async 'Kaydet → Karnem okuma listesi → çıkar'(p, t) {
    await p.goto(t + 'kavram.html?k=faiz');
    await p.click('.kaydet-btn');
    if ((await p.getAttribute('.kaydet-btn', 'aria-pressed')) !== 'true') throw new Error('kaydet düğmesi basılı görünmüyor');
    await p.goto(t + 'karnem.html');
    if ((await p.locator('.okuma-oge').count()) !== 1) throw new Error('okuma listesinde 1 öğe olmalı');
    if (!(await p.textContent('#son-bakilan')).includes('Faiz')) throw new Error('son baktıklarında Faiz yok');
    await p.click('.okuma-oge .icon-btn');
    await p.waitForTimeout(200);
    if (await p.locator('.okuma-oge').count()) throw new Error('öğe listeden çıkmadı');
    if (!(await p.isVisible('#okuma-listesi .empty-state'))) throw new Error('boş liste mesajı görünmedi');
  },

  async 'Kendini sına: cevap ve açıklama'(p, t) {
    await p.goto(t + 'test.html');
    await p.waitForSelector('#quiz-options .quiz-option');
    await p.click('#quiz-options .quiz-option >> nth=0');
    await p.waitForTimeout(200);
    const karar = await p.textContent('#quiz-verdict');
    if (!/Doğru|Yanlış/.test(karar)) throw new Error(`karar yazısı "${karar}"`);
  },

  async 'Günün sorusu: harf ve doğru şık tutarlı'(p, t) {
    await p.goto(t + 'karnem.html');
    await p.click('#daily-question .quiz-option >> nth=0');
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const c = document.querySelector('#daily-question .quiz-option.correct');
      return { harf: c?.querySelector('.option-key').textContent, mesaj: document.querySelector('#daily-question .lp-feedback strong').textContent };
    });
    if (!r.harf) throw new Error('doğru şık işaretlenmedi');
    if (!r.mesaj.startsWith('Doğru') && r.mesaj !== 'Doğru cevap: ' + r.harf) throw new Error(`mesaj "${r.mesaj}", doğru şık ${r.harf}`);
  },

  async 'Tema seçimi kalıcı'(p, t) {
    await p.goto(t + 'index.html');
    await p.click('.theme-switch [data-tema="dark"]');
    await p.reload();
    if ((await p.getAttribute('html', 'data-theme')) !== 'dark') throw new Error('yeniden yüklemede koyu tema kalmadı');
  },

  async 'Ekonomi haritası: oyuncuya dokununca panel değişiyor'(p, t) {
    await p.goto(t + 'ekonomi-haritasi.html');
    await p.waitForSelector('.eh-dugum');
    const once = await p.textContent('.eh-panel');
    await p.click('.eh-dugum >> nth=1');
    await p.waitForTimeout(250);
    const sonra = await p.textContent('.eh-panel');
    if (once === sonra) throw new Error('panel değişmedi');
  },

  async 'Ana sayfa: sekmeli liste ve arama kutusu'(p, t) {
    await p.goto(t + 'index.html');
    await p.click('#og-t3');
    if (!(await p.getAttribute('#og-p3', 'data-acik') !== null)) throw new Error('3. sekmenin panosu açılmadı');
    await p.click('.parca-sor');
    await p.waitForSelector('dialog.spotlight[open]');
  }
};

export default async function akislar({ taban, tarayici, hata }) {
  let gecen = 0;
  for (const [ad, akis] of Object.entries(AKISLAR)) {
    const ctx = await tarayici.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    const sayfaHatalari = [];
    p.on('pageerror', e => sayfaHatalari.push(e.message));
    try {
      await akis(p, taban);
      if (sayfaHatalari.length) throw new Error('sayfa hatası: ' + sayfaHatalari[0]);
      gecen++;
    } catch (e) {
      hata(`${ad}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
  return `${gecen}/${Object.keys(AKISLAR).length} akış`;
}
