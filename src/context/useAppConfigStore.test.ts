import { act } from 'react-dom/test-utils';
import { useAppConfigStore, Theme, ApiStage } from './useAppConfigStore';

// Disabled until Zustand is installed
// describe('useAppConfigStore', () => {
//   beforeEach(() => {
//     // Reset Zustand store state before each test
//     useAppConfigStore.setState({
//       theme: 'light',
//       language: 'en',
//       apiStage: 'prod',
//       apiKey: '',
//     });
//   });
//
//   it('should initialize with default values', () => {
//     const state = useAppConfigStore.getState();
//     expect(state.theme).toBe('light');
//     expect(state.language).toBe('en');
//     expect(state.apiStage).toBe('prod');
//     expect(state.apiKey).toBe('');
//   });
//
//   it('should update theme', () => {
//     act(() => {
//       useAppConfigStore.getState().setTheme('dark');
//     });
//     expect(useAppConfigStore.getState().theme).toBe('dark');
//   });
//
//   it('should update language', () => {
//     act(() => {
//       useAppConfigStore.getState().setLanguage('pl');
//     });
//     expect(useAppConfigStore.getState().language).toBe('pl');
//   });
//
//   it('should update apiStage', () => {
//     act(() => {
//       useAppConfigStore.getState().setApiStage('stage');
//     });
//     expect(useAppConfigStore.getState().apiStage).toBe('stage');
//   });
//
//   it('should update apiKey', () => {
//     act(() => {
//       useAppConfigStore.getState().setApiKey('test-key');
//     });
//     expect(useAppConfigStore.getState().apiKey).toBe('test-key');
//   });
// });
