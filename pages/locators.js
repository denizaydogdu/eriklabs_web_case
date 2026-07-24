// Every selector lives here. Page objects and the element registry behind the
// generic steps both read from this file, so a changed selector is a one-line fix.
//
// Preference order: meaningful id > role/text > stable CSS class. e-bebek runs on
// SAP Spartacus (Angular), where ids and component classes are stable enough that
// brittle XPath chains were never needed.

module.exports = {
  common: {
    cookieClose: 'section.cookies button',
    addToCartModal: '.right-side-modal.modal.show',
    addToCartModalClose: '.right-side-modal.modal.show .close-button',
  },

  // The account menu is a flyout: its links sit in the DOM but stay invisible
  // until you hover it. Guests and signed-in users get different links rendered,
  // which is what the session assertions rely on.
  header: {
    accountMenu: 'cx-navigation-ui.accNavComponent',
    loginLink: '#lnkLoginNavNode',
    logoutLink: '#lnkSignOutNavNode',
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
    pageHeading: 'h1',
  },

  product: {
    title: 'h1',
    addToCartButton: 'button.btn-add',
  },

  cart: {
    lineItem: '.basket-product-item',
    lineTitle: 'h2',
    quantityText: '.quantity-text',
    increaseButton: '.plus-btn',
    removeButton: '.remove-item',
    removeConfirmButton: '.modal.show .btn-remove',
    priceOld: '.old-price',
    priceRegular: '.product-price',
    summaryItem: '.summary-item',
  },
};
