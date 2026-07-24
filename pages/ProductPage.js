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

  // Adding to the cart pops a side modal that blocks further clicks, so closing
  // it is part of the action rather than something callers have to remember.
  async addToCart() {
    await this.addToCartButton.first().waitFor({ state: 'visible' });
    await this.addToCartButton.first().click();
    await this.closeAddToCartModal();
  }
}

module.exports = { ProductPage };
