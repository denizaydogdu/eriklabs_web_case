const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const locators = require('./locators');

// Signing in happens in two steps: the phone number is checked first, and if it
// belongs to a registered account the password field appears on the same screen.
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

  // The phone field is masked and Angular picks the value up asynchronously.
  // Typing digit by digit races with the mask and can reorder them, so the value
  // goes in one shot and we confirm it landed before submitting.
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
}

module.exports = { LoginPage };
