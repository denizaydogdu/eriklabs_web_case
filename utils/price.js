// e-bebek prices look like "1.299,90 TL": dot is the thousands separator and
// comma is the decimal one. Parsing this correctly is what the cart subtotal
// assertions are built on.

function parsePrice(text) {
  if (text === null || text === undefined) {
    throw new Error('parsePrice: boş değer verildi');
  }

  const match = String(text).replace(/ /g, ' ').match(/-?\d[\d.\s]*(,\d+)?/);
  if (!match) {
    throw new Error(`parsePrice: fiyat bulunamadı -> "${text}"`);
  }

  const normalized = match[0]
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const value = Number(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`parsePrice: sayıya çevrilemedi -> "${text}"`);
  }
  return value;
}

// Floating point comparisons get a kuruş of tolerance.
function priceEquals(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

module.exports = { parsePrice, priceEquals };
