# language: tr
@auth @smoke
Özellik: Kullanıcı girişi
  Kayıtlı bir kullanıcı olarak siteye giriş yapabilmek istiyorum
  ki hesabıma özel sayfaları görüntüleyebileyim.

  Senaryo: Geçerli bilgilerle başarılı giriş
    Diyelim ki geçerli kullanıcı bilgileri ile giriş yapılır
    O zaman kullanıcının giriş yapmış olduğu doğrulanır

    Eğer ki "hesap menüsü" elementinin üzerine gelinir
    O zaman "çıkış yap linki" elementinin görünür olduğu kontrol edilir
    Ve "giriş yap linki" elementinin görünmediği kontrol edilir
