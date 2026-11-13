import type { EconomicParams, EconomicSummary, SimulationSummary, SystemConfig } from './types';

export function computeEconomics(
  config: SystemConfig,
  sim: SimulationSummary,
  econ: EconomicParams
): EconomicSummary {
  const kwPeak = config.arrayAreaM2 * config.pvNominalEfficiency;

  // Realistic Algerian industrial/research BOM pricing in DZD (2026)
  const pvtArrayCost = kwPeak * 108000 + (config.coolingEnabled ? config.arrayAreaM2 * 14500 : 0);
  const roSkidMembraneCost = 950000 + config.membraneAreaM2 * 11500;
  const erdAndVfdPumpCost =
    (config.erdEnabled ? 680000 : 0) + (config.feedSalinityMgL > 15000 ? 740000 : 420000);
  const batteryCost = config.batteryCapacityKwh * 42000;
  const tankAndHydraulicsCost = 280000 + config.tankCapacityM3 * 16500;
  const edgeAiSensorsCost = config.mpcEnabled ? 340000 : 120000;

  const capexBreakdown = [
    {
      itemFr: config.coolingEnabled
        ? 'Champ PV-T Hybride (Silicium PERC + Échangeur thermique)'
        : 'Champ PV Standard (Silicium PERC)',
      itemEn: config.coolingEnabled
        ? 'Hybrid PV-T Array (PERC Silicon + Thermal Absorber)'
        : 'Standard PV Array (PERC Silicon)',
      costDzd: Math.round(pvtArrayCost),
    },
    {
      itemFr: 'Skid Osmose Inverse & Membranes TFC Polyamide',
      itemEn: 'Reverse Osmosis Skid & TFC Polyamide Membranes',
      costDzd: Math.round(roSkidMembraneCost),
    },
    {
      itemFr: config.erdEnabled
        ? 'Pompe Haute Pression VFD + Récupérateur d\'Énergie (ERD)'
        : 'Pompe Haute Pression Standard',
      itemEn: config.erdEnabled
        ? 'VFD High-Pressure Pump + Isobaric Energy Recovery (ERD)'
        : 'Standard High-Pressure Pump',
      costDzd: Math.round(erdAndVfdPumpCost),
    },
    {
      itemFr: 'Stockage Électrochimique LiFePO4 (Tampon solaire)',
      itemEn: 'LiFePO4 Battery Buffer Bank',
      costDzd: Math.round(batteryCost),
    },
    {
      itemFr: 'Réservoir Tampon Eau Potable & Prétraitement',
      itemEn: 'Potable Buffer Tank & Pretreatment Unit',
      costDzd: Math.round(tankAndHydraulicsCost),
    },
    {
      itemFr: 'Contrôleur Edge MPC, Capteurs TDS/Débit/Température',
      itemEn: 'Edge MPC Controller, TDS/Flow/Thermal Sensors',
      costDzd: Math.round(edgeAiSensorsCost),
    },
  ];

  const grossCapexDzd = capexBreakdown.reduce((acc, item) => acc + item.costDzd, 0);
  const netCapexDzd = Math.round(grossCapexDzd * (1 - Math.min(0.6, Math.max(0, econ.subsidyRate))));

  // Annual operations (350 operating days/year accounting for scheduled CIP cleaning)
  const operatingDays = 350;
  const annualWaterM3 = sim.optimizedSystem.dailyWaterM3 * operatingDays;
  const annualGridImportDzd = sim.optimizedSystem.dailyGridImportKwh * operatingDays * econ.gridTariffDzdPerKwh;
  const annualMembraneAndFilterDzd = config.membraneAreaM2 * 2600 + annualWaterM3 * 6.5;
  const annualMaintenanceDzd = grossCapexDzd * 0.018;
  const annualOpexDzd = Math.round(annualGridImportDzd + annualMembraneAndFilterDzd + annualMaintenanceDzd);

  // Capital Recovery Factor (CRF) for LCOW
  const r = Math.max(0.005, econ.discountRate);
  const n = Math.max(3, econ.projectLifetimeYears);
  const crf = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const annualizedCapex = netCapexDzd * crf;
  const lcowDzdPerM3 = annualWaterM3 > 0 ? (annualizedCapex + annualOpexDzd) / annualWaterM3 : 0;
  const lcowUsdPerM3 = lcowDzdPerM3 / Math.max(1, econ.exchangeRateDzdPerUsd);

  // Baseline grid-only / unoptimized LCOW comparison
  const baselineAnnualWater = Math.max(1, sim.baselineUncooled.dailyWaterM3 * operatingDays);
  const baselineGridCost = sim.baselineUncooled.dailyGridImportKwh * operatingDays * econ.gridTariffDzdPerKwh;
  const baselineGrossCapex = grossCapexDzd * 0.86;
  const baselineOpex = baselineGridCost + config.membraneAreaM2 * 2600 + baselineAnnualWater * 6.5 + baselineGrossCapex * 0.022;
  const baselineLcowDzdPerM3 = (baselineGrossCapex * crf + baselineOpex) / baselineAnnualWater;

  const annualWaterValueDzd = Math.round(annualWaterM3 * econ.waterBenchmarkDzdPerM3);
  const annualGridSavingsDzd = Math.round(
    Math.max(0, (sim.baselineUncooled.dailyGridImportKwh - sim.optimizedSystem.dailyGridImportKwh) * operatingDays * econ.gridTariffDzdPerKwh)
  );
  // Conservative net brine mineral recovery credit after solar evaporation pond OPEX
  // Inland brackish ponds recover ~1.8 DZD/kg net; coastal seawater slipstream recovery (10% pilot stream) ~1.2 DZD/kg net
  const isSeawater = config.feedSalinityMgL > 15000;
  const recoverableShare = isSeawater ? 0.1 : 1.0;
  const netMarginDzdPerKg = isSeawater ? 1.2 : 1.8;
  const annualBrineValorizationDzd = Math.round(
    sim.optimizedSystem.recoverableSaltKgDay * operatingDays * recoverableShare * netMarginDzdPerKg
  );

  const annualNetBenefitDzd = Math.round(
    annualWaterValueDzd + annualBrineValorizationDzd - annualOpexDzd
  );

  const simplePaybackYears =
    annualNetBenefitDzd > 0 ? Number((netCapexDzd / annualNetBenefitDzd).toFixed(2)) : 99;

  // 15-year NPV
  let pvCashFlows = 0;
  for (let year = 1; year <= n; year++) {
    pvCashFlows += annualNetBenefitDzd / Math.pow(1 + r, year);
  }
  const npv15YearsDzd = Math.round(pvCashFlows - netCapexDzd);

  // Approximate IRR via bisection over [0%, 100%]
  let lo = 0;
  let hi = 1.0;
  for (let iter = 0; iter < 30; iter++) {
    const mid = (lo + hi) / 2;
    let npv = -netCapexDzd;
    for (let y = 1; y <= n; y++) {
      npv += annualNetBenefitDzd / Math.pow(1 + mid, y);
    }
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  const irrApproxPct = Number((((lo + hi) / 2) * 100).toFixed(1));

  return {
    capexBreakdown,
    grossCapexDzd,
    netCapexDzd,
    annualOpexDzd,
    annualWaterM3: Math.round(annualWaterM3),
    annualGridSavingsDzd,
    annualWaterValueDzd,
    annualBrineValorizationDzd,
    annualNetBenefitDzd,
    lcowDzdPerM3: Number(lcowDzdPerM3.toFixed(1)),
    lcowUsdPerM3: Number(lcowUsdPerM3.toFixed(3)),
    baselineLcowDzdPerM3: Number(baselineLcowDzdPerM3.toFixed(1)),
    simplePaybackYears,
    npv15YearsDzd,
    irrApproxPct,
  };
}
