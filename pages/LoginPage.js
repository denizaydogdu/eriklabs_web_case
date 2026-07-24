const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const locators = require('./locators');

// e-bebek girisi iki adimli ilerliyor: once telefon numarasi dogrulaniyor,
// numara sisteme kayitliysa ayni ekranda sifre alani aciliyor.
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.phoneInput = this.locator(locators.login.phoneInput);
    this.passwordInput = this.locator(locators.login.passwordInput);
    this.emailInput = this.locator(locators.login.emailInput);
    this.emailTab = this.locator(locators.login.emailTab);
    this.submitButton = this.locator(locators.login.submitButton);
  }

  async open() {
    await this.goto('/login');
    await this.phoneInput.waitFor({ state: 'visible' });
  }

  // Telefon alani maskeli. Rakamlari tek tek yazmak maskenin imlec
  // konumlandirmasi ile yarisip haneleri karistirabildigi icin deger tek
  // seferde yaziliyor; ardindan Angular formuna islendigi dogrulanip
  // gonderiliyor.
  async submitPhone(phone) {
    await this.phoneInput.click();
    await this.phoneInput.fill(phone);
    await expect
      .poll(async () => (await this.phoneInput.inputValue()).replace(/\D/g, '').replace(/^90/, ''))
      .toBe(phone);
    await this.submitButton.first().click();
  }

  async submitPassword(password) {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    await this.submitButton.first().click();
  }

  async login({ phone, password }) {
    await this.open();
    await this.submitPhone(phone);
    await this.submitPassword(password);
    await this.page.waitForURL((url) => !url.pathname.startsWith('/login'));
    await this.dismissOverlays();
  }

  async switchToEmailTab() {
    await this.emailTab.first().click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  // Hata metinleri sayfada farkli kapsayicilarda cikabiliyor; senaryolar
  // beklenen metni verdigi icin metnin sayfada gorunur olmasi yeterli.
  errorMessage(text) {
    return this.page.getByText(text, { exact: false });
  }
}

module.exports = { LoginPage };
