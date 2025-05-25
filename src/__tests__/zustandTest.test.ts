import { act } from 'react';
import { useAppConfigStore } from '../stores/useAppConfigStore';

describe('Zustand Integration Tests', () => {
  // Reset store before each test
  beforeEach(() => {
    // Clear localStorage to start fresh
    localStorage.clear();
    
    // Reset the store state
    act(() => {
      useAppConfigStore.setState({
        theme: 'light',
        language: 'en',
        apiStage: 'prod',
        apiKey: '',
      });
    });
  });

  it('should update theme and persist to localStorage', () => {
    // Update theme to dark
    act(() => {
      useAppConfigStore.getState().setTheme('dark');
    });
    
    // Check store state
    expect(useAppConfigStore.getState().theme).toBe('dark');
    
    // Check localStorage persistence
    const storedData = localStorage.getItem('app-config-v2');
    expect(storedData).not.toBeNull();
    const stored = JSON.parse(storedData as string);
    expect(stored.state.theme).toBe('dark');
  });

  it('should update language and persist to localStorage', () => {
    // Update language to Polish
    act(() => {
      useAppConfigStore.getState().setLanguage('pl');
    });
    
    // Check store state
    expect(useAppConfigStore.getState().language).toBe('pl');
    
    // Check localStorage persistence
    const storedData = localStorage.getItem('app-config-v2');
    expect(storedData).not.toBeNull();
    const stored = JSON.parse(storedData as string);
    expect(stored.state.language).toBe('pl');
  });

  it('should update apiStage and persist to localStorage', () => {
    // Update apiStage to dev
    act(() => {
      useAppConfigStore.getState().setApiStage('dev');
    });
    
    // Check store state
    expect(useAppConfigStore.getState().apiStage).toBe('dev');
    
    // Check localStorage persistence
    const storedData = localStorage.getItem('app-config-v2');
    expect(storedData).not.toBeNull();
    const stored = JSON.parse(storedData as string);
    expect(stored.state.apiStage).toBe('dev');
  });

  it('should update apiKey and persist to localStorage', () => {
    const testKey = 'test-api-key-123';
    
    // Update apiKey
    act(() => {
      useAppConfigStore.getState().setApiKey(testKey);
    });
    
    // Check store state
    expect(useAppConfigStore.getState().apiKey).toBe(testKey);
    
    // Check localStorage persistence
    const storedData = localStorage.getItem('app-config-v2');
    expect(storedData).not.toBeNull();
    const stored = JSON.parse(storedData as string);
    expect(stored.state.apiKey).toBe(testKey);
  });

  it('should handle multiple updates in sequence', () => {
    // Make multiple updates
    act(() => {
      const store = useAppConfigStore.getState();
      store.setTheme('dark');
      store.setLanguage('pl');
      store.setApiStage('dev');
      store.setApiKey('multi-update-key');
    });
    
    // Check final state
    const state = useAppConfigStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.language).toBe('pl');
    expect(state.apiStage).toBe('dev');
    expect(state.apiKey).toBe('multi-update-key');
    
    // Check localStorage persistence
    const storedData = localStorage.getItem('app-config-v2');
    expect(storedData).not.toBeNull();
    const stored = JSON.parse(storedData as string);
    expect(stored.state.theme).toBe('dark');
    expect(stored.state.language).toBe('pl');
    expect(stored.state.apiStage).toBe('dev');
    expect(stored.state.apiKey).toBe('multi-update-key');
  });
});
