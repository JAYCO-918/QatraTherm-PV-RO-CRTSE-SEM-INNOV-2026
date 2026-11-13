import { ControlSidebar } from './ControlSidebar';
import { DispatchCurvesSvg } from './DispatchCurvesSvg';
import { HourlyTelemetryTable } from './HourlyTelemetryTable';
import { SystemSchematicSvg } from './SystemSchematicSvg';
import type {
  HourlyWeatherPoint,
  Language,
  SimulationSummary,
  SystemConfig,
} from '../engine/types';
import { UI_COPY } from '../i18n/translations';

interface SimulationLabViewProps {
  lang: Language;
  config: SystemConfig;
  onChangeConfig: (patch: Partial<SystemConfig>) => void;
  profile: HourlyWeatherPoint[];
  sim: SimulationSummary;
  inspectedHour: number;
  onInspectHour: (hour: number) => void;
  onDownloadResultsCsv: () => void;
}

export function SimulationLabView({
  lang,
  config,
  onChangeConfig,
  profile,
  sim,
  inspectedHour,
  onInspectHour,
  onDownloadResultsCsv,
}: SimulationLabViewProps) {
  const t = UI_COPY[lang].kpis;
  const activeRow = sim.hourly[inspectedHour] ?? sim.hourly[12];
  const rawFeedTempC = (profile[inspectedHour] ?? profile[12]).rawFeedTempC;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">
      <ControlSidebar lang={lang} config={config} onChange={onChangeConfig} />

      <div className="flex-1 min-w-0 w-full space-y-5">
        {/* 4-Column Calibrated KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.pvYield}
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {sim.optimizedSystem.dailyPvEnergyKwh.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1.5">kWh/j</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-blue-700">
              {sim.gains.pvYieldGainPct >= 0 ? '+' : ''}
              {sim.gains.pvYieldGainPct.toFixed(2)}% {t.vsUncooled}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.sec}
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {sim.optimizedSystem.avgSecKwhPerM3.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1.5">kWh/m³</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-cyan-700">
              -{sim.gains.secReductionPct.toFixed(1)}% ({sim.baselineUncooled.avgSecKwhPerM3.toFixed(2)} → {sim.optimizedSystem.avgSecKwhPerM3.toFixed(2)})
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.waterOutput}
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {sim.optimizedSystem.dailyWaterM3.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1.5">m³/j</span>
            </div>
            <div
              className={`text-xs font-mono tabular-nums ${
                sim.optimizedSystem.whoCompliantAllHours ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {sim.optimizedSystem.whoCompliantAllHours ? `✓ ${t.whoOk}` : `▲ ${t.whoAlert}`} ·{' '}
              {sim.optimizedSystem.avgPermeateTdsMgL.toFixed(0)} mg/L
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t.gridAndTemp}
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
              {sim.optimizedSystem.dailyGridImportKwh.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1.5">kWh/j</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-amber-700">
              {t.peakCell}: {sim.optimizedSystem.peakCellTempC.toFixed(1)}°C (-{sim.optimizedSystem.avgCellTempDeltaC.toFixed(1)}°C)
            </div>
          </div>
        </div>

        <SystemSchematicSvg
          lang={lang}
          row={activeRow}
          rawFeedTempC={rawFeedTempC}
          config={config}
          onChangeHour={onInspectHour}
        />

        <DispatchCurvesSvg
          lang={lang}
          hourly={sim.hourly}
          inspectedHour={inspectedHour}
          onInspectHour={onInspectHour}
        />

        <HourlyTelemetryTable
          lang={lang}
          hourly={sim.hourly}
          inspectedHour={inspectedHour}
          onInspectHour={onInspectHour}
          onDownloadCsv={onDownloadResultsCsv}
        />
      </div>
    </div>
  );
}
