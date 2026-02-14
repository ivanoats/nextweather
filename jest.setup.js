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
// This prevents flaky tests caused by random behavior
let seed = 12345;
Math.random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};
