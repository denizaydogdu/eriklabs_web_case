const { BasePage } = require('./BasePage');
const locators = require('./locators');
const { parsePrice } = require('../utils/price');

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

  async price() {
    const priceText = await this.locator(locators.product.price).first().innerText();
    return parsePrice(priceText);
  }

  // Sepete ekleme sonrasi sagdan acilan modal tiklamalari engelledigi icin
  // ekleme isleminin bir parcasi olarak kapatiliyor.
  async addToCart() {
    await this.addToCartButton.first().waitFor({ state: 'visible' });
    await this.addToCartButton.first().click();
    await this.closeAddToCartModal();
  }
}

module.exports = { ProductPage };
