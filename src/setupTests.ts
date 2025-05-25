// setupTests.ts
// Jest setup for React Testing Library and other global test setup.
import '@testing-library/jest-dom';

// Mock Vite's import.meta.env for Jest tests
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.import = {
    meta: {
      env: {
        MODE: 'test',
        DEV: true,
        PROD: false,
        VITE_API_ENDPOINT: 'https://api.calculator.snipe.technology',
        VITE_API_STAGE: 'test'
      }
    }
  };
}

// For Node.js environment (outside of window context)
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.import = {
    meta: {
      env: {
        MODE: 'test',
        DEV: true,
        PROD: false,
        VITE_API_ENDPOINT: 'https://api.calculator.snipe.technology',
        VITE_API_STAGE: 'test'
      }
    }
  };
}
