// Stability helpers that avoid fixed sleeps. Playwright's auto-waiting covers
// most cases; what's left are optional/late-arriving UI pieces (cookie banner,
// cart modal) and lazy-loaded lists, which need an explicit condition to wait on.

let counter = 0;

// Clicks the element if it shows up, otherwise moves on quietly. Used for
// overlays that may or may not be there.
//
// The click is best-effort too: a banner can dismiss itself between the wait and
// the click, and an overlay disappearing on its own is exactly the outcome we
// wanted -- it must not fail the step that happened to trigger the check.
async function dismissIfVisible(locator, timeout = 4000) {
  const target = locator.first();
  try {
    await target.waitFor({ state: 'visible', timeout });
  } catch {
    return false;
  }

  try {
    await target.click({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
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
