const { BasePage } = require('./BasePage');
const locators = require('./locators');

// Where session state gets checked. The header account menu is a hover flyout,
// so it has to be opened before its links can be asserted on. The stronger
// second signal: a guest hitting /my-account gets redirected to /login.
class AccountPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountMenu = this.locator(locators.header.accountMenu);
    this.logoutLink = this.locator(locators.header.logoutLink);
    this.loginLink = this.locator(locators.header.loginLink);
  }

  async openAccountMenu() {
    await this.accountMenu.first().hover();
  }

  async logout() {
    await this.goto('/logout');
    await this.page.waitForURL((url) => !url.pathname.startsWith('/logout'));
  }
}

module.exports = { AccountPage };
