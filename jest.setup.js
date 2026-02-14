// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const nodeStructuredClone =
  globalThis.structuredClone ??
  ((value) => {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)); //NOSONAR
  });

// Polyfill structuredClone for jsdom (needed by Chakra UI v3)
if (globalThis.structuredClone === undefined) {
  globalThis.structuredClone = nodeStructuredClone;
}

// Seed Math.random() for deterministic tests
// This prevents flaky tests caused by random behavior in the forecast
// summary generator which uses pickRandom() to select natural language
// phrases. By seeding the RNG, we ensure consistent test results.
const DETERMINISTIC_TEST_SEED = 12345;
let seed = DETERMINISTIC_TEST_SEED;
Math.random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};
