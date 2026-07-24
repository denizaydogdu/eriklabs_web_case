const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { config } = require('../../config/config');
const { users } = require('../../fixtures/users');

Given('geçerli kullanıcı bilgileri ile giriş yapılır', async function () {
  await this.pages.login.login(config.credentials);
  this.state.loggedIn = true;
});

When('{string} kullanıcısı ile giriş denenir', async function (userKey) {
  const user = users[userKey];
  if (!user) {
    throw new Error(`"${userKey}" test kullanicisi tanimli degil`);
  }
  await this.pages.login.open();
  await this.pages.login.submitPhone(user.phone);

  if (user.password !== undefined) {
    await this.pages.login.submitPassword(user.password);
  }
});

When('telefon numarası {string} olarak girilip devam edilir', async function (phone) {
  await this.pages.login.open();
  await this.pages.login.submitPhone(phone);
});

Then('kullanıcının giriş yapmış olduğu doğrulanır', async function () {
  await this.pages.account.openAccountMenu();
  await expect(this.pages.account.logoutLink.first()).toBeVisible();
});

// Hesap menusu yalnizca magaza sayfalarinin header'inda bulunuyor; giris
// ekraninda sadelestirilmis bir header var. Bu yuzden misafir dogrulamasi
// once ana sayfaya donuyor.
Then('kullanıcının misafir durumunda olduğu doğrulanır', async function () {
  await this.pages.home.open();
  await this.pages.account.openAccountMenu();
  await expect(this.pages.account.loginLink.first()).toBeVisible();
});

When('oturum kapatılır', async function () {
  await this.pages.account.logout();
  this.state.loggedIn = false;
});

Then('oturum gerektiren sayfaya erişimin engellendiği doğrulanır', async function () {
  await this.pages.account.openProtectedPage();
  await expect
    .poll(async () => new URL(this.page.url()).pathname, { timeout: 15000 })
    .toContain('/login');
});
