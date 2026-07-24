// cucumber-js only wires one formatter to stdout. Give it more than one and the
// others are silently dropped -- which meant no Allure results at all, with no
// error to explain it. So Allure keeps stdout and the summary goes to a file.
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
