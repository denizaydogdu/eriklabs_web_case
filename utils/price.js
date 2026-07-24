// e-bebek prices look like "1.299,90 TL": dot is the thousands separator and
// comma is the decimal one. Parsing this correctly is what the cart subtotal
// assertions are built on.

const AMOUNT = String.raw`-?\d[\d.\s]*(?:,\d+)?`;
const WITH_CURRENCY = new RegExp(`${AMOUNT}\\s*(?:TL|₺)`, 'g');
const BARE_AMOUNT = new RegExp(AMOUNT);

// A summary row reads as one blob of text ("Ürünler Toplamı 1.299,90 TL"), and
// the label can carry its own number ("... (2 Ürün)"). Taking the first number
// in the string would silently return the item count instead of the price, so
// amounts carrying a currency suffix win.
function parsePrice(text) {
  if (text === null || text === undefined) {
    throw new Error('parsePrice: boş değer verildi');
  }

  const normalizedText = String(text).replace(/ /g, ' ');
  const withCurrency = normalizedText.match(WITH_CURRENCY);
  const raw = withCurrency ? withCurrency[withCurrency.length - 1] : (normalizedText.match(BARE_AMOUNT) || [])[0];

  if (!raw) {
    throw new Error(`parsePrice: fiyat bulunamadı -> "${text}"`);
  }

  const value = Number(
    raw
      .replace(/(?:TL|₺)/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.'),
  );

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
