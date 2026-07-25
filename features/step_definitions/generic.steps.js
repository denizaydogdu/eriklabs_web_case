const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('../../utils/expect');
const { resolveElement, resolvePage } = require('../support/element-registry');
const { resolveLocator } = require('../../utils/locator');

// Most scenarios are written with these. Element and page names resolve to
// locators through the element registry, so feature files stay selector-free.

function locatorFor(world, name) {
  return resolveLocator(world.page, resolveElement(name));
}

Given('{string} sayfasına gidilir', async function (pageName) {
  await this.pages.home.goto(resolvePage(pageName));
});

When('{string} elementine tıklanır', async function (elementName) {
  await locatorFor(this, elementName).first().click();
});

// For components that only open on hover, like the header account menu.
When('{string} elementinin üzerine gelinir', async function (elementName) {
  await locatorFor(this, elementName).first().hover();
});

When('{string} alanına {string} yazılır', async function (elementName, value) {
  await locatorFor(this, elementName).first().fill(value);
});

When('{string} alanı temizlenir', async function (elementName) {
  await locatorFor(this, elementName).first().fill('');
});

Then('{string} elementinin görünür olduğu kontrol edilir', async function (elementName) {
  await expect(locatorFor(this, elementName).first()).toBeVisible();
});

Then('{string} elementinin görünmediği kontrol edilir', async function (elementName) {
  await expect(locatorFor(this, elementName).first()).toBeHidden();
});

Then('{string} metninin görünür olduğu kontrol edilir', async function (text) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
});

// Checking only the first match would pass while a second, visible copy of the
// same text sits further down the DOM, so this asserts that nothing visible
// carries the text.
Then('{string} metninin görünmediği kontrol edilir', async function (text) {
  await expect(this.page.getByText(text, { exact: false }).filter({ visible: true })).toHaveCount(0);
});

Then('adres satırının {string} ile başladığı kontrol edilir', async function (expectedPath) {
  await expect
    .poll(async () => new URL(this.page.url()).pathname.startsWith(expectedPath), { timeout: 15000 })
    .toBe(true);
});

Then('{string} elementinin sayısının {int} olduğu kontrol edilir', async function (elementName, expected) {
  await expect(locatorFor(this, elementName)).toHaveCount(expected);
});
