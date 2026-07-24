const locators = require('../../pages/locators');

// Generic steps refer to elements by business-facing names so that scenarios
// never contain a selector. This table maps those names onto the single set of
// locator definitions, which keeps selector changes down to one file.
const elements = {
  'giriş yap linki': locators.header.loginLink,
  'arama kutusu': locators.header.searchBox,
  'sepet linki': locators.header.cartLink,
  'çıkış yap linki': locators.header.logoutLink,
  'hesap menüsü': locators.header.accountMenu,

  'telefon alanı': locators.login.phoneInput,
  'şifre alanı': locators.login.passwordInput,
  'e-posta alanı': locators.login.emailInput,
  'e-posta sekmesi': locators.login.emailTab,
  'giriş yap butonu': locators.login.submitButton,

  'sepete ekle butonu': locators.product.addToCartButton,
  'ürün başlığı': locators.product.title,

  'sepet satırı': locators.cart.lineItem,
  'sepet özeti': locators.cart.summaryItem,

  'çerez banner kapat': locators.common.cookieClose,
};

const pages = {
  'ana sayfa': '/',
  'giriş': '/login',
  'sepet': '/cart',
  'hesabım': '/my-account',
  'siparişlerim': '/my-account/orders',
};

function resolveElement(name) {
  const key = name.toLocaleLowerCase('tr-TR').trim();
  const descriptor = elements[key];
  if (!descriptor) {
    throw new Error(
      `"${name}" element kaydi bulunamadi. Tanimli elementler: ${Object.keys(elements).join(', ')}`,
    );
  }
  return descriptor;
}

function resolvePage(name) {
  const key = name.toLocaleLowerCase('tr-TR').trim();
  const path = pages[key];
  if (!path) {
    throw new Error(`"${name}" sayfa kaydi bulunamadi. Tanimli sayfalar: ${Object.keys(pages).join(', ')}`);
  }
  return path;
}

module.exports = { resolveElement, resolvePage, elements, pages };
