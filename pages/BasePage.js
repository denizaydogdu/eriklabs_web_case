const { config } = require('../config/config');
const locators = require('./locators');
const { dismissIfVisible } = require('../utils/waits');

// Tum sayfa nesnelerinin ortak davranisi: gezinme, locator cozumleme ve
// senaryolarin akisini bozan overlay'lerin (cerez banner'i, sepet modali)
// yonetimi burada toplanir. Boylece her sayfada tekrar edilmez.
class BasePage {
  constructor(page) {
    this.page = page;
  }

  // Locator tanimlari iki bicimde olabilir: CSS string veya {role, name}
  // tanimlayicisi. Role tabanli secim erisilebilirlik agacini kullandigi
  // icin metin/markup degisikliklerine karsi daha dayaniklidir.
  locator(descriptor) {
    if (typeof descriptor === 'string') {
      return this.page.locator(descriptor);
    }
    if (descriptor && descriptor.role) {
      return this.page.getByRole(descriptor.role, {
        name: descriptor.name,
        exact: descriptor.exact,
      });
    }
    throw new Error(`Tanimsiz locator: ${JSON.stringify(descriptor)}`);
  }

  async goto(path = '/') {
    const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.navigationTimeout });
    await this.dismissOverlays();
  }

  // Cerez banner'i ve sepete ekleme modali sayfaya gecikmeli dusuyor ve
  // tiklamalari engelleyebiliyor. Ikisi de opsiyonel oldugu icin varsa
  // kapatiyor, yoksa beklemeden devam ediyoruz.
  async dismissOverlays() {
    await dismissIfVisible(this.page.locator(locators.common.cookieClose), 3000);
    await dismissIfVisible(this.page.locator(locators.common.addToCartModalClose), 1500);
  }

  async closeAddToCartModal() {
    const closed = await dismissIfVisible(this.page.locator(locators.common.addToCartModalClose), 8000);
    if (closed) {
      await this.page.locator(locators.common.addToCartModal).waitFor({ state: 'hidden' });
    }
    return closed;
  }

  async currentPath() {
    return new URL(this.page.url()).pathname;
  }
}

module.exports = { BasePage };
