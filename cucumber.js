// Not: cucumber-js ayni anda yalnizca tek bir formatter'i stdout'a
// baglayabiliyor; birden fazla verildiginde digerleri sessizce devre disi
// kaliyor ve Allure sonuclari uretilmiyor. Bu yuzden Allure formatter'i
// stdout'ta birakip ozet ciktisini dosyaya yaziyoruz.
const common = {
  require: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
  format: ['allure-cucumberjs/reporter', 'summary:reports/summary.txt'],
  formatOptions: {
    resultsDir: 'allure-results',
    snippetInterface: 'async-await',
  },
};

module.exports = {
  default: {
    ...common,
    parallel: Number(process.env.WORKERS || 2),
  },
  serial: {
    ...common,
    parallel: 0,
  },
  parallel: {
    ...common,
    parallel: Number(process.env.WORKERS || 2),
  },
};
