// sleep/waitForTimeout kullanmadan kararliligi saglayan yardimcilar.
// Playwright'in otomatik beklemesi cogu durumu cozer; buradakiler ise
// "opsiyonel/gecikmeli" UI parcalari (cerez banner'i, sepet modali) ve
// lazy-load listeler icin gerekli olan kosul-tabanli bekleme mantigini tasir.

// Bir element gorunurse verilen isi yapar, gorunmezse sessizce gecer.
// Zorunlu olmayan overlay'ler (banner/popup) icin kullanilir.
async function dismissIfVisible(locator, timeout = 4000) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
  } catch {
    return false;
  }
  await locator.first().click();
  return true;
}

// Lazy-load listelerde eleman sayisi ardisik olcumlerde sabitlenene kadar bekler.
// Sabit sure beklemek yerine DOM'daki sayinin degismemesini kosul olarak kullanir.
async function waitForListToSettle(page, selector, { timeout = 15000, polling = 300 } = {}) {
  await page.waitForFunction(
    (sel) => {
      const count = document.querySelectorAll(sel).length;
      const stable = window.__ebSettleCount === count && count > 0;
      window.__ebSettleCount = count;
      return stable;
    },
    selector,
    { timeout, polling },
  );
  return page.locator(selector).count();
}

// Kisa sureli kararsizliklarda (network jitter, yeniden render) bir islemi
// artan bekleme ile tekrar dener. Raporlanabilir bir hata mesaji ile sonlanir.
async function retry(action, { attempts = 3, backoff = 400, label = 'islem' } = {}) {
  let lastError;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, backoff * i));
      }
    }
  }
  throw new Error(`${label} ${attempts} denemede basarisiz oldu: ${lastError.message}`);
}

module.exports = { dismissIfVisible, waitForListToSettle, retry };
