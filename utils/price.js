// e-bebek fiyatlari "1.299,90 TL" formatinda gelir: nokta binlik, virgul ondalik ayraci.
// Bu formati guvenilir sekilde sayiya cevirmek sepet toplami dogrulamasinin temelidir.

function parsePrice(text) {
  if (text === null || text === undefined) {
    throw new Error('parsePrice: bos deger verildi');
  }

  const match = String(text).replace(/ /g, ' ').match(/-?\d[\d.\s]*(,\d+)?/);
  if (!match) {
    throw new Error(`parsePrice: fiyat bulunamadi -> "${text}"`);
  }

  const normalized = match[0]
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const value = Number(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`parsePrice: sayiya cevrilemedi -> "${text}"`);
  }
  return value;
}

// Kayan nokta karsilastirmalarinda kurus seviyesinde tolerans birakiyoruz.
function priceEquals(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

module.exports = { parsePrice, priceEquals };
