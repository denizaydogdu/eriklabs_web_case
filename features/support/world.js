const { setWorldConstructor, setDefaultTimeout, World } = require('@cucumber/cucumber');
const { config } = require('../../config/config');
const { HomePage } = require('../../pages/HomePage');
const { LoginPage } = require('../../pages/LoginPage');
const { SearchResultsPage } = require('../../pages/SearchResultsPage');
const { ProductPage } = require('../../pages/ProductPage');
const { CartPage } = require('../../pages/CartPage');
const { AccountPage } = require('../../pages/AccountPage');

setDefaultTimeout(config.defaultTimeout * 3);

// Her senaryo kendi World ornegini alir. Tarayici context'i de senaryo
// basina acildigi icin cerez/oturum/sepet verisi senaryolar arasinda
// tasinmaz; paralel kosumda izolasyon bu sayede saglanir.
class EbebekWorld extends World {
  constructor(options) {
    super(options);
    this.context = null;
    this.page = null;
    this.pages = {};
    // Senaryo icinde adimlar arasi tasinan veriler (secilen urunler,
    // olculen tutarlar) burada tutulur; global degisken kullanilmaz.
    this.state = {};
  }

  async openBrowser(browser) {
    this.context = await browser.newContext({
      locale: config.locale,
      viewport: { width: 1366, height: 900 },
    });
    this.context.setDefaultTimeout(config.defaultTimeout);
    this.context.setDefaultNavigationTimeout(config.navigationTimeout);
    await this.context.tracing.start({ screenshots: true, snapshots: true });

    this.page = await this.context.newPage();
    this.pages = {
      home: new HomePage(this.page),
      login: new LoginPage(this.page),
      search: new SearchResultsPage(this.page),
      product: new ProductPage(this.page),
      cart: new CartPage(this.page),
      account: new AccountPage(this.page),
    };
  }

  async closeBrowser() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
    }
  }
}

setWorldConstructor(EbebekWorld);

module.exports = { EbebekWorld };
