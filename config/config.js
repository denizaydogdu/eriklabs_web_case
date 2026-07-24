const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Zorunlu ortam degiskeni tanimli degil: ${name}. .env dosyasini .env.example uzerinden olusturun.`);
  }
  return value;
}

const config = {
  baseUrl: process.env.BASE_URL || 'https://www.e-bebek.com',
  headless: process.env.HEADLESS !== 'false',
  slowMo: Number(process.env.SLOW_MO || 0),
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT || 20000),
  navigationTimeout: Number(process.env.NAV_TIMEOUT || 45000),
  locale: process.env.LOCALE || 'tr-TR',

  get credentials() {
    return {
      phone: required('EBEBEK_PHONE'),
      password: required('EBEBEK_PASSWORD'),
    };
  },
};

module.exports = { config };
