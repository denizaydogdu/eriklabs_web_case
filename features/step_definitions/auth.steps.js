const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('../../utils/expect');
const { config } = require('../../config/config');
const { users } = require('../../fixtures/users');
const { fetchAccessToken } = require('../../utils/api-auth');

Given('geçerli kullanıcı bilgileri ile giriş yapılır', async function () {
  await this.pages.login.login(config.credentials);
});

// Oturumun kendisi test edilmediginde giris formunu bastan sona surmek yerine
// token API'den alinip context'e yaziliyor; iki adimli form atlaniyor.
Given('oturum API üzerinden açılır', async function () {
  const token = await fetchAccessToken(config.credentials);
  await this.injectSession(token);
});

When('{string} kullanıcısı ile giriş denenir', async function (userKey) {
  const user = users[userKey];
  if (!user) {
    throw new Error(`"${userKey}" test kullanıcısı tanımlı değil`);
  }
  await this.pages.login.open();
  await this.pages.login.submitPhone(user.phone);

  // Numara geçersizse akış şifre adımına hiç ulaşmıyor.
  if (user.password !== undefined) {
    await this.pages.login.submitPassword(user.password);
  }
});

Then('kullanıcının giriş yapmış olduğu doğrulanır', async function () {
  await this.pages.account.openAccountMenu();
  await expect(this.pages.account.logoutLink.first()).toBeVisible();
});

// The account menu only exists in the storefront header; the login screen has a
// stripped-down one. So the guest check goes back to the home page first.
Then('kullanıcının misafir durumunda olduğu doğrulanır', async function () {
  await this.pages.home.open();
  await this.pages.account.openAccountMenu();
  await expect(this.pages.account.loginLink.first()).toBeVisible();
});

When('oturum kapatılır', async function () {
  await this.pages.account.logout();
});
