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

// Collecting artefacts must never stop the context from being closed: a crashed
// page makes screenshot() throw, and without the finally the context would stay
// open and pile up for the rest of the worker's run.
After(async function ({ pickle, result }) {
  const failed = result.status === Status.FAILED;
  // The handle has to be taken before teardown: closeBrowser() drops the page,
  // and the file itself is only written once the context is closed.
  const video = config.video && this.page ? this.page.video() : null;

  try {
    if (failed && this.page) {
      const screenshot = await this.page.screenshot({ fullPage: false });
      await this.attach(screenshot, { mediaType: ContentType.PNG, fileName: 'Ekran görüntüsü.png' });
    }
  } catch (error) {
    console.warn(`Ekran görüntüsü alınamadı (${pickle.name}): ${error.message}`);
  }

  try {
    if (this.context) {
      const tracePath = path.join(tracesDir, `${traceName(pickle)}.zip`);
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
  } catch (error) {
    console.warn(`Trace kaydedilemedi (${pickle.name}): ${error.message}`);
  } finally {
    await this.closeBrowser();
  }

  if (video) {
    try {
      if (failed) {
        await this.attach(fs.readFileSync(await video.path()), {
          mediaType: ContentType.WEBM,
          fileName: 'Koşum kaydı.webm',
        });
      }
      await video.delete();
    } catch (error) {
      console.warn(`Video kaydedilemedi (${pickle.name}): ${error.message}`);
    }
  }
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

// Scenario Outline rows share the same name, so the pickle id keeps traces from
// overwriting each other within a worker.
function traceName(pickle) {
  const slug = pickle.name
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${slug}-${pickle.id.slice(0, 8)}`;
}
