const { Formatter, Status } = require('@cucumber/cucumber');

// Cucumber's built-in console formatters either print a dot per step or a
// "3/5 steps" bar -- neither says which scenario just ran. This one prints a
// line per scenario as it finishes, and the failure details at the end, so a
// run can be followed (and debugged) without opening the Allure report.
const COLOR = {
  reset: '[0m',
  grey: '[90m',
  green: '[32m',
  red: '[31m',
  yellow: '[33m',
  bold: '[1m',
};

// Renk kodlari yalnizca gercek bir terminalde anlamli; CI loglarinda ve dosyaya
// yonlendirilmis ciktida gurultuye donusuyorlar.
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (color, text) => (useColor ? `${color}${text}${COLOR.reset}` : text);

function toMillis(timestamp) {
  return timestamp.seconds * 1000 + Math.round(timestamp.nanos / 1e6);
}

function formatDuration(millis) {
  return millis >= 1000 ? `${(millis / 1000).toFixed(1)}s` : `${millis}ms`;
}

module.exports = class ReadableFormatter extends Formatter {
  constructor(options) {
    super(options);

    this.pickles = new Map();
    this.pickleSteps = new Map();
    this.testCasePickleIds = new Map();
    this.testStepPickleIds = new Map();
    this.running = new Map();
    this.failures = [];
    this.counts = { passed: 0, failed: 0, other: 0 };

    options.eventBroadcaster.on('envelope', (envelope) => this.onEnvelope(envelope));
  }

  onEnvelope(envelope) {
    if (envelope.pickle) {
      this.pickles.set(envelope.pickle.id, envelope.pickle);
      envelope.pickle.steps.forEach((step) => this.pickleSteps.set(step.id, step.text));
    }
    if (envelope.testCase) {
      this.testCasePickleIds.set(envelope.testCase.id, envelope.testCase.pickleId);
      envelope.testCase.testSteps.forEach((step) => {
        if (step.pickleStepId) {
          this.testStepPickleIds.set(step.id, step.pickleStepId);
        }
      });
    }
    if (envelope.testCaseStarted) {
      this.onTestCaseStarted(envelope.testCaseStarted);
    }
    if (envelope.testStepFinished) {
      this.onTestStepFinished(envelope.testStepFinished);
    }
    if (envelope.testCaseFinished) {
      this.onTestCaseFinished(envelope.testCaseFinished);
    }
    if (envelope.testRunFinished) {
      this.printSummary(envelope.testRunFinished);
    }
  }

  onTestCaseStarted(data) {
    const pickle = this.pickles.get(this.testCasePickleIds.get(data.testCaseId));
    this.running.set(data.id, {
      name: pickle ? this.describe(pickle) : 'bilinmeyen senaryo',
      tags: pickle ? pickle.tags.map((tag) => tag.name) : [],
      start: toMillis(data.timestamp),
      failedSteps: [],
    });
  }

  // Scenario Outline satirlari ayni ismi paylasiyor. Cucumber tum pickle'lari
  // kosum baslamadan yayinladigi icin ismin tekrar edip etmedigi burada bilinir;
  // tekrar ediyorsa ilk adim eklenerek satirlar ayirt edilebilir hale gelir.
  describe(pickle) {
    const duplicated = [...this.pickles.values()].filter((other) => other.name === pickle.name).length > 1;
    if (!duplicated || !pickle.steps.length) {
      return pickle.name;
    }
    return `${pickle.name} → ${pickle.steps[0].text}`;
  }

  onTestStepFinished(data) {
    const scenario = this.running.get(data.testCaseStartedId);
    if (!scenario || data.testStepResult.status !== Status.FAILED) {
      return;
    }
    const pickleStepId = this.testStepPickleIds.get(data.testStepId);
    scenario.failedSteps.push({
      step: pickleStepId ? this.pickleSteps.get(pickleStepId) : 'hook',
      message: data.testStepResult.message || '',
    });
  }

  onTestCaseFinished(data) {
    const scenario = this.running.get(data.testCaseStartedId);
    if (!scenario) {
      return;
    }
    this.running.delete(data.testCaseStartedId);

    const duration = formatDuration(toMillis(data.timestamp) - scenario.start);
    const failed = scenario.failedSteps.length > 0;

    if (failed) {
      this.counts.failed += 1;
      this.failures.push(scenario);
    } else {
      this.counts.passed += 1;
    }

    const mark = failed ? paint(COLOR.red, '✗') : paint(COLOR.green, '✓');
    const tags = scenario.tags.length ? paint(COLOR.grey, ` ${scenario.tags.join(' ')}`) : '';
    this.log(`${mark} ${scenario.name}${tags} ${paint(COLOR.grey, `(${duration})`)}\n`);
  }

  printSummary(testRunFinished) {
    if (this.failures.length) {
      this.log(`\n${paint(COLOR.bold, 'Başarısız senaryolar')}\n`);
      this.failures.forEach((scenario) => {
        this.log(`\n${paint(COLOR.red, '✗')} ${paint(COLOR.bold, scenario.name)}\n`);
        scenario.failedSteps.forEach((failure) => {
          this.log(`  ${paint(COLOR.yellow, failure.step)}\n`);
          failure.message
            .split('\n')
            .slice(0, 12)
            .forEach((line) => this.log(`    ${paint(COLOR.grey, line)}\n`));
        });
      });
    }

    const total = this.counts.passed + this.counts.failed;
    const summary = this.counts.failed
      ? paint(COLOR.red, `${this.counts.failed} başarısız`) + `, ${this.counts.passed} başarılı`
      : paint(COLOR.green, `${this.counts.passed} senaryonun tamamı geçti`);

    this.log(`\n${total} senaryo — ${summary}\n`);
    if (testRunFinished.message) {
      this.log(`${paint(COLOR.grey, testRunFinished.message)}\n`);
    }
  }
};
