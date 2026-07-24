const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { searchTerms } = require('../../fixtures/testdata');

When('{string} terimi aratılır', async function (term) {
  const searchTerm = searchTerms[term] || term;
  this.state.searchTerm = searchTerm;
  await this.pages.search.search(searchTerm);
});

Then('sonuçların arama terimiyle ilişkili olduğu doğrulanır', async function () {
  const ratio = await this.pages.search.relatedRatio(this.state.searchTerm);
  const titles = await this.pages.search.titles();

  expect(titles.length, 'arama sonucu urun listesi bos').toBeGreaterThan(0);
  expect(
    ratio,
    `sonuclarin yalnizca %${Math.round(ratio * 100)}'i "${this.state.searchTerm}" terimiyle iliskili`,
  ).toBeGreaterThanOrEqual(0.7);
});

Then('sonuçların arama terimiyle ilişkili olmadığı doğrulanır', async function () {
  const ratio = await this.pages.search.relatedRatio(this.state.searchTerm);
  expect(
    ratio,
    `karsiligi olmayan arama icin ilgili sonuc beklenmiyordu (oran: ${ratio})`,
  ).toBeLessThan(0.1);
});

Then('arama başlığında {string} teriminin göründüğü doğrulanır', async function (term) {
  const searchTerm = searchTerms[term] || term;
  await expect(this.pages.search.heading.first()).toContainText(searchTerm);
});
