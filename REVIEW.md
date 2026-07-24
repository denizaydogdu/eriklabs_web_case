# Kod Değerlendirme Notları

Projenin kendi gözden geçirmesi. Bilinçli verilen tavizler, tespit edilen
zayıflıklar ve bir sonraki adımda yapılması gerekenler.

## Bilinçli tasarım kararları

**Ara toplam doğrulaması mutlak değil, göreli yapıldı.**
Canlı ortamda kampanya ve indirimler değiştiği için "sepet toplamı şu tutar
olmalı" biçiminde sabit bir beklenti kırılgan olurdu. Bunun yerine üç ilişki
doğrulanıyor: ara toplam = satır tutarlarının toplamı, adet artışının tutara
yansıması ve silinen satırın tutardan düşmesi. Bu, hesaplama hatasını yakalar
ama fiyat değişiminden etkilenmez.

**Ürünler dinamik seçiliyor.**
Sabit SKU kullanılsaydı ürün stoktan kalktığında senaryo kırılırdı. Kategori
listesinden ilk iki farklı ürün seçiliyor. Tavizi: ürünlerin hangi ürün olduğu
koşuma göre değişiyor, bu da hata ayıklamayı bir miktar zorlaştırıyor. Bu yüzden
seçilen ürün adları `this.state` içinde tutuluyor ve doğrulama mesajlarında
kullanılıyor.

**Aynı iş için mükerrer step yazılmadı.**
Örneğin "hesap menüsünün üzerine gelinir" adımı generic hover step'i ile
karşılanıyor; giriş/çıkış gibi alan bilgisi gerektiren akışlar için ayrı step
yazıldı. Generic step'lerle karşılanabilecek bir işi tekrar tanımlamamaya
dikkat edildi.

## Tespit edilen zayıflıklar

**1. Arama sonucu ilişki oranı eşiği (%70) deneysel.**
`SearchResultsPage.relatedRatio` başlıklarda arama kelimelerini arıyor ve
sonuç dönen aramada en az %70 eşiği bekliyor. Bu eşik gözlemle belirlendi;
kategori sayfası farklı marka adlarıyla dolduğunda gereksiz yere kırılabilir.
Daha sağlam yol: site arama API'sinden dönen sonuç sayısını da doğrulamak veya
kategori kimliği üzerinden kontrol etmek.

**2. Negatif giriş senaryosu gerçek hesabı kullanıyor.**
"Hatalı şifre" satırı gerçek hesaba tek bir yanlış deneme gönderiyor. Site
deneme hakkını sayıyor; senaryo çok sık koşulursa (örneğin CI'da her commit'te)
hesap kilitlenebilir. Daha doğru çözüm: bu senaryo için ayrı bir teknik hesap
kullanmak veya girişi API seviyesinde taklit etmek.

**3. Trace her senaryoda toplanıyor.**
`context.tracing.start` her senaryoda çalışıyor, başarılı senaryolarda dosya
siliniyor. Bu, hata anında trace'in kesin olarak elde edilmesini sağlıyor ancak
koşum süresine ölçülebilir bir maliyet ekliyor. Alternatif olarak yalnızca
tekrar denemede trace toplayan bir yapı kurulabilirdi.

**4. `waitForListToSettle` içinde `window` üzerinde sayaç tutuluyor.**
Sayfa üzerinde `window.__ebSettleCount` değişkeni kullanılıyor. Aynı sayfada
farklı listeler için art arda çağrılırsa sayaç çakışabilir. Şu an tek listede
kullanıldığı için sorun çıkarmıyor; genel bir yardımcıya dönüşecekse selector
bazlı anahtar kullanılmalı.

**5. Allure formatter yapılandırması kırılgan bir davranışa bağlı.**
cucumber-js aynı anda tek bir formatter'ı stdout'a bağlıyor; birden fazla
verildiğinde diğerleri sessizce devre dışı kalıyor ve Allure sonuçları hiç
üretilmiyor (hata da vermiyor). Bu davranış `cucumber.js` içinde yorumla
belgelendi, ancak sürüm yükseltmelerinde tekrar kontrol edilmesi gereken bir nokta.

**6. Sepet satırı seçimi indekse dayalı.**
`1. ürünün adedi bir artırılır` gibi adımlar satır sırasını kullanıyor. Sepet
sıralaması değişirse yanlış satır üzerinde işlem yapılabilir. `CartPage` içinde
başlığa göre satır seçen `lineByTitle` mevcut; senaryolar ürün adı ile
çalışacak biçimde genişletilebilir.

## Yapılmayanlar

- **API + storage state ile giriş (B1):** UI senaryolarını hızlandırabilirdi.
  Sitenin giriş akışı iki adımlı olduğu ve token yönetimi incelenmediği için
  kapsam dışında bırakıldı.
- **CI pipeline (B2):** Zaman kısıtı nedeniyle eklenmedi. Proje headless
  koşacak biçimde yapılandırıldığı için pipeline eklemek doğrudan mümkün.
- **Docker doğrulaması:** `Dockerfile` yazıldı, ancak geliştirme makinesinde
  Docker kurulu olmadığı için imaj build edilerek doğrulanamadı.
