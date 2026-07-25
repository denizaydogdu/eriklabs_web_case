const { expect: playwrightExpect } = require('@playwright/test');
const { config } = require('../config/config');

// Playwright's own default for assertions is 5 seconds, while the browser
// context is configured with a longer action timeout. That mismatch made
// assertions on server-rendered transitions (a form that appears after a round
// trip) fail intermittently even though the page was simply still working.
// Assertions and actions now share the same budget.
const expect = playwrightExpect.configure({ timeout: config.defaultTimeout });

module.exports = { expect };
