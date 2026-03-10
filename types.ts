export enum SimulationState {
  IDLE = 'IDLE',
  DROPPING = 'DROPPING',
  IMPACT = 'IMPACT',
  RESETTING = 'RESETTING'
}

export interface SimulationParams {
  armLength: number; // mm (Total length)
  armRadius: number; // mm (Radius of the arm)
  droneSize: number; // scale multiplier for the entire model
  mass: number; // grams
  dropHeight: number; // meters
}

export interface ChartDataPoint {
  time: number;
  accelCF: number;
  accelNiTi: number;
}