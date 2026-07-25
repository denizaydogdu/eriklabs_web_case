# language: tr
@auth @regression
Özellik: Oturum kapatma
  Çıkış yaptığımda oturumumun gerçekten sonlanmasını
  ve hesap sayfalarına erişilememesini bekliyorum.

  # Burada test edilen şey çıkış; oturum bir ön koşul olduğu için giriş formu
  # sürülmüyor, token API'den alınıp enjekte ediliyor.
  Senaryo: Çıkış sonrası oturum gerçekten sonlanır
    Diyelim ki oturum API üzerinden açılır
    Ve kullanıcının giriş yapmış olduğu doğrulanır

    Eğer ki oturum kapatılır
    O zaman kullanıcının misafir durumunda olduğu doğrulanır

    Eğer ki "siparişlerim" sayfasına gidilir
    O zaman adres satırının "/login" ile başladığı kontrol edilir
