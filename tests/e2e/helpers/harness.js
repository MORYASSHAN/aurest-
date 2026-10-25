/**
 * AUREST Automated E2E Test Suite - Test Harness
 * Provides describe/it execution, assertions, timing, and formatted reporting.
 * Zero external dependencies, pure Node.js v18+.
 */

class TestHarness {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.currentTier = 'Global';
    this.results = [];
    this.startTime = 0;
    this.endTime = 0;
  }

  setTier(tierName) {
    this.currentTier = tierName;
  }

  describe(name, fn) {
    const suite = {
      name,
      tier: this.currentTier,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
    };
    this.currentSuite = suite;
    this.suites.push(suite);
    try {
      fn();
    } finally {
      this.currentSuite = null;
    }
  }

  it(name, testFn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be inside a describe block`);
    }
    this.currentSuite.tests.push({
      name,
      fn: testFn,
    });
  }

  async run(options = {}) {
    const filterTier = options.tier;
    this.startTime = Date.now();
    this.results = [];

    const suitesToRun = filterTier
      ? this.suites.filter((s) => s.tier.toLowerCase().includes(filterTier.toLowerCase()))
      : this.suites;

    for (const suite of suitesToRun) {
      for (const beforeFn of suite.beforeAllFns) {
        await beforeFn();
      }

      for (const test of suite.tests) {
        const testStart = performance.now();
        let pass = true;
        let error = null;

        try {
          await test.fn();
        } catch (err) {
          pass = false;
          error = err;
        }

        const testDuration = Math.round((performance.now() - testStart) * 100) / 100;
        this.results.push({
          tier: suite.tier,
          suite: suite.name,
          name: test.name,
          pass,
          error: error ? error.message : null,
          stack: error && error.stack ? error.stack : null,
          duration: testDuration,
        });
      }

      for (const afterFn of suite.afterAllFns) {
        await afterFn();
      }
    }

    this.endTime = Date.now();
    return this.getSummary();
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.pass).length;
    const failed = this.results.filter((r) => !r.pass).length;
    const duration = this.endTime - this.startTime;
    const failures = this.results.filter((r) => !r.pass);

    const tierBreakdown = {};
    for (const r of this.results) {
      if (!tierBreakdown[r.tier]) {
        tierBreakdown[r.tier] = { total: 0, passed: 0, failed: 0 };
      }
      tierBreakdown[r.tier].total += 1;
      if (r.pass) tierBreakdown[r.tier].passed += 1;
      else tierBreakdown[r.tier].failed += 1;
    }

    return {
      total,
      passed,
      failed,
      duration,
      tierBreakdown,
      failures,
    };
  }
}

class Expectation {
  constructor(actual, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not() {
    return new Expectation(this.actual, !this.isNot);
  }

  _evaluate(condition, message) {
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      throw new Error(this.isNot ? `Expected NOT: ${message}` : message);
    }
  }

  toBe(expected) {
    this._evaluate(
      Object.is(this.actual, expected),
      `Expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`
    );
  }

  toEqual(expected) {
    const a = JSON.stringify(this.actual);
    const b = JSON.stringify(expected);
    this._evaluate(a === b, `Expected ${a} to equal ${b}`);
  }

  toBeGreaterThan(expected) {
    this._evaluate(
      this.actual > expected,
      `Expected ${this.actual} > ${expected}`
    );
  }

  toBeGreaterThanOrEqual(expected) {
    this._evaluate(
      this.actual >= expected,
      `Expected ${this.actual} >= ${expected}`
    );
  }

  toBeLessThan(expected) {
    this._evaluate(
      this.actual < expected,
      `Expected ${this.actual} < ${expected}`
    );
  }

  toBeLessThanOrEqual(expected) {
    this._evaluate(
      this.actual <= expected,
      `Expected ${this.actual} <= ${expected}`
    );
  }

  toMatch(regex) {
    const re = typeof regex === 'string' ? new RegExp(regex) : regex;
    this._evaluate(
      re.test(String(this.actual)),
      `Expected "${this.actual}" to match ${re}`
    );
  }

  toContain(expected) {
    if (typeof this.actual === 'string' || Array.isArray(this.actual)) {
      this._evaluate(
        this.actual.includes(expected),
        `Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(expected)}`
      );
    } else if (this.actual instanceof Set || this.actual instanceof Map) {
      this._evaluate(
        this.actual.has(expected),
        `Expected collection to contain key ${JSON.stringify(expected)}`
      );
    } else {
      throw new Error(`toContain unsupported on type ${typeof this.actual}`);
    }
  }

  toBeDefined() {
    this._evaluate(
      this.actual !== undefined,
      `Expected value to be defined, got undefined`
    );
  }

  toBeNull() {
    this._evaluate(
      this.actual === null,
      `Expected value to be null, got ${this.actual}`
    );
  }

  toBeTruthy() {
    this._evaluate(
      Boolean(this.actual),
      `Expected ${JSON.stringify(this.actual)} to be truthy`
    );
  }

  toBeFalsy() {
    this._evaluate(
      !this.actual,
      `Expected ${JSON.stringify(this.actual)} to be falsy`
    );
  }

  toThrow(expectedMessagePattern) {
    if (typeof this.actual !== 'function') {
      throw new Error(`toThrow requires a function, got ${typeof this.actual}`);
    }
    let threw = false;
    let thrownError = null;
    try {
      this.actual();
    } catch (err) {
      threw = true;
      thrownError = err;
    }
    if (!threw) {
      this._evaluate(false, `Expected function to throw, but it succeeded without error`);
    } else if (expectedMessagePattern) {
      const msg = thrownError ? thrownError.message : '';
      const matches = typeof expectedMessagePattern === 'string'
        ? msg.includes(expectedMessagePattern)
        : expectedMessagePattern.test(msg);
      this._evaluate(matches, `Expected error message "${msg}" to match ${expectedMessagePattern}`);
    }
  }
}

const defaultHarness = new TestHarness();

export function setTier(name) {
  defaultHarness.setTier(name);
}

export function describe(name, fn) {
  defaultHarness.describe(name, fn);
}

export function it(name, fn) {
  defaultHarness.it(name, fn);
}

export function expect(actual) {
  return new Expectation(actual);
}

export { defaultHarness, TestHarness };
