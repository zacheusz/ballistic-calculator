// Mock for import.meta.env in Jest tests
const env = {
  MODE: 'test',
  DEV: true,
  PROD: false,
  VITE_API_ENDPOINT: 'https://api.calculator.snipe.technology',
  VITE_API_STAGE: 'test'
};

export default env;
