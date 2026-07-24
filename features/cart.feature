# language: tr
@cart @regression
Özellik: Sepet işlemleri
  Ürünleri sepete ekleyip adetlerini yönetmek istiyorum
  ki ödemeye geçmeden önce tutarı doğru görebileyim.

  Senaryo: Adet güncelleme ve ürün silme sonrası ara toplam doğru hesaplanır
    Diyelim ki sepete 2 farklı ürün eklenir
    Eğer ki sepet sayfası açılır
    O zaman sepette 2 ürün olduğu doğrulanır
    Ve ara toplamın satır tutarlarının toplamına eşit olduğu doğrulanır

    Eğer ki 1. ürünün adedi bir artırılır
    O zaman adedi artırılan ürünün adedinin 2 olduğu doğrulanır
    Ve ara toplamın adet artışını yansıttığı doğrulanır

    Eğer ki 2. ürün sepetten silinir
    O zaman sepette 1 ürün olduğu doğrulanır
    Ve ara toplamın silinen ürün kadar azaldığı doğrulanır
    Ve ara toplamın satır tutarlarının toplamına eşit olduğu doğrulanır
