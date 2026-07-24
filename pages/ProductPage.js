const { BasePage } = require('./BasePage');
const locators = require('./locators');

class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.locator(locators.product.title);
    this.addToCartButton = this.locator(locators.product.addToCartButton);
  }

  async open(productPath) {
    await this.goto(productPath);
    await this.title.first().waitFor({ state: 'visible' });
  }

  async productName() {
    return (await this.title.first().innerText()).trim();
  }

  // The button is visible long before Angular binds its handler, and it keeps a
  // "disable" class the whole time, so neither visibility nor Playwright's
  // enabled check says anything about readiness. An early click does nothing at
  // all and the cart silently stays empty, which used to surface much later as
  // "cart is empty". The confirmation modal is therefore treated as proof of the
  // add, and the click is repeated until it shows up.
  async addToCart() {
    const button = this.addToCartButton.first();
    await button.waitFor({ state: 'visible' });

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await button.click();
      if (await this.addToCartConfirmed(5000)) {
        await this.closeAddToCartModal();
        return;
      }
    }

    throw new Error(`Ürün sepete eklenemedi (onay penceresi açılmadı): ${this.page.url()}`);
  }

  async addToCartConfirmed(timeout) {
    return this.locator(locators.common.addToCartModal)
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }
}

module.exports = { ProductPage };
