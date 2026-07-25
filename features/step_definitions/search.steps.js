const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('../../utils/expect');
const { searchTerms } = require('../../fixtures/testdata');

When('{string} terimi aratılır', async function (term) {
  const searchTerm = searchTerms[term] || term;
  this.state.searchTerm = searchTerm;
  await this.pages.search.search(searchTerm);
});

// A term with results is redirected to its category page, and for a moment the
// old page's products are still on screen. Reading the list once can therefore
// catch the products of the page we are leaving, so the ratio is re-read until
// the destination page has rendered.
Then('sonuçların arama terimiyle ilişkili olduğu doğrulanır', async function () {
  let lastRatio = 0;
  try {
    await expect
      .poll(
        async () => {
          lastRatio = await this.pages.search.relatedRatio(this.state.searchTerm);
          return lastRatio;
        },
        { timeout: 25000 },
      )
      .toBeGreaterThanOrEqual(0.7);
  } catch {
    const titles = await this.pages.search.titles();
    throw new Error(
      titles.length === 0
        ? 'Arama sonucu ürün listesi boş kaldı'
        : `Sonuçların yalnızca %${Math.round(lastRatio * 100)}'i "${this.state.searchTerm}" terimiyle ilişkili. ` +
          `İlk başlıklar: ${titles.slice(0, 3).join(' | ')}`,
    );
  }
});

// Burada tersi geçerli: sayfa yerine oturduktan sonra tek okuma yapılmalı,
// aksi halde geçici bir ara durum "ilişkisiz" sanılabilir.
Then('sonuçların arama terimiyle ilişkili olmadığı doğrulanır', async function () {
  await this.pages.search.waitForResults();
  const ratio = await this.pages.search.relatedRatio(this.state.searchTerm);

  expect(
    ratio,
    `karşılığı olmayan arama için ilgili sonuç beklenmiyordu (oran: ${ratio})`,
  ).toBeLessThan(0.1);
});

Then('arama başlığında {string} teriminin göründüğü doğrulanır', async function (term) {
  const searchTerm = searchTerms[term] || term;
  await expect(this.pages.search.heading.first()).toContainText(searchTerm);
});
