const { BasePage } = require('./BasePage');
const locators = require('./locators');
const { waitForListToSettle } = require('../utils/waits');

// Search results load lazily, so the list is read only once the item count
// has settled.
class SearchResultsPage extends BasePage {
  constructor(page) {
    super(page);
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

  // An empty result set is a legitimate outcome, not a failure: the site happens
  // to always return something today, but the no-results scenario must still be
  // able to assert on an empty list instead of timing out waiting for a title.
  async titles() {
    await this.productTitles.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const texts = await this.productTitles.allTextContents();
    return texts.map((t) => t.trim()).filter(Boolean);
  }

  async productLinks(limit = 10) {
    const anchors = this.locator(locators.search.productAnchor);
    await anchors.first().waitFor({ state: 'visible' });
    const hrefs = await anchors.evaluateAll((nodes) =>
      nodes.map((node) => (node.getAttribute('href') || '').split('#')[0]).filter(Boolean),
    );
    return [...new Set(hrefs)].slice(0, limit);
  }

  // How much of the result set actually relates to what was searched for.
  // Multi-word terms count as related when any word of the term shows up.
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
