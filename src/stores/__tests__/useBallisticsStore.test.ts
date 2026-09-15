import { act } from 'react';
import useBallisticsStore from '../useBallisticsStore';
import { getDefaultConfig } from '../../utils/ballisticsUtils';

const STORAGE_KEY = 'ballistics-store-v3';

describe('useBallisticsStore atmosphere density model', () => {
  beforeEach(() => {
    window.localStorage.clear();
    act(() => {
      useBallisticsStore.getState().resetToDefault();
    });
  });

  it('uses and serializes the explicit ASHRAE ideal-gas default', () => {
    const state = useBallisticsStore.getState();

    expect(state.atmosphere.densityModel).toBe('ASHRAE_IDEAL_GAS');
    expect(state.toApiRequest().atmosphere.densityModel).toBe('ASHRAE_IDEAL_GAS');
  });

  it('serializes a selected density model without changing other atmosphere fields', () => {
    const originalAtmosphere = useBallisticsStore.getState().atmosphere;

    act(() => {
      useBallisticsStore.getState().updateAtmosphere({ densityModel: 'PARTIAL_PRESSURE' });
    });

    const requestAtmosphere = useBallisticsStore.getState().toApiRequest().atmosphere;
    expect(requestAtmosphere).toEqual({
      ...originalAtmosphere,
      densityModel: 'PARTIAL_PRESSURE',
    });
  });

  it('makes an omitted zero-atmosphere density model explicit in the request', () => {
    const zeroAtmosphere = { ...getDefaultConfig().atmosphere };
    delete zeroAtmosphere.densityModel;
    act(() => {
      useBallisticsStore.setState({ zeroAtmosphere });
    });

    expect(useBallisticsStore.getState().toApiRequest().zeroAtmosphere?.densityModel)
      .toBe('ASHRAE_IDEAL_GAS');
  });

  it('persists an explicit density-model selection', () => {
    act(() => {
      useBallisticsStore.getState().updateAtmosphere({ densityModel: 'MCCOY_IDEAL_GAS' });
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string);
    expect(stored.state.atmosphere.densityModel).toBe('MCCOY_IDEAL_GAS');
  });

  it('hydrates a pre-density-model atmosphere with the ASHRAE ideal-gas default', async () => {
    const legacyAtmosphere = { ...getDefaultConfig().atmosphere };
    delete legacyAtmosphere.densityModel;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: {
        atmosphere: legacyAtmosphere,
        zeroAtmosphere: legacyAtmosphere,
      },
      version: 0,
    }));

    await act(async () => {
      await useBallisticsStore.persist.rehydrate();
    });

    expect(useBallisticsStore.getState().atmosphere.densityModel).toBe('ASHRAE_IDEAL_GAS');
    expect(useBallisticsStore.getState().zeroAtmosphere?.densityModel).toBe('ASHRAE_IDEAL_GAS');
  });
});
