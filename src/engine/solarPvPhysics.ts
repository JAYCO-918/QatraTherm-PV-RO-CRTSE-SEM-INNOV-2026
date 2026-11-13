import type { SolarStepResult, SystemConfig } from './types';

export const SOLAR_CONSTANTS = {
  faimanU0: 25.0, // W/(m2*K)
  faimanU1: 6.84, // W*s/(m3*K)
  tauAlpha: 0.90, // PV glass-absorber optical product
  uHxCellToFluid: 42.0, // W/(m2*K) rear serpentine thermal conductance
  bosEfficiency: 0.94, // MPPT + DC bus + wiring efficiency
  maxSafeRoFeedTempC: 43.0, // Polyamide TFC membrane thermal ceiling (45C spec - 2C margin)
};

export function specificHeatSalineWater(tdsMgL: number): number {
  const salinityGPerL = Math.max(0, tdsMgL) / 1000;
  // Linearized Sharqawy correlation around 25-35 C: ~4184 - 4.5 * S(g/L) J/(kg*K)
  return Math.max(3850, 4184 - 4.5 * salinityGPerL);
}

export function waterDensityKgM3(tdsMgL: number, tempC: number): number {
  const sKgKg = Math.max(0, tdsMgL) / 1e6;
  const pureWater = 1000 - 0.0045 * Math.pow(tempC - 4, 2);
  return pureWater + 750 * sKgKg;
}

export function evaluateSolarStep(params: {
  hour: number;
  irradianceWm2: number;
  ambientTempC: number;
  windSpeedMs: number;
  rawFeedTempC: number;
  feedFlowM3h: number;
  config: SystemConfig;
}): SolarStepResult {
  const {
    hour,
    irradianceWm2,
    ambientTempC,
    windSpeedMs,
    rawFeedTempC,
    feedFlowM3h,
    config,
  } = params;

  const G = Math.max(0, irradianceWm2);
  const A = Math.max(1, config.arrayAreaM2);

  // 1. Standard Uncooled PV cell temperature (Faiman model)
  const cellTempUncooledC =
    G > 0
      ? ambientTempC + G / (SOLAR_CONSTANTS.faimanU0 + SOLAR_CONSTANTS.faimanU1 * Math.max(0.2, windSpeedMs))
      : ambientTempC;

  const tempFactorUncooled = Math.max(0.55, 1 + config.tempCoeffPower * (cellTempUncooledC - 25));
  const pvPowerUncooledKw =
    (G * A * config.pvNominalEfficiency * tempFactorUncooled * SOLAR_CONSTANTS.bosEfficiency) / 1000;

  // 2. PV-T Coupled Thermal Recovery & Cell Cooling (Hottel-Whillier-Bliss balance)
  let cellTempCooledC = cellTempUncooledC;
  let warmFeedTempC = rawFeedTempC;
  let thermalRecoveredKw = 0;

  if (config.coolingEnabled && feedFlowM3h > 0.05 && G > 20) {
    const rho = waterDensityKgM3(config.feedSalinityMgL, rawFeedTempC);
    const cp = specificHeatSalineWater(config.feedSalinityMgL);
    const massFlowKgS = (feedFlowM3h * rho) / 3600;
    const heatCapFlowWK = massFlowKgS * cp;

    const uLoss = 16.5 + 3.2 * Math.max(0.2, windSpeedMs);
    const fPrime = SOLAR_CONSTANTS.uHxCellToFluid / (SOLAR_CONSTANTS.uHxCellToFluid + uLoss);
    const ntu = (A * uLoss * fPrime) / Math.max(1e-6, heatCapFlowWK);
    const fR = (heatCapFlowWK / (A * uLoss)) * (1 - Math.exp(-ntu));

    const absorbedNonElectricalFlux = G * (SOLAR_CONSTANTS.tauAlpha - config.pvNominalEfficiency);
    const rawHeatGainW = A * fR * (absorbedNonElectricalFlux - uLoss * (rawFeedTempC - ambientTempC));
    const usefulHeatW = Math.max(0, rawHeatGainW);

    const deltaT = usefulHeatW / Math.max(1e-6, heatCapFlowWK);
    warmFeedTempC = Math.min(SOLAR_CONSTANTS.maxSafeRoFeedTempC, rawFeedTempC + deltaT);
    const actualHeatW = Math.max(0, (warmFeedTempC - rawFeedTempC) * heatCapFlowWK);
    thermalRecoveredKw = actualHeatW / 1000;

    const avgFluidTempC = 0.5 * (rawFeedTempC + warmFeedTempC);
    const cooledCandidate = avgFluidTempC + actualHeatW / (A * SOLAR_CONSTANTS.uHxCellToFluid);
    cellTempCooledC = Math.min(cellTempUncooledC, Math.max(rawFeedTempC + 1.0, cooledCandidate));
  }

  const tempFactorCooled = Math.max(0.55, 1 + config.tempCoeffPower * (cellTempCooledC - 25));
  const pvPowerCooledKw =
    (G * A * config.pvNominalEfficiency * tempFactorCooled * SOLAR_CONSTANTS.bosEfficiency) / 1000;

  return {
    hour,
    irradianceWm2: G,
    ambientTempC,
    cellTempUncooledC: Number(cellTempUncooledC.toFixed(2)),
    cellTempCooledC: Number(cellTempCooledC.toFixed(2)),
    pvPowerUncooledKw: Number(pvPowerUncooledKw.toFixed(3)),
    pvPowerCooledKw: Number(pvPowerCooledKw.toFixed(3)),
    thermalRecoveredKw: Number(thermalRecoveredKw.toFixed(3)),
    warmFeedTempC: Number(warmFeedTempC.toFixed(2)),
  };
}
