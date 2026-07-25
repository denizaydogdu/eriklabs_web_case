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
  // all and the cart silently stays empty, which only surfaced later as "cart is
  // empty". The confirmation modal is the site's own proof that the item landed,
  // so it is what the click waits on, and the click is repeated if it doesn't.
  //
  // The window per attempt is generous on purpose: retrying a click that had in
  // fact worked would add the product twice. In practice the modal shows up in a
  // couple of seconds whenever the click registers at all.
  async addToCart() {
    const modal = this.locator(locators.common.addToCartModal);
    const button = this.addToCartButton.first();
    await button.waitFor({ state: 'visible' });

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      // A modal left over from a previous product would otherwise read as proof
      // for this one.
      if (await modal.isVisible()) {
        await this.closeAddToCartModal();
      }

      await button.click();

      const confirmed = await modal
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true)
        .catch(() => false);

      if (confirmed) {
        await this.closeAddToCartModal();
        return;
      }
    }

    throw new Error(`Ürün sepete eklenemedi (onay penceresi açılmadı): ${this.page.url()}`);
  }
}

module.exports = { ProductPage };
