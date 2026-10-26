import { BallisticsApiError } from './apiTypes';

describe('BallisticsApiError', () => {
  it('preserves legacy messages without structured data', () => {
    expect(new BallisticsApiError({ error: 'Invalid input' }).message).toBe('Invalid input');
  });

  it('retains structured data and renders zero-valued diagnostics', () => {
    const failure = {
      category: 'RANGE_UNREACHABLE' as const,
      pass: 'ZERO' as const,
      termination: 'FLIGHT_TIME_LIMIT' as const,
      reachedRangeYards: 0,
      stoppedTimeSeconds: 0,
    };
    const error = new BallisticsApiError({ error: 'Unreachable', failure });
    expect(error.failure).toBe(failure);
    expect(error.message).toContain('Pass: ZERO');
    expect(error.message).toContain('Termination: FLIGHT_TIME_LIMIT');
    expect(error.message).toContain('Reached: 0 yd');
    expect(error.message).toContain('Stopped: 0 s');
  });

  it('rounds diagnostic ranges and times for display only', () => {
    const failure = {
      category: 'RANGE_UNREACHABLE' as const,
      requestedRangeYards: 20000,
      reachedRangeYards: 7512.348238,
      stoppedTimeSeconds: 14.56789,
    };
    const error = new BallisticsApiError({ error: 'Unreachable', failure });
    expect(error.message).toBe('Unreachable — Reached: 7512.3 yd — Requested: 20000 yd — Stopped: 14.57 s');
    expect(error.failure?.reachedRangeYards).toBe(7512.348238);
  });

  it('falls back for non-JSON error bodies', () => {
    expect(new BallisticsApiError('<html>Bad gateway</html>').message).toBe('API Error');
  });

  it('identifies invalid input without parsing its message', () => {
    const error = new BallisticsApiError({
      error: 'Unknown standard',
      failure: { category: 'INVALID_INPUT', field: 'zeroAtmosphere.standardName' },
    });
    expect(error.message).toContain('Input: zeroAtmosphere.standardName');
  });
});
