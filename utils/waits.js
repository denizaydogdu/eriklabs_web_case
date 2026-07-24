// Stability helpers that avoid fixed sleeps. Playwright's auto-waiting covers
// most cases; what's left are optional/late-arriving UI pieces (cookie banner,
// cart modal) and lazy-loaded lists, which need an explicit condition to wait on.

let counter = 0;

// Clicks the element if it shows up, otherwise moves on quietly.
// Used for overlays that may or may not be there.
async function dismissIfVisible(locator, timeout = 4000) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
  } catch {
    return false;
  }
  await locator.first().click();
  return true;
}

// Waits until a lazy-loaded list stops growing: the condition is that the node
// count stays the same between two consecutive polls, not that time has passed.
//
// The bookkeeping is keyed per call rather than per page, so a previous wait --
// on another list, or on the same one before a new query -- can't hand this one
// a stale count and make it settle immediately.
async function waitForListToSettle(page, selector, { timeout = 15000, polling = 300 } = {}) {
  const key = `${selector}#${counter += 1}`;
  await page.waitForFunction(
    ({ sel, stateKey }) => {
      window.__ebListCounts = window.__ebListCounts || {};
      const count = document.querySelectorAll(sel).length;
      const stable = window.__ebListCounts[stateKey] === count && count > 0;
      window.__ebListCounts[stateKey] = count;
      return stable;
    },
    { sel: selector, stateKey: key },
    { timeout, polling },
  );
  return page.locator(selector).count();
}

module.exports = { dismissIfVisible, waitForListToSettle };
