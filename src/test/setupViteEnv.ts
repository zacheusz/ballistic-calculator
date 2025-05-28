// Mock Vite's import.meta.env for Jest tests

// Define a custom property on the global object
interface CustomGlobal {
  importMeta: {
    env: {
      MODE: string;
      DEV: boolean;
      PROD: boolean;
      VITE_API_ENDPOINT: string;
      VITE_API_STAGE: string;
    };
  };
}

// Extend the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var importMeta: CustomGlobal['importMeta'];
}

// Set the global importMeta object
global.importMeta = {
  env: {
    MODE: 'test',
    DEV: true,
    PROD: false,
    VITE_API_ENDPOINT: 'https://api.calculator.snipe.technology',
    VITE_API_STAGE: 'test'
  }
};

export {}; // This is needed to make the file a module
