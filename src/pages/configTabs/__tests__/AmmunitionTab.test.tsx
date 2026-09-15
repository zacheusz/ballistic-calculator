import { fireEvent, render, screen } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import AmmunitionTab from '../AmmunitionTab';
import { getDefaultConfig } from '../../../utils/ballisticsUtils';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
}));

describe('AmmunitionTab powder-temperature controls', () => {
  it('edits a typed coefficient and shows both supported unit systems', async () => {
    const onAmmoMeasurementChange = jest.fn();

    render(
      <SnackbarProvider>
        <AmmunitionTab
          ammunition={getDefaultConfig().ammo}
          onAmmoChange={jest.fn()}
          onAmmoMeasurementChange={onAmmoMeasurementChange}
          t={(key) => key}
        />
      </SnackbarProvider>
    );

    expect(screen.getByText('muzzleVelocityTemperatureCoefficient')).toBeInTheDocument();
    expect(screen.getByText('zeroPowderTemperature')).toBeInTheDocument();
    expect(screen.getByText('fps/°F')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('0'), { target: { value: '1.5' } });
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(onAmmoMeasurementChange).toHaveBeenCalledWith(
      'muzzleVelocityTemperatureCoefficient',
      { value: 1.5, unit: 'FEET_PER_SECOND_PER_FAHRENHEIT' }
    );
  });
});
