# language: tr
@auth @regression
Özellik: Oturum kapatma
  Çıkış yaptığımda oturumumun gerçekten sonlanmasını
  ve hesap sayfalarına erişilememesini bekliyorum.

  Senaryo: Çıkış sonrası oturum gerçekten sonlanır
    Diyelim ki geçerli kullanıcı bilgileri ile giriş yapılır
    Eğer ki oturum kapatılır
    O zaman kullanıcının misafir durumunda olduğu doğrulanır
    Ve oturum gerektiren sayfaya erişimin engellendiği doğrulanır
