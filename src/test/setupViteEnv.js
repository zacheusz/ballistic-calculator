// Mock Vite's import.meta.env for Jest tests
/* global global */
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
