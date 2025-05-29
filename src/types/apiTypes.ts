import { 
  RangeMeasurement,
  ScopeAdjustmentMeasurement,
  BulletEnergyMeasurement,
  BulletVelocityMeasurement
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
  /** Time of flight in seconds from muzzle to current range */
  time: number;
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
