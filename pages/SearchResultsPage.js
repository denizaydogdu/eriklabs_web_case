const { BasePage } = require('./BasePage');
const locators = require('./locators');
const { waitForListToSettle } = require('../utils/waits');

// Arama sonuclari lazy-load ile geliyor; urun sayisi sabitlenene kadar
// bekleyip oyle okuyoruz.
class SearchResultsPage extends BasePage {
  constructor(page) {
    super(page);
    this.productAnchors = this.locator(locators.search.productAnchor);
    this.productTitles = this.locator(locators.search.productTitle);
    this.heading = this.locator(locators.search.pageHeading);
  }

  async search(term) {
    await this.goto(`/search?query=${encodeURIComponent(term)}`);
    await this.waitForResults();
  }

  async waitForResults() {
    await waitForListToSettle(this.page, locators.search.anyProductAnchor).catch(() => {});
  }

  async titles() {
    await this.productTitles.first().waitFor({ state: 'visible' });
    const texts = await this.productTitles.allTextContents();
    return texts.map((t) => t.trim()).filter(Boolean);
  }

  async productLinks(limit = 10) {
    const anchors = this.locator(locators.search.anyProductAnchor);
    await anchors.first().waitFor({ state: 'visible' });
    const hrefs = await anchors.evaluateAll((nodes) =>
      nodes.map((node) => (node.getAttribute('href') || '').split('#')[0]).filter(Boolean),
    );
    return [...new Set(hrefs)].slice(0, limit);
  }

  // Sonuclarin arama terimiyle iliskili olup olmadigini olcuyoruz.
  // Terim birden fazla kelime iceriyorsa kelimelerden herhangi birinin
  // gecmesi iliski icin yeterli sayiliyor.
  async relatedRatio(term) {
    const titles = await this.titles();
    if (titles.length === 0) {
      return 0;
    }
    const words = term.toLocaleLowerCase('tr-TR').split(/\s+/).filter((w) => w.length > 2);
    const matches = titles.filter((title) => {
      const lower = title.toLocaleLowerCase('tr-TR');
      return words.some((word) => lower.includes(word));
    });
    return matches.length / titles.length;
  }
}

module.exports = { SearchResultsPage };
