const { BasePage } = require('./BasePage');
const locators = require('./locators');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.searchBox = this.locator(locators.header.searchBox);
    this.loginLink = this.locator(locators.header.loginLink);
    this.cartLink = this.locator(locators.header.cartLink);
  }

  async open() {
    await this.goto('/');
  }

  async isGuest() {
    return this.loginLink.first().isVisible();
  }
}

module.exports = { HomePage };
