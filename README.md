# e-bebek Web Test Otomasyonu

e-bebek (https://www.e-bebek.com) üzerinde uçtan uca web test otomasyonu.
Teknoloji yığını: **JavaScript + Playwright + Cucumber + Allure**, Page Object Pattern ile.

## Gereksinimler

- Node.js 18 veya üzeri
- Allure raporunu üretmek için Java 8+ (Allure CLI projeye bağımlılık olarak
  eklendiği için ayrıca kurulum gerekmez)

## Kurulum

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

`.env` dosyasına giriş bilgilerini girin:

```
BASE_URL=https://www.e-bebek.com
EBEBEK_PHONE=5xxxxxxxxx      # 10 hane, başında 0 olmadan
EBEBEK_PASSWORD=********
HEADLESS=true
```

Kod içinde hard-coded URL veya kullanıcı bilgisi bulunmaz; tüm ortam parametreleri
`config/config.js` üzerinden okunur ve zorunlu değişkenler eksikse koşum anlaşılır
bir hata ile durur. `.env` dosyası `.gitignore` içindedir.

## Çalıştırma

```bash
npm test                 # tüm senaryolar, 2 worker ile paralel
npm run test:parallel    # açıkça paralel profil (WORKERS=4 npm run test:parallel ile worker sayısı değişir)
npx cucumber-js -p serial   # tek process, hata ayıklamak için
npm run test:smoke       # @smoke etiketli senaryolar
npm run test:regression  # @regression etiketli senaryolar
npm run test:negative    # @negative etiketli senaryolar
```

Tarayıcıyı görerek koşmak için `.env` içinde `HEADLESS=false` yapın.

### Rapor

```bash
npm run report           # allure generate + allure open
```

Rapor şunları içerir: senaryo adımları (Gherkin adımları Allure adımı olarak),
ortam bilgisi (`environment.properties`), etiketler ve **hata durumunda ekran
görüntüsü + Playwright trace** eki. Trace, Allure'ın trace görüntüleyicisi ile
açılabilecek içerik tipiyle eklenir.

### Docker

```bash
docker build -t ebebek-automation .
docker run --rm --env-file .env -v "$PWD/allure-results:/app/allure-results" ebebek-automation
```

## Senaryolar

| Dosya | Kapsam | Etiketler |
|---|---|---|
| `features/login.feature` | Geçerli bilgilerle giriş, hesap menüsünde kullanıcıya özgü linklerin doğrulanması | `@auth @smoke` |
| `features/login_negative.feature` | Hatalı şifre, eksik haneli telefon, boş alan ve geçersiz e-posta formatı (Scenario Outline + Examples) | `@auth @negative @regression` |
| `features/search.feature` | Sonuç dönen ve karşılığı olmayan arama | `@search @smoke @regression` |
| `features/cart.feature` | İki ürün ekleme, adet artırma, ürün silme ve ara toplamın sayısal doğrulanması | `@cart @regression` |
| `features/cart_persistence.feature` | Misafir sepetinin giriş sonrasında korunması | `@cart @auth @regression` |
| `features/logout.feature` | Çıkış sonrası oturumun gerçekten sonlanması | `@auth @regression` |

## Proje yapısı

```
config/           ortam değişkenleri ve doğrulaması
fixtures/         test kullanıcıları ve test verisi
pages/            page object'ler + locators.js (tüm selector'lar tek noktada)
utils/            fiyat parse, bekleme/retry yardımcıları
features/
  *.feature             Türkçe Gherkin senaryoları
  step_definitions/     generic + alan bazlı step'ler
  support/              World, hooks, element registry
```

### Hazır (generic) step kütüphanesi

Senaryoların büyük bölümü tekrar kullanılabilir step'lerle yazıldı:

```gherkin
Diyelim ki "giriş" sayfasına gidilir
Eğer ki "e-posta sekmesi" elementine tıklanır
Ve "e-posta alanı" alanına "gecersiz-eposta" yazılır
O zaman "Geçerli bir e-posta adresi giriniz." metninin görünür olduğu kontrol edilir
```

Feature dosyalarında selector yer almaz. Step'lerdeki iş dilindeki element
isimleri `features/support/element-registry.js` üzerinden `pages/locators.js`
içindeki tanımlara çözülür. Bir selector değiştiğinde yalnızca `locators.js`
güncellenir. Alan bilgisi gerektiren işler (giriş akışı, sepet matematiği)
için ayrıca alan bazlı step'ler yazıldı; aynı işi yapan mükerrer step tanımı yoktur.

### Locator stratejisi

Öncelik sırası: anlamlı `id` > rol/metin tabanlı seçim > stabil CSS sınıfı.
Site bir SAP Spartacus (Angular) uygulaması olduğu için bileşen sınıfları ve
`id`'ler kararlı; kırılgan XPath zincirleri kullanılmadı. Örnek:
`#txtPhoneNumberMobile`, `#btnLoginWithEmail`, `.basket-product-item`,
`getByRole('button', { name: /giriş yap/i })`.

## Test izolasyonu ve paralel koşum

İzolasyon iki katmanlıdır:

1. **Process seviyesi:** Cucumber `parallel: 2` ile senaryolar ayrı worker
   process'lerinde koşar (`WORKERS` değişkeni ile artırılabilir).
2. **Senaryo seviyesi:** Tarayıcı bir kez `BeforeAll` ile açılır, ancak **her
   senaryo kendi `BrowserContext`'ini** alır (`features/support/world.js`).
   Context senaryo sonunda kapatılır; çerez, oturum ve sepet verisi senaryolar
   arasında taşınmaz.

Senaryolar arasında paylaşılan global durum yoktur; adımlar arası veri
(seçilen ürünler, ölçülen tutarlar) World üzerindeki `this.state` içinde tutulur.
Bu sayede misafir sepeti → giriş akışı (S5) diğer senaryoları etkilemeden koşar.

## Bekleme stratejisi ve çözülen kararsızlıklar

`sleep` / `waitForTimeout` kullanılmadı. Playwright'ın otomatik beklemesi,
`expect(locator)` ve `expect.poll` tabanlı koşullu beklemeler ile
`utils/waits.js` içindeki yardımcılar kullanıldı.

Koşumlar sırasında karşılaşılan ve çözülen üç gerçek kararsızlık:

**1. Maskeli telefon alanında karışan haneler.**
Giriş formundaki telefon alanı maskeli. Rakamları tek tek yazan yaklaşım
(`pressSequentially`) maskenin imleç konumlandırmasıyla yarıştı ve paralel
koşumda haneler karıştı (`5551234567` yerine `5551234657` yazıldı, giriş
başarısız oldu). Çözüm: değeri tek işlemde yazmak (`fill`) ve tıklamadan önce
alandaki değerin gerçekten yerleştiğini `expect.poll` ile doğrulamak
(`pages/LoginPage.js`). Böylece form hazır olmadan submit edilmiyor.

**2. Sepet özetinin gecikmeli yeniden hesaplanması.**
Adet artırıldığında satırdaki adet anında güncelleniyor, ancak "Ürünler Toplamı"
ayrı bir istekle yeniden hesaplanıyor. Tek seferlik okuma eski tutarı yakalayıp
testi hatalı şekilde kırıyordu. Çözüm: tutarı beklenen değere ulaşana kadar
yeniden okuyan `expectSubtotal` yardımcısı (`features/step_definitions/cart.steps.js`);
zaman aşımında son okunan değer hata mesajında raporlanıyor.

**3. Tıklamayı engelleyen overlay'ler.**
Çerez banner'ı gecikmeli düşüyor, sepete ekleme sonrası sağdan bir modal
açılıyor ve tıklamaları engelliyor (`ngb-modal-window intercepts pointer events`).
Çözüm: `utils/waits.js` içindeki `dismissIfVisible` — element kısa bir süre
içinde görünürse kapatılır, görünmezse beklemeden devam edilir. Sabit bekleme
yoktur. Ayrıca sepetten ürün silme işlemi bir onay modalı açtığı için silme
akışı bu onayı da kapsar (`pages/CartPage.js`).

## Sepet toplamı doğrulaması

Fiyatlar `1.299,90 TL` biçiminde gelir; `utils/price.js` içindeki `parsePrice`
binlik ayracını ve para birimini temizleyip sayıya çevirir. Doğrulama ekran
görüntüsü veya metin eşitliği ile değil, sayısal olarak yapılır ve üç bağımsız
kontrolden oluşur:

1. Ara toplam, satır tutarlarının toplamına eşit mi?
2. Adet bir artırıldığında ara toplam tam olarak birim fiyat kadar arttı mı?
3. Bir ürün silindiğinde ara toplam o satırın tutarı kadar azaldı mı?

Sepet satırlarında fiyat iki biçimde görünüyor: indirimli üründe `.old-price`
(liste fiyatı üzerinden satır tutarı) ve `.product-price-discount`, indirimsiz
üründe `.product-price`. "Ürünler Toplamı" liste fiyatları üzerinden
hesaplandığı için doğrulamada satır başına liste tutarı kullanılır.

## Test verisi

Sepete eklenecek ürünler koşum anında kategori listesinden dinamik seçilir;
sabit ürün kodu (SKU) tutulmaz, böylece stok veya katalog değişikliğinde
senaryolar kırılmaz. Arama terimleri ve negatif giriş kombinasyonları
`fixtures/` altındadır; kullanıcı bilgileri `.env`'den okunur.

## Siteye özgü gözlemler ve senaryo tasarımı

Senaryolar sitenin gerçek davranışı incelenerek tasarlandı. Öne çıkan noktalar:

- **Giriş e-posta/şifre değil, telefon + şifre ile iki adımlı ilerliyor:**
  telefon doğrulandıktan sonra aynı ekranda şifre alanı açılıyor. E-posta sekmesi
  mevcut ancak kayıtlı olmayan e-posta girildiğinde hata yerine kayıt formu
  açılıyor; bu nedenle e-posta sekmesi yalnızca format doğrulaması senaryosunda
  kullanıldı.
- **Arama hiçbir zaman boş sonuç döndürmüyor.** Anlamsız bir terim aratıldığında
  bile ("qxzjvbkwmfpldnhtsr") site "665 Adet ürün bulundu" diyerek ilgisiz
  ürünler listeliyor; literal bir "sonuç bulunamadı" mesajı bulunmuyor. Bu yüzden
  "sonuç dönmeyen arama" senaryosu, sitenin gerçek davranışına uygun biçimde
  **dönen sonuçların hiçbirinin arama terimiyle ilişkili olmadığını** doğrular
  (sonuç dönen aramada ise başlıkların en az %70'i terimle ilişkilidir).
- **Hatalı şifre denemeleri sayılıyor** ("Kalan deneme hakkınız: 4"). Hesabın
  kilitlenmemesi için negatif senaryolarda gerçek hesaba yalnızca tek bir hatalı
  şifre denemesi gönderilir; diğer negatif durumlar hesaba dokunmadan test edilir.
- **Oturum doğrulaması** hesap menüsü üzerinden yapılır. Menü hover ile açılan bir
  flyout olduğundan linkler DOM'da olsa da görünür değildir; senaryo önce menüyü
  açar, sonra görünürlüğü doğrular. Çıkış senaryosu ayrıca oturum gerektiren bir
  sayfaya erişimin `/login`'e yönlendirildiğini kontrol eder.

## Bilinen sınırlamalar

- Docker imajı bu makinede Docker kurulu olmadığı için build edilerek
  doğrulanamadı; `Dockerfile` resmi Playwright imajının doğrulanmış
  `v1.61.1-noble` etiketini kullanır ve proje bağımlılıklarıyla uyumludur.
- Senaryolar canlı ortama karşı koşar; ürün fiyatı, stok veya kampanya
  değişiklikleri koşum süresini etkileyebilir. Bu nedenle ürün seçimi dinamiktir
  ve tutar doğrulamaları göreli (delta) olarak yapılır.
