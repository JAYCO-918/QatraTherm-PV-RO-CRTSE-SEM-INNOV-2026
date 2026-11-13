import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSolarStep } from './solarPvPhysics';
import {
  computeOsmoticPressureBar,
  computeWaterTcf,
  evaluateRoOperatingPoint,
} from './roDesalinationPhysics';
import { runFullSimulation } from './mpcOptimizer';
import { computeEconomics } from './economics';
import {
  ALGERIAN_SITE_PRESETS,
  DEFAULT_ECONOMIC_PARAMS,
  DEFAULT_SYSTEM_CONFIG,
} from './presets';
import {
  exportWeatherProfileCsv,
  parseHourlyWeatherCsv,
} from './csvTelemetry';

test('Van t Hoff osmotic pressure matches seawater benchmark (~28.5 bar at 35000 mg/L, 25C)', () => {
  const pi = computeOsmoticPressureBar(35000, 25);
  assert.ok(pi > 27.0 && pi < 30.0, `Expected ~28.5 bar, got ${pi}`);
});

test('Arrhenius TCF increases membrane permeability as feedwater warms', () => {
  const tcf20 = computeWaterTcf(20);
  const tcf25 = computeWaterTcf(25);
  const tcf36 = computeWaterTcf(36);
  assert.ok(Math.abs(tcf25 - 1.0) < 1e-6);
  assert.ok(tcf20 < 1.0);
  assert.ok(tcf36 > 1.3 && tcf36 < 1.45, `Expected ~1.37, got ${tcf36}`);
});

test('PV-T cooling lowers silicon cell temperature and increases PV electrical yield', () => {
  const cooled = evaluateSolarStep({
    hour: 12,
    irradianceWm2: 950,
    ambientTempC: 40,
    windSpeedMs: 3.0,
    rawFeedTempC: 23.5,
    feedFlowM3h: 4.5,
    config: { ...DEFAULT_SYSTEM_CONFIG, coolingEnabled: true },
  });

  assert.ok(
    cooled.cellTempCooledC < cooled.cellTempUncooledC - 10,
    `Expected >10C cooling drop, got uncooled=${cooled.cellTempUncooledC}, cooled=${cooled.cellTempCooledC}`
  );
  assert.ok(cooled.pvPowerCooledKw > cooled.pvPowerUncooledKw);
  assert.ok(cooled.warmFeedTempC > 23.5 && cooled.warmFeedTempC <= 43.0);
  assert.ok(cooled.thermalRecoveredKw > 0);
});

test('RO Energy Recovery Device & higher feedwater temperature lower SEC', () => {
  const coldNoErd = evaluateRoOperatingPoint({
    permeateFlowM3h: 2.5,
    feedTempC: 20,
    feedSalinityMgL: 35500,
    recoveryRatio: 0.44,
    membraneAreaM2: 148,
    erdEnabled: false,
  });

  const warmWithErd = evaluateRoOperatingPoint({
    permeateFlowM3h: 2.5,
    feedTempC: 34,
    feedSalinityMgL: 35500,
    recoveryRatio: 0.44,
    membraneAreaM2: 148,
    erdEnabled: true,
  });

  assert.ok(warmWithErd.secKwhPerM3 < coldNoErd.secKwhPerM3 * 0.65);
  assert.ok(warmWithErd.appliedPressureBar < coldNoErd.appliedPressureBar);
  assert.ok(warmWithErd.whoCompliant, 'Seawater permeate TDS should remain below 500 mg/L');
});

test('Full 24h Ouargla simulation yields positive PV gain, lower SEC, and WHO-compliant water', () => {
  const ouargla = ALGERIAN_SITE_PRESETS.find((s) => s.id === 'ouargla-albien')!;
  const sim = runFullSimulation(ouargla.hourlyProfile, DEFAULT_SYSTEM_CONFIG);

  assert.equal(sim.hourly.length, 24);
  assert.ok(sim.gains.pvYieldGainPct > 2.0, `Expected >2% PV yield gain, got ${sim.gains.pvYieldGainPct}`);
  assert.ok(sim.gains.secReductionPct > 10.0, `Expected >10% SEC reduction, got ${sim.gains.secReductionPct}`);
  assert.ok(sim.optimizedSystem.whoCompliantAllHours);
  assert.ok(sim.optimizedSystem.dailyWaterM3 > 20);
  assert.ok(sim.optimizedSystem.dailyGridImportKwh <= sim.baselineUncooled.dailyGridImportKwh);
});

test('Economics engine computes positive NPV and realistic LCOW for Ouargla brackish site', () => {
  const ouargla = ALGERIAN_SITE_PRESETS.find((s) => s.id === 'ouargla-albien')!;
  const sim = runFullSimulation(ouargla.hourlyProfile, DEFAULT_SYSTEM_CONFIG);
  const econ = computeEconomics(DEFAULT_SYSTEM_CONFIG, sim, DEFAULT_ECONOMIC_PARAMS);

  assert.ok(econ.lcowDzdPerM3 > 20 && econ.lcowDzdPerM3 < 200, `Unexpected LCOW: ${econ.lcowDzdPerM3}`);
  assert.ok(econ.lcowDzdPerM3 < econ.baselineLcowDzdPerM3);
  assert.ok(econ.simplePaybackYears > 1 && econ.simplePaybackYears < 10);
  assert.ok(econ.npv15YearsDzd > 0);
  assert.ok(econ.annualBrineValorizationDzd < econ.annualWaterValueDzd);
});

test('CSV weather round-trip parser validates 24h profiles and rejects malformed input', () => {
  const ouargla = ALGERIAN_SITE_PRESETS[0];
  const csv = exportWeatherProfileCsv(ouargla.hourlyProfile);
  const parsed = parseHourlyWeatherCsv(csv);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.profile?.length, 24);
  assert.equal(parsed.profile?.[12].irradianceWm2, ouargla.hourlyProfile[12].irradianceWm2);

  const bad = parseHourlyWeatherCsv('hour,irradiance_wm2\n0,100');
  assert.equal(bad.ok, false);
  assert.ok(bad.error && bad.error.length > 0);
});
