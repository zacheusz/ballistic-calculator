import { act } from 'react';

// Mock the environment module
jest.mock('../../utils/environment', () => ({
  getApiStage: jest.fn().mockReturnValue('test'),
  getApiEndpoint: jest.fn().mockReturnValue('https://api.calculator.snipe.technology')
}));

import { useAppConfigStore } from '../useAppConfigStore';

describe('useAppConfigStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAppConfigStore.setState({
      theme: 'light',
      language: 'en',
      apiStage: 'prod',
      apiKey: '',
    });
    // Clear localStorage for persistence tests
    window.localStorage.clear();
  });

  it('should initialize with default values', () => {
    const state = useAppConfigStore.getState();
    expect(state.theme).toBe('light');
    expect(state.language).toBe('en');
    expect(state.apiStage).toBe('prod');
    expect(state.apiKey).toBe('');
  });

  it('should update theme', () => {
    act(() => {
      useAppConfigStore.getState().setTheme('dark');
    });
    expect(useAppConfigStore.getState().theme).toBe('dark');
  });

  it('should update language', () => {
    act(() => {
      useAppConfigStore.getState().setLanguage('pl');
    });
    expect(useAppConfigStore.getState().language).toBe('pl');
  });

  it('should update apiStage', () => {
    act(() => {
      useAppConfigStore.getState().setApiStage('stage');
    });
    expect(useAppConfigStore.getState().apiStage).toBe('stage');
  });

  it('should update apiKey', () => {
    act(() => {
      useAppConfigStore.getState().setApiKey('test-key');
    });
    expect(useAppConfigStore.getState().apiKey).toBe('test-key');
  });

  it('should persist state changes to localStorage', () => {
    act(() => {
      useAppConfigStore.getState().setTheme('dark');
      useAppConfigStore.getState().setLanguage('fr');
      useAppConfigStore.getState().setApiStage('dev');
      useAppConfigStore.getState().setApiKey('persist-key');
    });
    // Force Zustand to flush to localStorage
    const persisted = window.localStorage.getItem('app-config-v2');
    expect(persisted).toContain('dark');
    expect(persisted).toContain('fr');
    expect(persisted).toContain('dev');
    expect(persisted).toContain('persist-key');
  });

  it('should allow resetting state and not leak between tests', () => {
    act(() => {
      useAppConfigStore.getState().setTheme('dark');
    });
    expect(useAppConfigStore.getState().theme).toBe('dark');
    // Reset
    useAppConfigStore.setState({ theme: 'light', language: 'en', apiStage: 'prod', apiKey: '' });
    expect(useAppConfigStore.getState().theme).toBe('light');
  });

  it('should handle multiple updates in sequence', () => {
    act(() => {
      useAppConfigStore.getState().setTheme('dark');
      useAppConfigStore.getState().setLanguage('es');
      useAppConfigStore.getState().setApiStage('test');
      useAppConfigStore.getState().setApiKey('multi-key');
    });
    const state = useAppConfigStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.language).toBe('es');
    expect(state.apiStage).toBe('test');
    expect(state.apiKey).toBe('multi-key');
  });

  it('should handle edge cases (empty string values)', () => {
    act(() => {
      useAppConfigStore.getState().setLanguage('');
      useAppConfigStore.getState().setApiKey('');
    });
    expect(useAppConfigStore.getState().language).toBe('');
    expect(useAppConfigStore.getState().apiKey).toBe('');
  });

  // TypeScript enforces valid values for theme and apiStage at compile-time, not runtime.
  // Runtime checks can be added if needed, but are not present in the current implementation.
  // Rehydration from localStorage cannot be tested in the same process due to module caching and Zustand's persistence mechanism.
  // For full rehydration tests, use integration tests or a test runner that spawns a new process per test.
});
