const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parsePrice, priceEquals } = require('./price');

test('binlik ayracı ve para birimi ayıklanır', () => {
  assert.equal(parsePrice('1.299,90 TL'), 1299.9);
  assert.equal(parsePrice('119,99 TL'), 119.99);
  assert.equal(parsePrice('2.000 TL'), 2000);
  assert.equal(parsePrice('1.299,90 ₺'), 1299.9);
});

// Özet satırı tek parça metin olarak okunuyor ve etiketinde adet geçebiliyor.
// Metindeki ilk sayıyı almak, fiyat yerine adedi döndürürdü.
test('etiketteki adet değil, tutar okunur', () => {
  assert.equal(parsePrice('Ürünler Toplamı\n1.299,90 TL'), 1299.9);
  assert.equal(parsePrice('Ürünler Toplamı (2 Ürün)\n1.299,90 TL'), 1299.9);
  assert.equal(parsePrice('2 Ürün 349,97 TL'), 349.97);
});

test('geçersiz girdide anlaşılır hata verir', () => {
  assert.throws(() => parsePrice(null), /boş değer/);
  assert.throws(() => parsePrice('fiyat yok'), /fiyat bulunamadı/);
});

test('kuruş toleransı', () => {
  assert.equal(priceEquals(10.0, 10.004), true);
  assert.equal(priceEquals(10.0, 10.5), false);
  assert.equal(priceEquals(349.97, 349.98, 0.02), true);
});
