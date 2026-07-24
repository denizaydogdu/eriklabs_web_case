const { config } = require('../config/config');
const locators = require('./locators');
const { dismissIfVisible } = require('../utils/waits');
const { resolveLocator } = require('../utils/locator');

// Shared behaviour for every page object: navigation, locator resolution and
// the overlays that get in the way of clicks. Keeping it here means no page
// object has to deal with the cookie banner or the cart modal on its own.
class BasePage {
  constructor(page) {
    this.page = page;
  }

  locator(descriptor) {
    return resolveLocator(this.page, descriptor);
  }

  async goto(path = '/') {
    const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.navigationTimeout });
    await this.dismissOverlays();
  }

  // The cookie banner and the add-to-cart modal both arrive late and can swallow
  // clicks. Neither is guaranteed to be there, so we close them if they showed up
  // and move on without waiting if they didn't.
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
}

module.exports = { BasePage };
