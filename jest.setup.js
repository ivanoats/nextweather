// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill structuredClone for jsdom (needed by Chakra UI v3)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (val) => {
    if (val === undefined) return undefined
    if (val === null) return null
    if (typeof val !== 'object') return val
    return JSON.parse(JSON.stringify(val))
  }
}