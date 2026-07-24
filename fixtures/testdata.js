// Search terms and categories the scenarios run against. No fixed SKUs: the
// products that end up in the cart are picked from a category listing at runtime.

const searchTerms = {
  withResults: 'bebek bezi',
  withoutResults: 'qxzjvbkwmfpldnhtsr',
};

// A category that stays well stocked, which keeps the cart scenarios steady.
const cartCategory = '/bebek-bezleri-c10111';

module.exports = { searchTerms, cartCategory };
