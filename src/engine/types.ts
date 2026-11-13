export type Language = 'fr' | 'en';

export interface HourlyWeatherPoint {
  hour: number; // 0..23
  irradianceWm2: number; // GHI/POA W/m2
  ambientTempC: number; // deg C
  windSpeedMs: number; // m/s
  rawFeedTempC: number; // deg C
  waterDemandM3: number; // m3/h
}

export interface AlgerianSitePreset {
  id: string;
  nameFr: string;
  nameEn: string;
  wilaya: string;
  waterSourceFr: string;
  waterSourceEn: string;
  latitude: number;
  longitude: number;
  feedSalinityMgL: number; // TDS mg/L
  defaultRecoveryRatio: number; // 0.25..0.78
  waterBenchmarkDzdM3: number; // Local trucked/conventional water cost DZD/m3
  hourlyProfile: HourlyWeatherPoint[];
}

export interface SystemConfig {
  siteId: string;
  arrayAreaM2: number; // PV-T collector area (m2)
  pvNominalEfficiency: number; // STC efficiency (e.g., 0.214)
  tempCoeffPower: number; // -0.0041 / degC
  coolingEnabled: boolean; // PV-T feedwater heat recovery active
  erdEnabled: boolean; // Isobaric pressure-exchanger ERD active
  mpcEnabled: boolean; // Predictive VFD + storage optimization active
  recoveryRatio: number; // RO recovery R
  membraneAreaM2: number; // Total active TFC membrane area (m2)
  feedSalinityMgL: number; // Overrideable TDS mg/L
  batteryCapacityKwh: number; // LiFePO4 buffer capacity (kWh)
  tankCapacityM3: number; // Elevated water storage tank (m3)
  nominalDailyDemandM3: number; // Target daily potable demand (m3/day)
}

export interface EconomicParams {
  gridTariffDzdPerKwh: number;
  waterBenchmarkDzdPerM3: number;
  discountRate: number; // e.g., 0.06
  projectLifetimeYears: number; // e.g., 15
  exchangeRateDzdPerUsd: number; // e.g., 134.5
  subsidyRate: number; // ANVREDET/startup grant share 0..0.5
}

export interface SolarStepResult {
  hour: number;
  irradianceWm2: number;
  ambientTempC: number;
  cellTempUncooledC: number;
  cellTempCooledC: number;
  pvPowerUncooledKw: number;
  pvPowerCooledKw: number;
  thermalRecoveredKw: number;
  warmFeedTempC: number;
}

export interface RoOperatingPoint {
  permeateFlowM3h: number;
  feedFlowM3h: number;
  brineFlowM3h: number;
  feedTempC: number;
  osmoticPressureFeedBar: number;
  osmoticPressureModBar: number;
  tcfViscosity: number;
  appliedPressureBar: number;
  hydraulicPumpPowerKw: number;
  auxPowerKw: number;
  totalPowerKw: number;
  secKwhPerM3: number;
  permeateTdsMgL: number;
  brineTdsMgL: number;
  whoCompliant: boolean;
}

export interface HourlyDispatchRow {
  hour: number;
  irradianceWm2: number;
  ambientTempC: number;
  cellTempC: number;
  feedTempC: number;
  pvPowerKw: number;
  thermalRecoveredKw: number;
  permeateFlowM3h: number;
  demandM3h: number;
  roPowerKw: number;
  gridImportKw: number;
  pvCurtailedKw: number;
  batterySocPct: number;
  tankLevelM3: number;
  appliedPressureBar: number;
  secKwhPerM3: number;
  permeateTdsMgL: number;
}

export interface SimulationSummary {
  baselineUncooled: {
    dailyPvEnergyKwh: number;
    dailyWaterM3: number;
    avgSecKwhPerM3: number;
    dailyGridImportKwh: number;
    peakCellTempC: number;
    avgFeedTempC: number;
    avgPermeateTdsMgL: number;
    avgPressureBar: number;
  };
  optimizedSystem: {
    dailyPvEnergyKwh: number;
    dailyThermalRecoveredKwh: number;
    dailyWaterM3: number;
    dailyDemandM3: number;
    demandCoveragePct: number;
    avgSecKwhPerM3: number;
    dailyGridImportKwh: number;
    peakCellTempC: number;
    avgCellTempDeltaC: number;
    avgFeedTempC: number;
    avgPermeateTdsMgL: number;
    avgPressureBar: number;
    whoCompliantAllHours: boolean;
    brineVolumeM3Day: number;
    recoverableSaltKgDay: number;
    recoverableMgKgDay: number;
  };
  gains: {
    pvYieldGainPct: number;
    secReductionPct: number;
    gridImportReductionPct: number;
    co2AvoidedTonnesYear: number;
  };
  hourly: HourlyDispatchRow[];
}

export interface EconomicSummary {
  capexBreakdown: {
    itemFr: string;
    itemEn: string;
    costDzd: number;
  }[];
  grossCapexDzd: number;
  netCapexDzd: number;
  annualOpexDzd: number;
  annualWaterM3: number;
  annualGridSavingsDzd: number;
  annualWaterValueDzd: number;
  annualBrineValorizationDzd: number;
  annualNetBenefitDzd: number;
  lcowDzdPerM3: number;
  lcowUsdPerM3: number;
  baselineLcowDzdPerM3: number;
  simplePaybackYears: number;
  npv15YearsDzd: number;
  irrApproxPct: number;
}

export interface DossierMetadata {
  projectName: string;
  teamLead: string;
  teamMembers: string;
  institution: string;
  email: string;
  wilaya: string;
  trlLevel: number;
  axis: '01' | '02' | '03';
}
