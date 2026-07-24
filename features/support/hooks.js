const fs = require('fs');
const path = require('path');
const { BeforeAll, Before, After, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { ContentType } = require('allure-js-commons');
// This import is what installs Allure's cucumber runtime, which is how
// attachments (screenshots, traces) find their way into the report.
require('allure-cucumberjs');
const { config } = require('../../config/config');

let browser;

const resultsDir = path.resolve(__dirname, '..', '..', 'allure-results');
const tracesDir = path.resolve(__dirname, '..', '..', 'reports', 'traces');

BeforeAll(async function () {
  browser = await chromium.launch({ headless: config.headless, slowMo: config.slowMo });
  writeAllureEnvironment();
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});

// A fresh context per scenario: clean cookies, storage and cart.
Before(async function () {
  await this.openBrowser(browser);
});

After(async function ({ pickle, result }) {
  const failed = result.status === Status.FAILED;

  if (failed && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: false });
    await this.attach(screenshot, { mediaType: ContentType.PNG, fileName: 'Ekran goruntusu.png' });
  }

  if (this.context) {
    const tracePath = path.join(tracesDir, `${slugify(pickle.name)}-${process.pid}.zip`);
    fs.mkdirSync(tracesDir, { recursive: true });
    await this.context.tracing.stop({ path: tracePath });

    // Traces are only kept for failures; successful runs would just pile up
    // files nobody looks at.
    if (failed) {
      await this.attach(fs.readFileSync(tracePath), {
        mediaType: ContentType.PLAYWRIGHT_TRACE,
        fileName: 'Playwright trace.zip',
      });
    } else {
      fs.rmSync(tracePath, { force: true });
    }
  }

  await this.closeBrowser();
});

// Run parameters, so the report says which environment produced these results.
function writeAllureEnvironment() {
  fs.mkdirSync(resultsDir, { recursive: true });
  const lines = [
    `BaseURL=${config.baseUrl}`,
    `Browser=Chromium`,
    `Headless=${config.headless}`,
    `Locale=${config.locale}`,
    `Node=${process.version}`,
    `Platform=${process.platform}`,
  ];
  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), lines.join('\n'), 'utf8');
}

function slugify(text) {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
