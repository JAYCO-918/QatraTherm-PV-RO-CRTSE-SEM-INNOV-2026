import type {
  DossierMetadata,
  EconomicSummary,
  HourlyDispatchRow,
  HourlyWeatherPoint,
  SimulationSummary,
  SystemConfig,
} from './types';

export interface CsvParseResult {
  ok: boolean;
  profile?: HourlyWeatherPoint[];
  error?: string;
}

export function parseHourlyWeatherCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    return { ok: false, error: 'Le fichier CSV doit contenir une ligne d’en-tête et 24 lignes horaires.' };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['hour', 'irradiance_wm2', 'ambient_temp_c', 'wind_ms', 'feed_temp_c', 'water_demand_m3'];
  for (const col of required) {
    if (!headers.includes(col)) {
      return {
        ok: false,
        error: `Colonne manquante : "${col}". Colonnes requises : ${required.join(', ')}`,
      };
    }
  }

  const idx = Object.fromEntries(required.map((c) => [c, headers.indexOf(c)]));
  const rows: HourlyWeatherPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < required.length) continue;

    const hour = Number(parts[idx.hour]);
    const irradianceWm2 = Number(parts[idx.irradiance_wm2]);
    const ambientTempC = Number(parts[idx.ambient_temp_c]);
    const windSpeedMs = Number(parts[idx.wind_ms]);
    const rawFeedTempC = Number(parts[idx.feed_temp_c]);
    const waterDemandM3 = Number(parts[idx.water_demand_m3]);

    if (
      [hour, irradianceWm2, ambientTempC, windSpeedMs, rawFeedTempC, waterDemandM3].some((v) =>
        Number.isNaN(v)
      )
    ) {
      return { ok: false, error: `Valeur numérique invalide à la ligne ${i + 1}.` };
    }
    if (hour < 0 || hour > 23) {
      return { ok: false, error: `Heure invalide (${hour}) à la ligne ${i + 1} (attendu 0..23).` };
    }
    if (irradianceWm2 < 0 || irradianceWm2 > 1400) {
      return { ok: false, error: `Irradiance hors plage physique (${irradianceWm2} W/m²) à la ligne ${i + 1}.` };
    }

    rows.push({
      hour: Math.round(hour),
      irradianceWm2,
      ambientTempC,
      windSpeedMs: Math.max(0.1, windSpeedMs),
      rawFeedTempC,
      waterDemandM3: Math.max(0, waterDemandM3),
    });
  }

  if (rows.length !== 24) {
    return {
      ok: false,
      error: `24 points horaires requis (0..23), trouvé ${rows.length} lignes valides.`,
    };
  }

  rows.sort((a, b) => a.hour - b.hour);
  return { ok: true, profile: rows };
}

export function exportWeatherProfileCsv(profile: HourlyWeatherPoint[]): string {
  const header = 'hour,irradiance_wm2,ambient_temp_c,wind_ms,feed_temp_c,water_demand_m3';
  const lines = profile.map(
    (p) => `${p.hour},${p.irradianceWm2},${p.ambientTempC},${p.windSpeedMs},${p.rawFeedTempC},${p.waterDemandM3}`
  );
  return [header, ...lines].join('\n');
}

export function exportSimulationResultsCsv(hourly: HourlyDispatchRow[]): string {
  const header =
    'hour,irradiance_wm2,ambient_temp_c,cell_temp_c,feed_temp_c,pv_power_kw,thermal_recovered_kw,permeate_m3_h,demand_m3_h,ro_power_kw,grid_import_kw,battery_soc_pct,tank_level_m3,applied_pressure_bar,sec_kwh_m3,permeate_tds_mgl';
  const lines = hourly.map(
    (r) =>
      `${r.hour},${r.irradianceWm2},${r.ambientTempC},${r.cellTempC},${r.feedTempC},${r.pvPowerKw},${r.thermalRecoveredKw},${r.permeateFlowM3h},${r.demandM3h},${r.roPowerKw},${r.gridImportKw},${r.batterySocPct},${r.tankLevelM3},${r.appliedPressureBar},${r.secKwhPerM3},${r.permeateTdsMgL}`
  );
  return [header, ...lines].join('\n');
}

export function generateSubmissionMarkdown(params: {
  meta: DossierMetadata;
  siteName: string;
  config: SystemConfig;
  sim: SimulationSummary;
  econ: EconomicSummary;
}): string {
  const { meta, siteName, config, sim, econ } = params;
  return `# Dossier de Candidature — CRTSE · INC-MATENG SEM'INNOV 2026

## 1. Identification du Projet
- **Nom du projet :** ${meta.projectName}
- **Axe choisi :** Axe ${meta.axis}
- **Niveau de maturité (TRL) :** TRL ${meta.trlLevel} / 9
- **Porteur de projet :** ${meta.teamLead} (${meta.institution})
- **Équipe :** ${meta.teamMembers}
- **Wilaya / Site d'étude :** ${siteName} (${meta.wilaya})
- **Contact :** ${meta.email}

## 2. Résumé Technique & Innovation (Couplage Silicium PV-T + Osmose Inverse + MPC)
- **Surface capteur PV-T :** ${config.arrayAreaM2} m² (rendement STC ${(config.pvNominalEfficiency * 100).toFixed(1)}%, coefficient thermique ${(config.tempCoeffPower * 100).toFixed(2)}%/°C)
- **Salinité eau brute :** ${config.feedSalinityMgL.toLocaleString('fr-FR')} mg/L | **Taux de conversion :** ${(config.recoveryRatio * 100).toFixed(0)}%
- **Surface membranaire TFC :** ${config.membraneAreaM2} m²

### Résultats Physiques Calculés (Comparaison vs Référence non-refroidie)
| Indicateur | Référence PV+RO | QatraTherm PV-T+RO+MPC | Gain / Écart |
| --- | --- | --- | --- |
| Température pic cellule Si | ${sim.baselineUncooled.peakCellTempC} °C | ${sim.optimizedSystem.peakCellTempC} °C | -${sim.optimizedSystem.avgCellTempDeltaC} °C (moy.) |
| Production PV journalière | ${sim.baselineUncooled.dailyPvEnergyKwh} kWh/j | ${sim.optimizedSystem.dailyPvEnergyKwh} kWh/j | +${sim.gains.pvYieldGainPct}% |
| Chaleur récupérée sur eau brute | 0 kWh_th/j | ${sim.optimizedSystem.dailyThermalRecoveredKwh} kWh_th/j | Préchauffage à ${sim.optimizedSystem.avgFeedTempC} °C |
| Consommation spécifique (SEC) | ${sim.baselineUncooled.avgSecKwhPerM3} kWh/m³ | ${sim.optimizedSystem.avgSecKwhPerM3} kWh/m³ | -${sim.gains.secReductionPct}% |
| Eau potable produite | ${sim.baselineUncooled.dailyWaterM3} m³/j | ${sim.optimizedSystem.dailyWaterM3} m³/j | Couverture ${sim.optimizedSystem.demandCoveragePct}% |
| TDS perméat (Norme OMS < 500) | ${sim.baselineUncooled.avgPermeateTdsMgL} mg/L | ${sim.optimizedSystem.avgPermeateTdsMgL} mg/L | ${sim.optimizedSystem.whoCompliantAllHours ? 'Conforme OMS' : 'Hors norme'} |
| Import réseau journalier | ${sim.baselineUncooled.dailyGridImportKwh} kWh/j | ${sim.optimizedSystem.dailyGridImportKwh} kWh/j | -${sim.gains.gridImportReductionPct}% |

## 3. Viabilité Économique & Valorisation
- **CAPEX brut :** ${econ.grossCapexDzd.toLocaleString('fr-FR')} DZD
- **CAPEX net (après subvention) :** ${econ.netCapexDzd.toLocaleString('fr-FR')} DZD
- **OPEX annuel :** ${econ.annualOpexDzd.toLocaleString('fr-FR')} DZD/an
- **Coût actualisé de l'eau (LCOW) :** ${econ.lcowDzdPerM3} DZD/m³ (${econ.lcowUsdPerM3} USD/m³) vs ${econ.baselineLcowDzdPerM3} DZD/m³ référence
- **Temps de retour simple :** ${econ.simplePaybackYears} ans
- **VAN (15 ans) :** ${econ.npv15YearsDzd.toLocaleString('fr-FR')} DZD | **TRI :** ${econ.irrApproxPct}%
- **Impact CO2 évité :** ${sim.gains.co2AvoidedTonnesYear} tonnes CO2/an
- **Valorisation saumure :** ${sim.optimizedSystem.recoverableSaltKgDay} kg/j sels cristallisables (~${sim.optimizedSystem.recoverableMgKgDay} kg/j Mg2+)
`;
}
