import {
  RangeMeasurement,
  ScopeAdjustmentMeasurement,
  BulletEnergyMeasurement,
  BulletVelocityMeasurement,
  TimeOfFlightMeasurement
} from './ballistics';

/**
 * Interface for a single ballistic solution based on OpenAPI spec
 * 
 * @remarks
 * This interface represents the ballistic solution data for a specific range.
 * All measurement values use the specialized measurement types as defined in the API spec.
 */
export interface Solution {
  /** Horizontal distance from muzzle */
  range: RangeMeasurement;
  /** Scope/sight adjustment to counteract wind, Coriolis, spin drift */
  horizontalAdjustment: ScopeAdjustmentMeasurement;
  /** Scope/sight adjustment to counteract drop and other vertical deviations */
  verticalAdjustment: ScopeAdjustmentMeasurement;
  /** Time of flight from muzzle to current range */
  time: TimeOfFlightMeasurement;
  /** Bullet's kinetic energy */
  energy: BulletEnergyMeasurement;
  /** Total bullet velocity */
  velocity: BulletVelocityMeasurement;
  /** Ratio of bullet velocity to speed of sound */
  mach: number;
  /** Vertical displacement of the bullet relative to the sight line */
  drop: ScopeAdjustmentMeasurement;
  /** Lateral deflection due to Earth's rotation */
  coroDrift: ScopeAdjustmentMeasurement;
  /** Horizontal adjustment needed for moving targets */
  lead: ScopeAdjustmentMeasurement;
  /** Lateral deflection due to bullet rotation */
  spinDrift: ScopeAdjustmentMeasurement;
  /** Lateral deflection due to wind */
  wind: ScopeAdjustmentMeasurement;
  /** Vertical deflection caused by crosswind acting on a spinning bullet */
  aeroJump: ScopeAdjustmentMeasurement;
  /** Vertical deflection due to Earth's rotation affecting apparent gravity */
  corioJump: ScopeAdjustmentMeasurement;
}

/**
 * Interface for ballistic solution response based on OpenAPI spec
 */
export interface SolutionCardResponse {
  solutions: Solution[];
}

/**
 * Machine-readable cause of a failed calculation (OpenAPI `SolverFailure`).
 * Absent fields are omitted by the API. Ranges are yards; times are seconds.
 */
export interface SolverFailure {
  category: 'INVALID_INPUT' | 'RANGE_UNREACHABLE' | 'NUMERICAL' | 'INTERNAL';
  field?: string;
  pass?: 'REQUESTED_TRAJECTORY' | 'ZERO' | 'ROTATION_REFERENCE' | 'DROP_REFERENCE';
  termination?: 'DOWNRANGE_VELOCITY_LIMIT' | 'FLIGHT_TIME_LIMIT';
  requestedRangeYards?: number;
  reachedRangeYards?: number;
  stoppedTimeSeconds?: number;
}

/**
 * Interface for error response from API
 */
export interface ErrorResponse {
  error: string;
  failure?: SolverFailure;
}

const rounded = (value: number, digits: number): string => String(Number(value.toFixed(digits)));

/** Human-readable diagnostics for the alert; the structured data stays on the error. */
function describe(failure: SolverFailure | undefined): string[] {
  if (!failure) return [];
  const { field, pass, termination, reachedRangeYards, requestedRangeYards, stoppedTimeSeconds } = failure;
  const details: string[] = [];
  if (field) details.push(`Input: ${field}`);
  if (pass) details.push(`Pass: ${pass}`);
  if (termination) details.push(`Termination: ${termination}`);
  if (Number.isFinite(reachedRangeYards)) details.push(`Reached: ${rounded(reachedRangeYards!, 1)} yd`);
  if (Number.isFinite(requestedRangeYards)) details.push(`Requested: ${rounded(requestedRangeYards!, 1)} yd`);
  if (Number.isFinite(stoppedTimeSeconds)) details.push(`Stopped: ${rounded(stoppedTimeSeconds!, 2)} s`);
  return details;
}

/** An API error response; keeps the structured `failure` for callers that branch on it. */
export class BallisticsApiError extends Error {
  readonly failure?: SolverFailure;

  constructor(response: Partial<ErrorResponse> | string) {
    const body = typeof response === 'object' && response !== null ? response : {};
    super([body.error || 'API Error', ...describe(body.failure)].join(' — '));
    this.name = 'BallisticsApiError';
    this.failure = body.failure;
  }
}

/**
 * Interface for system info response based on OpenAPI spec
 */
export interface SystemInfoResponse {
  location?: string;
  environment?: string;
  javaVersion?: string;
  awsRegion?: string;
  functionName?: string;
  functionVersion?: string;
  build?: {
    version?: string;
    timestamp?: string;
    javaVersion?: string;
    git?: {
      branch?: string;
      commitId?: string;
      commitTime?: string;
    };
  };
}
