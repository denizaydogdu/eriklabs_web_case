const path = require('path');
const { setWorldConstructor, setDefaultTimeout, World } = require('@cucumber/cucumber');
const { config } = require('../../config/config');
const { HomePage } = require('../../pages/HomePage');
const { LoginPage } = require('../../pages/LoginPage');
const { SearchResultsPage } = require('../../pages/SearchResultsPage');
const { ProductPage } = require('../../pages/ProductPage');
const { CartPage } = require('../../pages/CartPage');
const { AccountPage } = require('../../pages/AccountPage');
const { AUTH_STORAGE_KEY, sessionStorageValue } = require('../../utils/api-auth');

setDefaultTimeout(config.defaultTimeout * 3);

const videosDir = path.resolve(__dirname, '..', '..', 'reports', 'videos');

// Every scenario gets its own World instance, and its own browser context on
// top of that, so cookies, session and cart never leak from one scenario into
// the next. That is what makes the parallel run safe.
class EbebekWorld extends World {
  constructor(options) {
    super(options);
    this.context = null;
    this.page = null;
    this.pages = {};
    // Data carried between steps of a scenario (chosen products, measured
    // amounts) lives here rather than in a module-level variable.
    this.state = {};
  }

  async openBrowser(browser) {
    const viewport = { width: 1366, height: 900 };
    this.context = await browser.newContext({
      locale: config.locale,
      viewport,
      // Recording costs time and disk, so it is opt-in. Playwright only finalises
      // the file when the context closes, which is why the After hook picks it up
      // after teardown rather than during the scenario.
      ...(config.video ? { recordVideo: { dir: videosDir, size: viewport } } : {}),
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

  // Writes the session Spartacus expects into localStorage and reloads so the app
  // picks it up. Deliberately a one-off write rather than an init script: an init
  // script would re-inject the token on every navigation, and the logout scenario
  // could never get back to a guest state.
  async injectSession(token) {
    await this.pages.home.open();
    await this.page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [AUTH_STORAGE_KEY, sessionStorageValue(token)],
    );
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  // A context that refuses to close should be reported, not turned into a failed
  // scenario: the test itself has already finished by this point.
  async closeBrowser() {
    if (!this.context) {
      return;
    }
    try {
      await this.context.close();
    } catch (error) {
      console.warn(`Tarayıcı context'i kapatılamadı: ${error.message}`);
    } finally {
      this.context = null;
      this.page = null;
    }
  }
}

setWorldConstructor(EbebekWorld);

module.exports = { EbebekWorld };
