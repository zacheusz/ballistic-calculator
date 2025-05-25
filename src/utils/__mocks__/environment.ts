/**
 * Mock implementation of the environment module for tests
 */

// In tests, we want to use 'test' as the API stage
export const getApiStage = jest.fn().mockReturnValue('test');

// Use the same API endpoint as production
export const getApiEndpoint = jest.fn().mockReturnValue('https://api.calculator.snipe.technology');
