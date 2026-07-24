const { config } = require('../config/config');

// Negatif senaryolarda kullanilan kullanicilar. Gecerli kullanici bilgisi
// koda gomulmez, .env uzerinden okunur.
//
// Not: e-bebek hatali sifre denemelerini sayiyor ("Kalan deneme hakkiniz").
// Bu yuzden gercek hesaba yalnizca tek bir hatali sifre senaryosu
// gonderiliyor; diger negatif durumlar hesaba dokunmadan test ediliyor.
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
