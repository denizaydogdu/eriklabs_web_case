# language: tr
@cart @auth @regression
Özellik: Sepetin oturum açıldığında korunması
  Misafirken sepete eklediğim ürünlerin giriş yaptıktan sonra
  kaybolmamasını bekliyorum.

  Senaryo: Misafir sepeti giriş sonrasında korunur
    Diyelim ki sepete 1 farklı ürün eklenir
    Eğer ki sepet sayfası açılır
    O zaman sepette 1 ürün olduğu doğrulanır

    Eğer ki geçerli kullanıcı bilgileri ile giriş yapılır
    O zaman kullanıcının giriş yapmış olduğu doğrulanır
    Ve sepetteki ürünlerin korunduğu doğrulanır
