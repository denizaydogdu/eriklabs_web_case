# Kod Değerlendirme Notları

Projenin kendi gözden geçirmesi: bilinçli verilen tavizler, inceleme sırasında
bulunup düzeltilen hatalar ve hâlâ açık olan zayıflıklar.

## Bilinçli tasarım kararları

**Ara toplam doğrulaması mutlak değil, göreli yapıldı.**
Canlı ortamda kampanya ve indirimler değiştiği için "sepet toplamı şu tutar
olmalı" biçiminde sabit bir beklenti kırılgan olurdu. Bunun yerine üç ilişki
doğrulanıyor: ara toplam = satır tutarlarının toplamı, adet artışının tutara
yansıması ve silinen satırın tutardan düşmesi. Bu, hesaplama hatasını yakalar
ama fiyat değişiminden etkilenmez.

**Ürünler dinamik seçiliyor.**
Sabit SKU kullanılsaydı ürün stoktan kalktığında senaryo kırılırdı. Kategori
listesinden farklı iki ürün seçiliyor. Tavizi: hangi ürünle koşulduğu değişiyor,
bu da hata ayıklamayı bir miktar zorlaştırıyor. Bu yüzden seçilen ürün adları
`this.state` içinde tutuluyor ve doğrulama mesajlarında kullanılıyor.

**Aynı iş için mükerrer step yazılmadı.**
Örneğin çıkış senaryosundaki "oturum gerektiren sayfaya erişim engelli mi"
kontrolü, kendi adımını yazmak yerine hazır `sayfasına gidilir` +
`adres satırının ... ile başladığı kontrol edilir` adımlarıyla kuruldu.

## İncelemede bulunan ve düzeltilen hatalar

Kod tamamlandıktan sonra yapılan gözden geçirmede çıkanlar. Hepsi düzeltildi;
buraya not düşülmesinin sebebi bulguların niteliğini göstermek.

**Fiyat metninden yanlış sayı okunabiliyordu.**
`subtotal()` özet satırının tamamını metin olarak okuyup ilk sayıyı fiyat kabul
ediyordu. Satır `Ürünler Toplamı (2 Ürün) 1.299,90 TL` biçiminde gelse tüm sepet
doğrulaması `2` üzerinden çalışır, üstelik sessizce yanlış sonuç verirdi. Artık
para birimi taşıyan tutar tercih ediliyor ve `utils/price.test.js` bu davranışı
birim testle koruyor.

**Sepete ekleme sessizce başarısız olabiliyordu.**
"Sepete Ekle" butonu, Angular olay dinleyicisini bağlamadan çok önce görünür
oluyor ve `disable` sınıfını hiç bırakmıyor; Playwright'ın "enabled" kontrolü de
bunu yakalamıyor. Erken tıklama hiçbir şey yapmıyor, sepet boş kalıyor ve hata
çok sonra "sepet boş" olarak ortaya çıkıyordu. Artık sitenin kendi onay penceresi
eklemenin kanıtı sayılıyor ve gelmezse tıklama tekrarlanıyor.

**Adet artışında sunucu onayı beklenmiyordu.**
Sepette adet metni iyimser (optimistic) güncelleniyor: istek sunucuya ulaşmasa
bile satır "2" gösteriyor, tutarlar ise tek ürünü anlatmaya devam ediyor. Bekleme
koşulu adet metninden, sunucunun onayladığı özet değişimine taşındı.

**`After` hook'unda context sızıntısı.**
Ekran görüntüsü veya trace toplarken bir hata çıkarsa `closeBrowser()` hiç
çalışmıyordu; sayfası çökmüş bir senaryo, worker'ın kalan koşumu boyunca açık
context bırakıyordu. Artefakt toplama artık `try/finally` içinde.

**Overlay kapatma, kapatmaya çalıştığı şey yüzünden testi düşürebiliyordu.**
Çerez banner'ı görünür bulunup tıklanmadan önce kendiliğinden kaybolursa
`click()` hata fırlatıyordu. Bu yardımcı tanımı gereği "varsa kapat" olduğundan
tıklama da best-effort hale getirildi.

**Assertion'ların söylediği ile yaptığı farklıydı.**
`adres satırının "..." ile başladığı` adımı aslında `contains` kontrolü yapıyordu
(`/foo/login-error`, `/login` beklentisini geçirirdi). "Metin görünmüyor" kontrolü
ise yalnızca ilk eşleşmeye bakıyordu; aynı metnin görünür ikinci bir kopyası
testi yanlışlıkla geçirebilirdi.

**`waitForListToSettle` sayacı selector'dan bağımsızdı.**
Sayaç `window` üzerinde tek anahtarla tutuluyordu; art arda iki liste beklemesi
aynı sayıya denk gelirse ikinci bekleme anında "sabitlendi" diyebilirdi.

**Allure raporu üretilmiyordu, üstelik sessizce.**
cucumber-js aynı anda tek formatter'ı stdout'a bağlıyor ve fazlasını hata
vermeden düşürüyor. İlk yapılandırmada düşen formatter Allure'du, dolayısıyla
hiç sonuç yazılmıyordu. Allure'un kullanılmayan akış çıktısı bir dosyaya
yönlendirildi; stdout koşum ilerlemesine kaldı.

## Hâlâ açık olan zayıflıklar

**1. Arama sonucu ilişki oranı eşiği (%70) deneysel.**
`SearchResultsPage.relatedRatio` başlıklarda arama kelimelerini arıyor ve sonuç
dönen aramada en az %70 eşiği bekliyor. Bu eşik gözlemle belirlendi; kategori
sayfası farklı marka adlarıyla dolduğunda gereksiz yere kırılabilir. Daha sağlam
yol: arama sonucunun kategori kimliği üzerinden doğrulanması.

**2. Negatif giriş senaryosu gerçek hesabı kullanıyor.**
"Hatalı şifre" satırı gerçek hesaba tek bir yanlış deneme gönderiyor. Site deneme
hakkını sayıyor; senaryo çok sık koşulursa (örneğin CI'da her commit'te) hesap
kilitlenebilir. Doğrusu bu senaryo için ayrı bir teknik hesap kullanmak olurdu.

**3. Sepete ekleme tekrarının çift ekleme riski.**
Tıklama, onay penceresi gelmezse tekrarlanıyor. Tıklama aslında işlediyse ve
pencere geç açıldıysa ürün iki kez eklenmiş olur. Pencere için tanınan süre
(8 sn) gözlenen açılma süresinin (1-3 sn) belirgin üzerinde tutularak risk
küçültüldü; kesin çözüm, sepet içeriğini API üzerinden doğrulamak olurdu.

**4. Trace her senaryoda toplanıyor.**
Başarılı senaryolarda dosya siliniyor, ancak toplama maliyeti koşum süresine
yansıyor. Alternatif olarak yalnızca tekrar denemede trace toplanabilirdi.

**5. Sepet satırı seçimi indekse dayalı.**
`1. ürünün adedi bir artırılır` gibi adımlar satır sırasını kullanıyor. Sepet
sıralaması değişirse yanlış satır üzerinde işlem yapılabilir. Adımların ürün
adıyla çalışacak biçimde genişletilmesi daha sağlam olurdu.

## Yapılmayanlar

- **API + storage state ile giriş (B1):** UI senaryolarını hızlandırabilirdi.
  Sitenin giriş akışı iki adımlı olduğu ve token yönetimi incelenmediği için
  kapsam dışında bırakıldı.
- **CI pipeline (B2):** Zaman kısıtı nedeniyle eklenmedi. Proje headless
  koşacak biçimde yapılandırıldığı için pipeline eklemek doğrudan mümkün.
- **Docker imajının koşum doğrulaması:** `Dockerfile` yazıldı ve temel alınan
  Playwright imajının sürümü projeyle hizalandı (bu yüzden Playwright sürümü
  sabit), ancak imaj build edilip içinde tam senaryo seti koşturulmadı.
