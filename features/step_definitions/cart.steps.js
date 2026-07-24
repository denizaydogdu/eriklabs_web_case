const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { cartCategory } = require('../../fixtures/testdata');
const { priceEquals } = require('../../utils/price');

// The cart summary is recalculated by a separate request after a line quantity
// changes. Reading it once can catch the stale amount, so the value is re-read
// until it reaches what we expect.
async function expectSubtotal(world, expected, tolerance = 0.02) {
  let lastRead = null;
  let lastError = 'bilinmiyor';
  try {
    await expect
      .poll(
        async () => {
          try {
            lastRead = await world.pages.cart.subtotal();
          } catch (error) {
            lastError = error.message;
            return false;
          }
          return priceEquals(lastRead, expected, tolerance);
        },
        { timeout: 20000 },
      )
      .toBe(true);
  } catch {
    throw new Error(
      `Ara toplam beklenen değere ulaşmadı. Beklenen: ${expected.toFixed(2)} TL, son okunan: ${
        lastRead === null ? `okunamadı (${lastError})` : `${lastRead.toFixed(2)} TL`
      }`,
    );
  }
}

// Products are picked from a category listing at runtime, so the scenario
// survives stock and catalogue changes.
Given('sepete {int} farklı ürün eklenir', async function (count) {
  await this.pages.search.goto(cartCategory);
  await this.pages.search.waitForResults();

  const links = await this.pages.search.productLinks(count + 4);
  const chosen = links.slice(0, count);
  expect(chosen.length, 'kategoride yeterli ürün bulunamadı').toBe(count);

  this.state.addedProducts = [];
  for (const link of chosen) {
    await this.pages.product.open(link);
    const name = await this.pages.product.productName();
    await this.pages.product.addToCart();
    this.state.addedProducts.push({ link, name });
  }
});

When('sepet sayfası açılır', async function () {
  await this.pages.cart.open();
  await this.pages.cart.lineItems.first().waitFor({ state: 'visible' });
});

Then('sepette {int} ürün olduğu doğrulanır', async function (expected) {
  await expect(this.pages.cart.lineItems).toHaveCount(expected);
});

When('{int}. ürünün adedi bir artırılır', async function (position) {
  const index = position - 1;
  this.state.beforeIncrease = {
    subtotal: await this.pages.cart.subtotal(),
    lineTotal: await this.pages.cart.lineTotal(index),
    quantity: await this.pages.cart.quantityOf(index),
  };
  await this.pages.cart.increaseQuantity(index);
  this.state.increasedIndex = index;
});

When('{int}. ürün sepetten silinir', async function (position) {
  const index = position - 1;
  this.state.removedLineTotal = await this.pages.cart.lineTotal(index);
  this.state.subtotalBeforeRemove = await this.pages.cart.subtotal();
  await this.pages.cart.removeLine(index);
});

Then('adedi artırılan ürünün adedinin {int} olduğu doğrulanır', async function (expected) {
  const quantity = await this.pages.cart.quantityOf(this.state.increasedIndex);
  expect(quantity).toBe(expected);
});

// The subtotal is checked two independent ways: against the sum of the line
// amounts, and against how each action should have moved it.
Then('ara toplamın satır tutarlarının toplamına eşit olduğu doğrulanır', async function () {
  const sumOfLines = await this.pages.cart.sumOfLineTotals();
  await expectSubtotal(this, sumOfLines);
});

Then('ara toplamın adet artışını yansıttığı doğrulanır', async function () {
  const { subtotal: before, lineTotal, quantity } = this.state.beforeIncrease;
  const unitPrice = lineTotal / quantity;
  await expectSubtotal(this, before + unitPrice);
});

Then('ara toplamın silinen ürün kadar azaldığı doğrulanır', async function () {
  const expected = this.state.subtotalBeforeRemove - this.state.removedLineTotal;
  await expectSubtotal(this, expected);
});

Then('sepetteki ürünlerin korunduğu doğrulanır', async function () {
  await this.pages.cart.open();
  const titles = await this.pages.cart.titles();

  expect(titles.length, 'giriş sonrası sepet boş').toBeGreaterThan(0);
  for (const product of this.state.addedProducts) {
    const found = titles.some((title) => title.includes(product.name) || product.name.includes(title));
    expect(found, `"${product.name}" ürünü giriş sonrası sepette bulunamadı`).toBe(true);
  }
});
