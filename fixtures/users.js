const { config } = require('../config/config');

// Users for the negative scenarios. Real credentials are never in the code;
// they come from .env.
//
// e-bebek counts failed password attempts ("Kalan deneme hakkınız"), so only one
// wrong-password case is ever sent to the real account. The rest are checked
// without touching it.
const users = {
  'hatalı şifre': {
    get phone() {
      return config.credentials.phone;
    },
    password: 'YanlisSifre123!',
  },
  'eksik haneli telefon': {
    phone: '555123',
  },
};

module.exports = { users };
