import { Measurement } from './ballistics';

/**
 * Interface for a single ballistic solution based on OpenAPI spec
 * 
 * @remarks
 * This interface represents the ballistic solution data for a specific range.
 * All measurement values should use the appropriate unit types as defined in the API spec.
 * 
 * @todo In future development, consider using the specialized measurement types:
 * - range: RangeMeasurement
 * - horizontalAdjustment: ScopeAdjustmentMeasurement
 * - verticalAdjustment: ScopeAdjustmentMeasurement
 * - energy: BulletEnergyMeasurement
 * - velocity: BulletVelocityMeasurement
 * - drop: ScopeAdjustmentMeasurement
 * - coroDrift: ScopeAdjustmentMeasurement
 * - lead: ScopeAdjustmentMeasurement
 * - spinDrift: ScopeAdjustmentMeasurement
 * - wind: ScopeAdjustmentMeasurement
 * - aeroJump: ScopeAdjustmentMeasurement
 */
export interface Solution {
  /** Horizontal distance from muzzle */
  range: Measurement;
  /** Scope/sight adjustment to counteract wind, Coriolis, spin drift */
  horizontalAdjustment: Measurement;
  /** Scope/sight adjustment to counteract drop and other vertical deviations */
  verticalAdjustment: Measurement;
  /** Time of flight in seconds from muzzle to current range */
  time: number;
  /** Bullet's kinetic energy */
  energy: Measurement;
  /** Total bullet velocity */
  velocity: Measurement;
  /** Ratio of bullet velocity to speed of sound */
  mach: number;
  /** Vertical displacement of the bullet relative to the sight line */
  drop: Measurement;
  /** Lateral deflection due to Earth's rotation */
  coroDrift: Measurement;
  /** Horizontal adjustment needed for moving targets */
  lead: Measurement;
  /** Lateral deflection due to bullet rotation */
  spinDrift: Measurement;
  /** Lateral deflection due to wind */
  wind: Measurement;
  /** Vertical deflection caused by crosswind acting on a spinning bullet */
  aeroJump: Measurement;
}

/**
 * Interface for ballistic solution response based on OpenAPI spec
 */
export interface SolutionCardResponse {
  solutions: Solution[];
}

/**
 * Interface for error response from API
 */
export interface ErrorResponse {
  error: string;
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
