import type { RoOperatingPoint } from './types';

export const RO_CONSTANTS = {
  gasConstantLBarMolK: 0.0831446,
  naclMolarMassGPerMol: 58.44,
  dissociationFactor: 1.92, // Van 't Hoff effective ion dissociation * osmotic coefficient
  arrheniusWaterCoeff: 2640, // K (polyamide TFC membrane permeability activation)
  arrheniusSaltCoeff: 2150, // K (salt transport temperature activation)
  // Brackish TFC membrane (BW30-style) vs Seawater high-rejection TFC (SW30HR-style)
  bwroWaterPermeabilityLMHBar: 3.6,
  bwroSaltPermeabilityLMH: 0.14,
  swroWaterPermeabilityLMHBar: 1.65,
  swroSaltPermeabilityLMH: 0.062,
  modulePressureDropBar: 1.2, // Spacer channel hydraulic loss
  erdEfficiency: 0.94, // Isobaric pressure exchanger efficiency
  erdBoosterDropBar: 1.2, // Circulation booster deltaP across ERD loop
  pumpEfficiency: 0.80, // High-pressure multistage/plunger pump hydraulic efficiency
  vfdMotorEfficiency: 0.96, // IE4 motor + VFD drive efficiency
  auxPowerPerM3hFeed: 0.12, // Low-pressure feed + pretreatment + dosing (kWh per m3 feed)
  whoPotabilityLimitMgL: 500, // WHO & Algerian drinking water TDS limit
};

export function selectMembraneSpecs(feedSalinityMgL: number): {
  typeLabel: 'BWRO-TFC' | 'SWRO-HR';
  aw25: number;
  bs25: number;
} {
  if (feedSalinityMgL > 15000) {
    return {
      typeLabel: 'SWRO-HR',
      aw25: RO_CONSTANTS.swroWaterPermeabilityLMHBar,
      bs25: RO_CONSTANTS.swroSaltPermeabilityLMH,
    };
  }
  return {
    typeLabel: 'BWRO-TFC',
    aw25: RO_CONSTANTS.bwroWaterPermeabilityLMHBar,
    bs25: RO_CONSTANTS.bwroSaltPermeabilityLMH,
  };
}

/**
 * Van 't Hoff osmotic pressure in bar for TDS (mg/L) at temperature T (deg C).
 */
export function computeOsmoticPressureBar(tdsMgL: number, tempC: number): number {
  const molarConcMolL = Math.max(0, tdsMgL) / (1000 * RO_CONSTANTS.naclMolarMassGPerMol);
  const tempK = tempC + 273.15;
  return RO_CONSTANTS.dissociationFactor * molarConcMolL * RO_CONSTANTS.gasConstantLBarMolK * tempK;
}

/**
 * Arrhenius Temperature Correction Factor (TCF) for water permeability through TFC RO membranes.
 */
export function computeWaterTcf(tempC: number): number {
  const tempK = tempC + 273.15;
  return Math.exp(RO_CONSTANTS.arrheniusWaterCoeff * (1 / 298.15 - 1 / tempK));
}

export function computeSaltTcf(tempC: number): number {
  const tempK = tempC + 273.15;
  return Math.exp(RO_CONSTANTS.arrheniusSaltCoeff * (1 / 298.15 - 1 / tempK));
}

export function evaluateRoOperatingPoint(params: {
  permeateFlowM3h: number;
  feedTempC: number;
  feedSalinityMgL: number;
  recoveryRatio: number;
  membraneAreaM2: number;
  erdEnabled: boolean;
}): RoOperatingPoint {
  const {
    permeateFlowM3h,
    feedTempC,
    feedSalinityMgL,
    recoveryRatio,
    membraneAreaM2,
    erdEnabled,
  } = params;

  const R = Math.min(0.82, Math.max(0.15, recoveryRatio));
  const A_m = Math.max(10, membraneAreaM2);
  const Q_p = Math.max(0, permeateFlowM3h);
  const membrane = selectMembraneSpecs(feedSalinityMgL);

  const osmoticPressureFeedBar = computeOsmoticPressureBar(feedSalinityMgL, feedTempC);
  const logMeanFactor = (Math.log(1 / (1 - R)) / R) * (1 + 0.22 * R);
  const osmoticPressureModBar = osmoticPressureFeedBar * logMeanFactor;
  const tcfViscosity = computeWaterTcf(feedTempC);

  if (Q_p <= 1e-6) {
    return {
      permeateFlowM3h: 0,
      feedFlowM3h: 0,
      brineFlowM3h: 0,
      feedTempC: Number(feedTempC.toFixed(2)),
      osmoticPressureFeedBar: Number(osmoticPressureFeedBar.toFixed(2)),
      osmoticPressureModBar: Number(osmoticPressureModBar.toFixed(2)),
      tcfViscosity: Number(tcfViscosity.toFixed(3)),
      appliedPressureBar: 0,
      hydraulicPumpPowerKw: 0,
      auxPowerKw: 0,
      totalPowerKw: 0,
      secKwhPerM3: 0,
      permeateTdsMgL: 0,
      brineTdsMgL: Number((feedSalinityMgL / (1 - R)).toFixed(0)),
      whoCompliant: true,
    };
  }

  const Q_f = Q_p / R;
  const Q_b = Q_f - Q_p;

  // Flux J_w in LMH (L/m2/h)
  const fluxLmh = (Q_p * 1000) / A_m;
  const effectiveAw = membrane.aw25 * tcfViscosity;
  const netDrivingPressureBar = fluxLmh / effectiveAw;

  const appliedPressureBar = netDrivingPressureBar + osmoticPressureModBar + RO_CONSTANTS.modulePressureDropBar;

  // Hydraulic power in kW: (Q[m3/h] * P[bar]) / 36
  const combinedEff = RO_CONSTANTS.pumpEfficiency * RO_CONSTANTS.vfdMotorEfficiency;
  let hydraulicPumpPowerKw = 0;

  if (erdEnabled) {
    const unrecoveredBrineWork = Q_b * (appliedPressureBar * (1 - RO_CONSTANTS.erdEfficiency) + RO_CONSTANTS.erdBoosterDropBar);
    hydraulicPumpPowerKw = (Q_p * appliedPressureBar + unrecoveredBrineWork) / (36 * combinedEff);
  } else {
    hydraulicPumpPowerKw = (Q_f * appliedPressureBar) / (36 * combinedEff);
  }

  const auxPowerKw = Q_f * RO_CONSTANTS.auxPowerPerM3hFeed;
  const totalPowerKw = hydraulicPumpPowerKw + auxPowerKw;
  const secKwhPerM3 = totalPowerKw / Q_p;

  // Solution-diffusion salt transport
  const effectiveBs = membrane.bs25 * computeSaltTcf(feedTempC);
  const avgModSalinityMgL = feedSalinityMgL * logMeanFactor;
  const permeateTdsMgL = (effectiveBs * avgModSalinityMgL) / (fluxLmh + effectiveBs);
  const brineTdsMgL = (Q_f * feedSalinityMgL - Q_p * permeateTdsMgL) / Math.max(1e-6, Q_b);

  return {
    permeateFlowM3h: Number(Q_p.toFixed(3)),
    feedFlowM3h: Number(Q_f.toFixed(3)),
    brineFlowM3h: Number(Q_b.toFixed(3)),
    feedTempC: Number(feedTempC.toFixed(2)),
    osmoticPressureFeedBar: Number(osmoticPressureFeedBar.toFixed(2)),
    osmoticPressureModBar: Number(osmoticPressureModBar.toFixed(2)),
    tcfViscosity: Number(tcfViscosity.toFixed(3)),
    appliedPressureBar: Number(appliedPressureBar.toFixed(2)),
    hydraulicPumpPowerKw: Number(hydraulicPumpPowerKw.toFixed(3)),
    auxPowerKw: Number(auxPowerKw.toFixed(3)),
    totalPowerKw: Number(totalPowerKw.toFixed(3)),
    secKwhPerM3: Number(secKwhPerM3.toFixed(3)),
    permeateTdsMgL: Number(permeateTdsMgL.toFixed(1)),
    brineTdsMgL: Number(brineTdsMgL.toFixed(0)),
    whoCompliant: permeateTdsMgL <= RO_CONSTANTS.whoPotabilityLimitMgL,
  };
}
