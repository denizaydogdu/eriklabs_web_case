# language: tr
@search @smoke @regression
Özellik: Ürün arama
  Ziyaretçi olarak ürün aramak istiyorum
  ki aradığım ürüne hızlıca ulaşabileyim.

  Senaryo: Sonuç dönen arama ilgili ürünleri listeler
    Eğer ki "withResults" terimi aratılır
    O zaman sonuçların arama terimiyle ilişkili olduğu doğrulanır

  Senaryo: Karşılığı olmayan arama ilgili ürün listelemez
    Eğer ki "withoutResults" terimi aratılır
    O zaman arama başlığında "withoutResults" teriminin göründüğü doğrulanır
    Ve sonuçların arama terimiyle ilişkili olmadığı doğrulanır
