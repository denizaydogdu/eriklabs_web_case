// Tum selector'lar tek noktada. Sayfa nesneleri ve generic step'lerin
// element registry'si buradan beslenir; boylece bir selector degisirse
// yalnizca burasi guncellenir.
//
// Secim onceligi: anlamli id > role/metin > stabil CSS class. e-bebek bir
// SAP Spartacus (Angular) storefront'u; id'ler ve component class'lari stabil,
// kirilgan XPath zincirlerinden kacinildi.

module.exports = {
  common: {
    cookieBanner: 'section.cookies',
    cookieClose: 'section.cookies button',
    addToCartModal: '.right-side-modal.modal.show',
    addToCartModalClose: '.right-side-modal.modal.show .close-button',
  },

  // Hesap menusu bir flyout: linkler uzerine gelinene kadar DOM'da olsa da
  // gorunur degil. Misafir ve giris yapmis kullanicida farkli linkler
  // render edildigi icin oturum durumu bu linkler uzerinden dogrulanir.
  header: {
    accountMenu: 'cx-navigation-ui.accNavComponent',
    loginLink: '#lnkLoginNavNode',
    logoutLink: '#lnkSignOutNavNode',
    ordersLink: '#lnkOrderHistoryNavNode',
    searchBox: '#txtSearchBox',
    cartLink: 'a[href="/cart"]',
  },

  login: {
    emailTab: '#btnLoginWithEmail',
    phoneInput: '#txtPhoneNumberMobile',
    passwordInput: '#txtPassword',
    emailInput: '#txtEmail',
    submitButton: { role: 'button', name: /giriş yap/i },
  },

  search: {
    productAnchor: '.product-list-page a.product-item-anchor',
    anyProductAnchor: 'a.product-item-anchor',
    productTitle: '.description.plist-desc',
    resultCount: '.product-list-page',
    pageHeading: 'h1',
  },

  product: {
    title: 'h1',
    addToCartButton: 'button.btn-add',
    price: '.product-price, .prices-content .product-price-discount, #txtPrice',
  },

  cart: {
    lineItem: '.basket-product-item',
    lineTitle: 'h2',
    lineBrand: 'a.brandName',
    lineLink: 'a[href*="-p-"]',
    quantityText: '.quantity-text',
    increaseButton: '.plus-btn',
    decreaseButton: '.minus-btn',
    removeButton: '.remove-item',
    removeConfirmButton: '.modal.show .btn-remove',
    priceDiscounted: '.product-price-discount',
    priceOld: '.old-price',
    priceRegular: '.product-price',
    summaryItem: '.summary-item',
  },
};
