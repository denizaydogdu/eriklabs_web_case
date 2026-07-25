// cucumber-js only wires one formatter to stdout, and a second one asking for it
// is dropped without a word -- which is how the Allure reporter ended up writing
// no results at all, with no error to explain it. Pointing Allure's (unused)
// stream output at a file settles the conflict: stdout stays free for the run
// progress, and the report is still written to allure-results.
const common = {
  require: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
  format: ['allure-cucumberjs/reporter:reports/allure-stream.log', './reporters/readable-formatter.js'],
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
