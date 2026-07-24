// Senaryolarin kullandigi arama terimleri ve urun kategorileri.
// Sabit urun kodu/SKU tutulmuyor; sepete eklenecek urunler kosum aninda
// kategori listesinden dinamik olarak seciliyor.

const searchTerms = {
  withResults: 'bebek bezi',
  withoutResults: 'qxzjvbkwmfpldnhtsr',
};

// Sepet senaryolari icin stok ve fiyat acisindan istikrarli bir kategori.
const cartCategory = '/bebek-bezleri-c10111';

module.exports = { searchTerms, cartCategory };
