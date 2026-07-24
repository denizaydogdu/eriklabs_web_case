const { BasePage } = require('./BasePage');
const locators = require('./locators');

// Oturum durumunun dogrulama noktasi. Header'daki hesap menusu bir flyout
// oldugu icin once uzerine geliniyor, sonra menudeki link kontrol ediliyor.
// Ikinci ve daha guclu kanit: giris yapilmamis kullanici /my-account
// adresine gittiginde site /login sayfasina yonlendiriyor.
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

  async isLoggedIn() {
    await this.openAccountMenu();
    return this.logoutLink.first().isVisible();
  }

  async logout() {
    await this.goto('/logout');
    await this.page.waitForURL((url) => !url.pathname.startsWith('/logout'));
  }

  async openProtectedPage() {
    await this.goto('/my-account/orders');
  }
}

module.exports = { AccountPage };
