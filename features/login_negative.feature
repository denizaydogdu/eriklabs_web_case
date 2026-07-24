# language: tr
@auth @negative @regression
Özellik: Hatalı giriş denemeleri
  Giriş bilgileri eksik veya yanlış olduğunda kullanıcının
  anlaşılır bir hata mesajı görmesi bekleniyor.

  Senaryo taslağı: Hatalı bilgilerle giriş denemesi engellenir
    Eğer ki "<kullanıcı>" kullanıcısı ile giriş denenir
    O zaman "<hata mesajı>" metninin görünür olduğu kontrol edilir
    Ve kullanıcının misafir durumunda olduğu doğrulanır

    Örnekler:
      | kullanıcı             | hata mesajı                                                |
      | hatalı şifre          | Kullanıcı adı veya parolanız hatalıdır                     |
      | eksik haneli telefon  | Lütfen 10 haneli olan geçerli bir telefon numarası giriniz |

  Senaryo: Boş telefon alanı ile giriş denemesi engellenir
    Diyelim ki "giriş" sayfasına gidilir
    Eğer ki "giriş yap butonu" elementine tıklanır
    O zaman "Lütfen 10 haneli olan geçerli bir telefon numarası giriniz" metninin görünür olduğu kontrol edilir

  Senaryo: Geçersiz formatta e-posta ile giriş denemesi engellenir
    Diyelim ki "giriş" sayfasına gidilir
    Eğer ki "e-posta sekmesi" elementine tıklanır
    Ve "e-posta alanı" alanına "gecersiz-eposta" yazılır
    Ve "giriş yap butonu" elementine tıklanır
    O zaman "Geçerli bir e-posta adresi giriniz." metninin görünür olduğu kontrol edilir
