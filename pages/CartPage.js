const { expect } = require('../utils/expect');
const { BasePage } = require('./BasePage');
const locators = require('./locators');
const { parsePrice } = require('../utils/price');

// Cart lines show their price in one of two shapes:
//  - discounted item: .old-price (line total at list price) + .product-price-discount
//  - regular item:    .product-price
// The "Ürünler Toplamı" summary adds up list prices, so the assertions read the
// list amount per line.
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.lineItems = this.locator(locators.cart.lineItem);
  }

  async open() {
    await this.goto('/cart');
  }

  async lineCount() {
    return this.lineItems.count();
  }

  async waitForLineCount(expected) {
    await this.page.waitForFunction(
      ({ selector, count }) => document.querySelectorAll(selector).length === count,
      { selector: locators.cart.lineItem, count: expected },
      { timeout: 20000 },
    );
  }

  lineByIndex(index) {
    return this.lineItems.nth(index);
  }

  async titles() {
    const count = await this.lineCount();
    const result = [];
    for (let i = 0; i < count; i += 1) {
      const text = await this.lineByIndex(i).locator(locators.cart.lineTitle).innerText();
      result.push(text.trim());
    }
    return result;
  }

  async quantityOf(index) {
    const text = await this.lineByIndex(index).locator(locators.cart.quantityText).innerText();
    return Number(text.trim());
  }

  async lineTotal(index) {
    const line = this.lineByIndex(index);
    const oldPrice = line.locator(locators.cart.priceOld);
    if (await oldPrice.count()) {
      return parsePrice(await oldPrice.first().innerText());
    }
    return parsePrice(await line.locator(locators.cart.priceRegular).first().innerText());
  }

  // The quantity text is updated optimistically: it flips to the new value before
  // the server has confirmed anything, and a request that never lands leaves the
  // line saying "2" while the totals still describe a cart of one. The summary
  // changing is the server-confirmed signal, so that is what the wait is on.
  async increaseQuantity(index) {
    const line = this.lineByIndex(index);
    const before = await this.quantityOf(index);
    const summaryBefore = await this.summaryText();

    await line.locator(locators.cart.increaseButton).click();

    await expect
      .poll(
        async () => {
          const quantity = await this.quantityOf(index).catch(() => before);
          const summary = await this.summaryText().catch(() => summaryBefore);
          return quantity > before && summary !== summaryBefore;
        },
        { timeout: 25000 },
      )
      .toBe(true);

    return before + 1;
  }

  async summaryText() {
    return this.locator(locators.cart.summaryItem).filter({ hasText: 'Ürünler Toplamı' }).first().innerText();
  }

  // Removing a line opens a confirmation modal first; nothing is deleted until
  // its "Sil" button is clicked. As with adding to the cart, the bin icon can be
  // clicked before Angular is listening, and then nothing happens at all -- so
  // the modal showing up is what the click waits on, and the click is repeated
  // if it doesn't.
  async removeLine(index) {
    const before = await this.lineCount();
    const removeIcon = this.lineByIndex(index).locator(locators.cart.removeButton);
    const confirmButton = this.locator(locators.cart.removeConfirmButton);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await removeIcon.click();

      const opened = await confirmButton
        .first()
        .waitFor({ state: 'visible', timeout: 6000 })
        .then(() => true)
        .catch(() => false);

      if (opened) {
        await confirmButton.first().click();
        await this.waitForLineCount(before - 1);
        return;
      }
    }

    throw new Error('Sepetten silme onay penceresi açılmadı');
  }

  async subtotal() {
    const row = this.locator(locators.cart.summaryItem).filter({ hasText: 'Ürünler Toplamı' }).first();
    await row.waitFor({ state: 'visible' });
    return parsePrice(await row.innerText());
  }

  async sumOfLineTotals() {
    const count = await this.lineCount();
    let total = 0;
    for (let i = 0; i < count; i += 1) {
      total += await this.lineTotal(i);
    }
    return total;
  }
}

module.exports = { CartPage };
