import type { AlgerianSitePreset, HourlyWeatherPoint, SystemConfig, EconomicParams } from './types';

function buildDiurnalProfile(params: {
  peakIrradiance: number;
  sunriseHour: number;
  sunsetHour: number;
  tMin: number;
  tMax: number;
  windBase: number;
  rawFeedTemp: number;
  dailyDemandM3: number;
}): HourlyWeatherPoint[] {
  const {
    peakIrradiance,
    sunriseHour,
    sunsetHour,
    tMin,
    tMax,
    windBase,
    rawFeedTemp,
    dailyDemandM3,
  } = params;

  // Realistic municipal/agricultural demand weights summing to 1.0
  const demandWeights = [
    0.018, 0.015, 0.014, 0.014, 0.018, 0.028,
    0.048, 0.068, 0.072, 0.064, 0.056, 0.054,
    0.058, 0.056, 0.050, 0.048, 0.054, 0.064,
    0.068, 0.062, 0.046, 0.032, 0.024, 0.019,
  ];
  const weightSum = demandWeights.reduce((a, b) => a + b, 0);

  const dayLength = sunsetHour - sunriseHour;
  return Array.from({ length: 24 }, (_, hour) => {
    let irradianceWm2 = 0;
    if (hour >= sunriseHour && hour <= sunsetHour) {
      const phase = ((hour - sunriseHour) / dayLength) * Math.PI;
      irradianceWm2 = Math.round(peakIrradiance * Math.pow(Math.sin(phase), 1.18));
    }

    // Peak temperature lags solar noon by ~2.5 hours (around 14:30)
    const tempPhase = ((hour - 4.5) / 24) * 2 * Math.PI;
    const normTemp = 0.5 - 0.5 * Math.cos(tempPhase);
    const ambientTempC = Number((tMin + (tMax - tMin) * normTemp).toFixed(1));

    // Afternoon thermal wind increase
    const windSpeedMs = Number((windBase + 1.4 * Math.max(0, Math.sin(((hour - 8) / 14) * Math.PI))).toFixed(1));

    // Aquifer/sea water varies only slightly over 24h (+/- 0.6 C)
    const rawFeedTempC = Number((rawFeedTemp + 0.6 * Math.sin(((hour - 10) / 24) * 2 * Math.PI)).toFixed(1));

    const waterDemandM3 = Number(((dailyDemandM3 * demandWeights[hour]) / weightSum).toFixed(2));

    return {
      hour,
      irradianceWm2,
      ambientTempC,
      windSpeedMs,
      rawFeedTempC,
      waterDemandM3,
    };
  });
}

export const ALGERIAN_SITE_PRESETS: AlgerianSitePreset[] = [
  {
    id: 'ouargla-albien',
    nameFr: 'Ouargla — Nappe Albienne (Saumâtre)',
    nameEn: 'Ouargla — Albian Aquifer (Brackish)',
    wilaya: 'Ouargla',
    waterSourceFr: 'Forage saumâtre continental (4 200 mg/L)',
    waterSourceEn: 'Continental brackish borehole (4,200 mg/L)',
    latitude: 31.95,
    longitude: 5.33,
    feedSalinityMgL: 4200,
    defaultRecoveryRatio: 0.72,
    waterBenchmarkDzdM3: 185,
    hourlyProfile: buildDiurnalProfile({
      peakIrradiance: 985,
      sunriseHour: 6,
      sunsetHour: 18,
      tMin: 21.0,
      tMax: 41.5,
      windBase: 2.6,
      rawFeedTemp: 23.5,
      dailyDemandM3: 32,
    }),
  },
  {
    id: 'algiers-med',
    nameFr: 'Alger — Littoral Méditerranéen (Eau de mer)',
    nameEn: 'Algiers — Mediterranean Coast (Seawater)',
    wilaya: 'Alger',
    waterSourceFr: 'Eau de mer côtière (35 500 mg/L)',
    waterSourceEn: 'Coastal seawater (35,500 mg/L)',
    latitude: 36.75,
    longitude: 3.06,
    feedSalinityMgL: 35500,
    defaultRecoveryRatio: 0.44,
    waterBenchmarkDzdM3: 165,
    hourlyProfile: buildDiurnalProfile({
      peakIrradiance: 870,
      sunriseHour: 6,
      sunsetHour: 18,
      tMin: 16.5,
      tMax: 29.0,
      windBase: 3.4,
      rawFeedTemp: 19.5,
      dailyDemandM3: 24,
    }),
  },
  {
    id: 'biskra-agro',
    nameFr: 'Biskra — Ziban Serres Agricoles (Saumâtre)',
    nameEn: 'Biskra — Ziban Greenhouse Irrigation (Brackish)',
    wilaya: 'Biskra',
    waterSourceFr: 'Nappe phréatique agricole (3 100 mg/L)',
    waterSourceEn: 'Agricultural brackish aquifer (3,100 mg/L)',
    latitude: 34.85,
    longitude: 5.73,
    feedSalinityMgL: 3100,
    defaultRecoveryRatio: 0.75,
    waterBenchmarkDzdM3: 145,
    hourlyProfile: buildDiurnalProfile({
      peakIrradiance: 940,
      sunriseHour: 6,
      sunsetHour: 18,
      tMin: 19.0,
      tMax: 37.5,
      windBase: 2.9,
      rawFeedTemp: 21.0,
      dailyDemandM3: 36,
    }),
  },
  {
    id: 'adrar-sahara',
    nameFr: 'Adrar — Touat Hyper-Aride (Saumâtre)',
    nameEn: 'Adrar — Touat Hyper-Arid (Brackish)',
    wilaya: 'Adrar',
    waterSourceFr: 'Nappe du Continental Intercalaire (2 600 mg/L)',
    waterSourceEn: 'Continental Intercalaire aquifer (2,600 mg/L)',
    latitude: 27.87,
    longitude: -0.29,
    feedSalinityMgL: 2600,
    defaultRecoveryRatio: 0.76,
    waterBenchmarkDzdM3: 230,
    hourlyProfile: buildDiurnalProfile({
      peakIrradiance: 1035,
      sunriseHour: 6,
      sunsetHour: 18,
      tMin: 23.0,
      tMax: 44.5,
      windBase: 3.1,
      rawFeedTemp: 24.5,
      dailyDemandM3: 38,
    }),
  },
  {
    id: 'oran-industrial',
    nameFr: 'Oran — Arzew Littoral Industriel (Eau de mer)',
    nameEn: 'Oran — Arzew Industrial Coast (Seawater)',
    wilaya: 'Oran',
    waterSourceFr: 'Eau de mer salinité élevée (36 800 mg/L)',
    waterSourceEn: 'High-salinity seawater (36,800 mg/L)',
    latitude: 35.85,
    longitude: -0.32,
    feedSalinityMgL: 36800,
    defaultRecoveryRatio: 0.42,
    waterBenchmarkDzdM3: 175,
    hourlyProfile: buildDiurnalProfile({
      peakIrradiance: 895,
      sunriseHour: 6,
      sunsetHour: 18,
      tMin: 17.5,
      tMax: 31.0,
      windBase: 3.6,
      rawFeedTemp: 20.0,
      dailyDemandM3: 22,
    }),
  },
];

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  siteId: 'ouargla-albien',
  arrayAreaM2: 80,
  pvNominalEfficiency: 0.214,
  tempCoeffPower: -0.0041,
  coolingEnabled: true,
  erdEnabled: true,
  mpcEnabled: true,
  recoveryRatio: 0.72,
  membraneAreaM2: 148,
  feedSalinityMgL: 4200,
  batteryCapacityKwh: 24,
  tankCapacityM3: 36,
  nominalDailyDemandM3: 32,
};

export const DEFAULT_ECONOMIC_PARAMS: EconomicParams = {
  gridTariffDzdPerKwh: 5.4, // Algerian commercial/industrial tariff benchmark DZD/kWh
  waterBenchmarkDzdPerM3: 185, // Alternative trucked/conventional potable water cost
  discountRate: 0.06,
  projectLifetimeYears: 15,
  exchangeRateDzdPerUsd: 134.5,
  subsidyRate: 0.2, // 20% ANVREDET / startup innovation grant
};
