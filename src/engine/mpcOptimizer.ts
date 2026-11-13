import { evaluateRoOperatingPoint } from './roDesalinationPhysics';
import { evaluateSolarStep } from './solarPvPhysics';
import type {
  HourlyDispatchRow,
  HourlyWeatherPoint,
  SimulationSummary,
  SystemConfig,
} from './types';

function simulateDispatchSchedule(params: {
  profile: HourlyWeatherPoint[];
  config: SystemConfig;
  coolingEnabled: boolean;
  erdEnabled: boolean;
  mpcEnabled: boolean;
}): {
  hourly: HourlyDispatchRow[];
  dailyPvEnergyKwh: number;
  dailyThermalRecoveredKwh: number;
  dailyWaterM3: number;
  dailyDemandM3: number;
  dailyGridImportKwh: number;
  peakCellTempC: number;
  avgCellTempC: number;
  avgFeedTempC: number;
  avgSecKwhPerM3: number;
  avgPermeateTdsMgL: number;
  avgPressureBar: number;
  whoCompliantAllHours: boolean;
} {
  const { profile, config, coolingEnabled, erdEnabled, mpcEnabled } = params;

  const effConfig: SystemConfig = {
    ...config,
    coolingEnabled,
    erdEnabled,
    mpcEnabled,
  };

  const rawDemandSum = profile.reduce((acc, p) => acc + p.waterDemandM3, 0) || 1;
  const demandScale = config.nominalDailyDemandM3 / rawDemandSum;
  const scaledDemands = profile.map((p) => p.waterDemandM3 * demandScale);
  const totalDemandM3 = scaledDemands.reduce((a, b) => a + b, 0);

  // Max safe membrane flux ~28 LMH -> max permeate flow
  const maxPermeateM3h = Math.max(1.2, (config.membraneAreaM2 * 28) / 1000);
  const minOperatingM3h = 0.32 * maxPermeateM3h;
  // Best-efficiency flux band (~17-20 LMH) minimizes NDP while using warm solar hours
  const optimalFluxM3h = Math.min(maxPermeateM3h, (config.membraneAreaM2 * 19.5) / 1000);

  let plannedFlows: number[] = [];

  if (!mpcEnabled) {
    // Baseline unoptimized fixed-speed schedule: constant 16h daytime/evening run (06:00..21:00)
    const activeHours = 16;
    const flatRate = Math.min(maxPermeateM3h, Math.max(minOperatingM3h, totalDemandM3 / activeHours));
    plannedFlows = profile.map((_, h) => (h >= 6 && h < 6 + activeHours ? flatRate : 0));
  } else {
    // MPC Predictive Dispatch:
    // Score each hour by available PV power + thermal preheating advantage + battery-supported evening shoulder
    const hourlyScores = profile.map((pt) => {
      const solar = evaluateSolarStep({
        hour: pt.hour,
        irradianceWm2: pt.irradianceWm2,
        ambientTempC: pt.ambientTempC,
        windSpeedMs: pt.windSpeedMs,
        rawFeedTempC: pt.rawFeedTempC,
        feedFlowM3h: optimalFluxM3h / Math.max(0.2, config.recoveryRatio),
        config: effConfig,
      });
      const pvKw = coolingEnabled ? solar.pvPowerCooledKw : solar.pvPowerUncooledKw;
      const thermalBonus = coolingEnabled ? 1 + (solar.warmFeedTempC - pt.rawFeedTempC) * 0.025 : 1;
      return pvKw * thermalBonus;
    });

    // Allocate across top solar/warm hours capped near optimalFluxM3h first to minimize SEC & grid import
    const rankedHours = hourlyScores
      .map((score, hour) => ({ hour, score }))
      .sort((a, b) => b.score - a.score);

    plannedFlows = new Array(24).fill(0);
    let remainingM3 = totalDemandM3;

    // Pass 1: Fill highest-solar hours up to optimalFluxM3h (keeps NDP low & maximizes direct PV self-consumption)
    for (const { hour, score } of rankedHours) {
      if (remainingM3 <= 1e-4) break;
      if (score < 0.4) continue;
      const assign = Math.min(optimalFluxM3h, remainingM3);
      if (assign >= minOperatingM3h) {
        plannedFlows[hour] = assign;
        remainingM3 -= assign;
      }
    }

    // Pass 2: If demand remains, use remaining solar headroom or battery-backed shoulder hours (17..20, 6..8)
    if (remainingM3 > 0.05) {
      for (const { hour } of rankedHours) {
        if (remainingM3 <= 1e-4) break;
        const cap = maxPermeateM3h;
        const current = plannedFlows[hour];
        if (current === 0 && remainingM3 >= minOperatingM3h) {
          const assign = Math.min(optimalFluxM3h, remainingM3);
          plannedFlows[hour] = assign;
          remainingM3 -= assign;
        } else if (current > 0 && current < cap) {
          const add = Math.min(cap - current, remainingM3);
          plannedFlows[hour] += add;
          remainingM3 -= add;
        }
      }
    }

    // Pass 3: Tank Feasibility Guard across 24h horizon [0.08 * V_tank, V_tank]
    const tankCap = Math.max(5, config.tankCapacityM3);
    const minTank = 0.08 * tankCap;
    let simTank = 0.45 * tankCap;
    for (let h = 0; h < 24; h++) {
      simTank = simTank + plannedFlows[h] - scaledDemands[h];
      if (simTank < minTank) {
        const needed = minTank - simTank;
        const headroom = maxPermeateM3h - plannedFlows[h];
        const add = Math.min(headroom, needed);
        const target = plannedFlows[h] === 0 ? Math.min(maxPermeateM3h, Math.max(minOperatingM3h, add)) : plannedFlows[h] + add;
        const delta = target - plannedFlows[h];
        plannedFlows[h] = target;
        simTank += delta;
      } else if (simTank > tankCap) {
        const excess = simTank - tankCap;
        const reducible = Math.max(0, plannedFlows[h] - minOperatingM3h);
        const cut = Math.min(reducible, excess);
        plannedFlows[h] -= cut;
        simTank -= cut;
      }
    }
  }

  // Execute coupled 24h physics + battery SOC + tank level propagation
  const battCap = Math.max(1, config.batteryCapacityKwh);
  const battMinKwh = 0.2 * battCap;
  const battMaxKwh = 0.95 * battCap;
  let battEnergyKwh = 0.5 * battCap;

  const tankCap = Math.max(5, config.tankCapacityM3);
  let tankLevelM3 = 0.45 * tankCap;

  let dailyPvEnergyKwh = 0;
  let dailyThermalRecoveredKwh = 0;
  let dailyWaterM3 = 0;
  let dailyGridImportKwh = 0;
  let peakCellTempC = -50;
  let cellTempSum = 0;
  let feedTempSum = 0;
  let activeHoursCount = 0;
  let totalRoEnergyKwh = 0;
  let tdsWeightedSum = 0;
  let pressureWeightedSum = 0;
  let whoCompliantAllHours = true;

  const hourly: HourlyDispatchRow[] = [];

  for (let h = 0; h < 24; h++) {
    const pt = profile[h];
    const demandM3h = scaledDemands[h];
    let qP = plannedFlows[h];

    if (tankLevelM3 + qP - demandM3h > tankCap) {
      qP = Math.max(0, tankCap - tankLevelM3 + demandM3h);
    }

    const qFeed = qP > 0 ? qP / Math.max(0.15, config.recoveryRatio) : 0;

    const solar = evaluateSolarStep({
      hour: pt.hour,
      irradianceWm2: pt.irradianceWm2,
      ambientTempC: pt.ambientTempC,
      windSpeedMs: pt.windSpeedMs,
      rawFeedTempC: pt.rawFeedTempC,
      feedFlowM3h: qFeed,
      config: effConfig,
    });

    const cellTempC = coolingEnabled ? solar.cellTempCooledC : solar.cellTempUncooledC;
    const pvPowerKw = coolingEnabled ? solar.pvPowerCooledKw : solar.pvPowerUncooledKw;
    const feedTempC = coolingEnabled ? solar.warmFeedTempC : pt.rawFeedTempC;

    const ro = evaluateRoOperatingPoint({
      permeateFlowM3h: qP,
      feedTempC,
      feedSalinityMgL: config.feedSalinityMgL,
      recoveryRatio: config.recoveryRatio,
      membraneAreaM2: config.membraneAreaM2,
      erdEnabled,
    });

    if (qP > 0 && !ro.whoCompliant) {
      whoCompliantAllHours = false;
    }

    const netPower = pvPowerKw - ro.totalPowerKw;
    let gridImportKw = 0;
    let pvCurtailedKw = 0;

    if (netPower >= 0) {
      const maxCharge = Math.max(0, (battMaxKwh - battEnergyKwh) / 0.94);
      const charged = Math.min(netPower, maxCharge, battCap * 0.55);
      battEnergyKwh += charged * 0.94;
      pvCurtailedKw = Math.max(0, netPower - charged);
    } else {
      const deficitKw = -netPower;
      const maxDischarge = Math.max(0, (battEnergyKwh - battMinKwh) * 0.94);
      const discharged = Math.min(deficitKw, maxDischarge, battCap * 0.65);
      battEnergyKwh -= discharged / 0.94;
      gridImportKw = Math.max(0, deficitKw - discharged);
    }

    tankLevelM3 = Math.max(0, Math.min(tankCap, tankLevelM3 + qP - demandM3h));

    dailyPvEnergyKwh += pvPowerKw;
    dailyThermalRecoveredKwh += solar.thermalRecoveredKw;
    dailyWaterM3 += qP;
    dailyGridImportKwh += gridImportKw;
    peakCellTempC = Math.max(peakCellTempC, cellTempC);
    cellTempSum += cellTempC;

    if (qP > 0) {
      activeHoursCount += 1;
      feedTempSum += feedTempC;
      totalRoEnergyKwh += ro.totalPowerKw;
      tdsWeightedSum += ro.permeateTdsMgL * qP;
      pressureWeightedSum += ro.appliedPressureBar * qP;
    }

    hourly.push({
      hour: pt.hour,
      irradianceWm2: pt.irradianceWm2,
      ambientTempC: pt.ambientTempC,
      cellTempC,
      feedTempC,
      pvPowerKw,
      thermalRecoveredKw: solar.thermalRecoveredKw,
      permeateFlowM3h: Number(qP.toFixed(2)),
      demandM3h: Number(demandM3h.toFixed(2)),
      roPowerKw: ro.totalPowerKw,
      gridImportKw: Number(gridImportKw.toFixed(3)),
      pvCurtailedKw: Number(pvCurtailedKw.toFixed(3)),
      batterySocPct: Number(((battEnergyKwh / battCap) * 100).toFixed(1)),
      tankLevelM3: Number(tankLevelM3.toFixed(2)),
      appliedPressureBar: ro.appliedPressureBar,
      secKwhPerM3: ro.secKwhPerM3,
      permeateTdsMgL: ro.permeateTdsMgL,
    });
  }

  return {
    hourly,
    dailyPvEnergyKwh: Number(dailyPvEnergyKwh.toFixed(2)),
    dailyThermalRecoveredKwh: Number(dailyThermalRecoveredKwh.toFixed(2)),
    dailyWaterM3: Number(dailyWaterM3.toFixed(2)),
    dailyDemandM3: Number(totalDemandM3.toFixed(2)),
    dailyGridImportKwh: Number(dailyGridImportKwh.toFixed(2)),
    peakCellTempC: Number(peakCellTempC.toFixed(1)),
    avgCellTempC: Number((cellTempSum / 24).toFixed(1)),
    avgFeedTempC: activeHoursCount > 0 ? Number((feedTempSum / activeHoursCount).toFixed(1)) : profile[12].rawFeedTempC,
    avgSecKwhPerM3: dailyWaterM3 > 0 ? Number((totalRoEnergyKwh / dailyWaterM3).toFixed(3)) : 0,
    avgPermeateTdsMgL: dailyWaterM3 > 0 ? Number((tdsWeightedSum / dailyWaterM3).toFixed(1)) : 0,
    avgPressureBar: dailyWaterM3 > 0 ? Number((pressureWeightedSum / dailyWaterM3).toFixed(2)) : 0,
    whoCompliantAllHours,
  };
}

export function runFullSimulation(profile: HourlyWeatherPoint[], config: SystemConfig): SimulationSummary {
  const baseline = simulateDispatchSchedule({
    profile,
    config,
    coolingEnabled: false,
    erdEnabled: false,
    mpcEnabled: false,
  });

  const optimized = simulateDispatchSchedule({
    profile,
    config,
    coolingEnabled: config.coolingEnabled,
    erdEnabled: config.erdEnabled,
    mpcEnabled: config.mpcEnabled,
  });

  const R = Math.min(0.82, Math.max(0.15, config.recoveryRatio));
  const brineVolumeM3Day = optimized.dailyWaterM3 * ((1 - R) / R);
  const brineTdsKgM3 = (config.feedSalinityMgL / (1 - R)) / 1000;
  const totalBrineSaltsKgDay = brineVolumeM3Day * brineTdsKgM3;
  const mgFraction = config.feedSalinityMgL > 15000 ? 0.037 : 0.018;
  const recoverableSaltKgDay = Number((totalBrineSaltsKgDay * 0.82).toFixed(1));
  const recoverableMgKgDay = Number((totalBrineSaltsKgDay * mgFraction).toFixed(2));

  const pvYieldGainPct =
    baseline.dailyPvEnergyKwh > 0
      ? ((optimized.dailyPvEnergyKwh - baseline.dailyPvEnergyKwh) / baseline.dailyPvEnergyKwh) * 100
      : 0;

  const secReductionPct =
    baseline.avgSecKwhPerM3 > 0
      ? ((baseline.avgSecKwhPerM3 - optimized.avgSecKwhPerM3) / baseline.avgSecKwhPerM3) * 100
      : 0;

  const gridImportReductionPct =
    baseline.dailyGridImportKwh > 0.01
      ? ((baseline.dailyGridImportKwh - optimized.dailyGridImportKwh) / baseline.dailyGridImportKwh) * 100
      : 0;

  const totalBaselineRoEnergyDay = baseline.dailyWaterM3 * baseline.avgSecKwhPerM3;
  const gridSavedVsPureGridKwhDay = Math.max(0, totalBaselineRoEnergyDay - optimized.dailyGridImportKwh);
  const co2AvoidedTonnesYear = Number(((gridSavedVsPureGridKwhDay * 365 * 0.58) / 1000).toFixed(2));

  return {
    baselineUncooled: {
      dailyPvEnergyKwh: baseline.dailyPvEnergyKwh,
      dailyWaterM3: baseline.dailyWaterM3,
      avgSecKwhPerM3: baseline.avgSecKwhPerM3,
      dailyGridImportKwh: baseline.dailyGridImportKwh,
      peakCellTempC: baseline.peakCellTempC,
      avgFeedTempC: baseline.avgFeedTempC,
      avgPermeateTdsMgL: baseline.avgPermeateTdsMgL,
      avgPressureBar: baseline.avgPressureBar,
    },
    optimizedSystem: {
      dailyPvEnergyKwh: optimized.dailyPvEnergyKwh,
      dailyThermalRecoveredKwh: optimized.dailyThermalRecoveredKwh,
      dailyWaterM3: optimized.dailyWaterM3,
      dailyDemandM3: optimized.dailyDemandM3,
      demandCoveragePct:
        optimized.dailyDemandM3 > 0
          ? Number(((optimized.dailyWaterM3 / optimized.dailyDemandM3) * 100).toFixed(1))
          : 100,
      avgSecKwhPerM3: optimized.avgSecKwhPerM3,
      dailyGridImportKwh: optimized.dailyGridImportKwh,
      peakCellTempC: optimized.peakCellTempC,
      avgCellTempDeltaC: Number((baseline.avgCellTempC - optimized.avgCellTempC).toFixed(2)),
      avgFeedTempC: optimized.avgFeedTempC,
      avgPermeateTdsMgL: optimized.avgPermeateTdsMgL,
      avgPressureBar: optimized.avgPressureBar,
      whoCompliantAllHours: optimized.whoCompliantAllHours,
      brineVolumeM3Day: Number(brineVolumeM3Day.toFixed(2)),
      recoverableSaltKgDay,
      recoverableMgKgDay,
    },
    gains: {
      pvYieldGainPct: Number(pvYieldGainPct.toFixed(2)),
      secReductionPct: Number(secReductionPct.toFixed(2)),
      gridImportReductionPct: Number(gridImportReductionPct.toFixed(1)),
      co2AvoidedTonnesYear,
    },
    hourly: optimized.hourly,
  };
}
